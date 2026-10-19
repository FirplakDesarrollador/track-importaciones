#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
COMEX Track · Importaciones — servidor local (solo librería estándar de Python 3).

- Sirve la página desde la carpeta ./public en http://localhost:8001
- Reenvía /api/<tabla> a la API REST de Supabase, agregando la llave AQUÍ,
  en el servidor. La llave nunca llega al navegador.
- Solo permite las tablas/vista que usa esta app y los métodos GET, POST y PATCH.
  No hay DELETE.

Uso:  python server.py        (lee la llave del archivo .env junto a este script)
"""
import json
import os
import sys
import ssl
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

for _s in (sys.stdout, sys.stderr):  # consola de Windows sin UTF-8
    try:
        _s.reconfigure(errors="replace")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "public"
ENV_FILE = BASE_DIR / ".env"
PORT = int(os.environ.get("COMEX_IMPO_PORT", "8001"))
HOST = "127.0.0.1"

# Recursos permitidos y métodos por recurso
READ_ONLY = {"GET"}
ALLOWED = {
    "v_importaciones_metricas": READ_ONLY,
    "responsables": READ_ONLY,
    "proveedores_impo": READ_ONLY,
    "importaciones": {"GET", "POST", "PATCH"},
}
# Columnas que se pueden escribir en importaciones (leadtime_real_dias es calculada: nunca se envía)
WRITABLE_COLS = {
    "proveedor_id", "prioridad", "numero_po", "responsable_id", "fecha_envio_oc",
    "eta_segun_oc", "eta_estimada_fpk", "estado_eta", "condicion_pago", "valor_po",
    "anticipo1_fecha_pago", "anticipo2_momento", "anticipo2_fecha_pago", "factura_radicada",
    "embarcador", "tipo_carga", "cant_bultos", "peso_kg", "volumen_m3",
    "fecha_bodega_origen", "fecha_embarque", "fecha_llegada_puerto", "fecha_pago_impuestos",
    "fecha_salida_puerto", "fecha_llegada_firplak", "fecha_liquidacion", "fecha_traslado",
    "consolidada_con", "observaciones", "materiales", "updated_at",
}
MAX_BODY = 256 * 1024


def fail(msg):
    print("\n" + "=" * 70 + "\n  ERROR: " + msg + "\n" + "=" * 70 + "\n")
    if os.name == "nt" and sys.stdin and sys.stdin.isatty():
        try:
            input("Presiona Enter para cerrar...")
        except Exception:
            pass
    sys.exit(1)


def load_env():
    if not ENV_FILE.exists():
        fail("No encontré el archivo .env junto a server.py\n"
             f"  Carpeta: {BASE_DIR}\n"
             "  Copia .env.example como .env y pega allí SUPABASE_URL y SUPABASE_KEY.")
    cfg = {}
    for raw in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        cfg[k.strip()] = v.strip().strip('"').strip("'")
    url = cfg.get("SUPABASE_URL", "").rstrip("/")
    key = cfg.get("SUPABASE_KEY", "")
    if not url or not key or "PEGA_AQUI" in key:
        fail("El archivo .env no tiene SUPABASE_URL y SUPABASE_KEY completos.\n"
             "  Ejemplo:\n    SUPABASE_URL=https://ahcrtxmlotzagtwwyvny.supabase.co\n"
             "    SUPABASE_KEY=<tu llave>")
    if not (url.startswith("https://") or url.startswith("http://127.0.0.1") or url.startswith("http://localhost")):
        fail("SUPABASE_URL debe empezar por https://")
    anon = cfg.get("SUPABASE_ANON_KEY", "")
    return url, key, anon


SUPABASE_URL, SUPABASE_KEY, SUPABASE_ANON_KEY = load_env()
SSL_CTX = ssl.create_default_context()
ALLOWED_HOSTS = {f"localhost:{PORT}", f"127.0.0.1:{PORT}"}


class Handler(SimpleHTTPRequestHandler):
    server_version = "ComexImpo/1.0"

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(WEB_DIR), **kw)

    def log_message(self, fmt, *args):  # log corto, sin cabeceras
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # ---------- utilidades ----------
    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _host_ok(self):
        # Evita que otra página web (o DNS rebinding) use este servidor
        return (self.headers.get("Host") or "") in ALLOWED_HOSTS

    def _origin_ok(self):
        origin = self.headers.get("Origin")
        if origin is None:
            return True
        return origin in {f"http://{h}" for h in ALLOWED_HOSTS}

    # ---------- rutas ----------
    def do_GET(self):
        if not self._host_ok():
            return self._json(403, {"message": "Host no permitido"})
        if self.path.startswith("/api/"):
            return self._proxy("GET")
        if self.path in ("/", ""):
            self.path = "/index.html"
        return super().do_GET()

    def do_HEAD(self):
        if not self._host_ok() or self.path.startswith("/api/"):
            return self._json(405, {"message": "No permitido"})
        return super().do_HEAD()

    def do_POST(self):
        return self._proxy("POST")

    def do_PATCH(self):
        return self._proxy("PATCH")

    def do_DELETE(self):
        return self._json(405, {"message": "Borrar no está permitido en esta aplicación."})

    do_PUT = do_DELETE

    def _verify_user(self):
        """Verifica el token de Supabase Auth. Devuelve None si es válido o (código, cuerpo)."""
        auth = self.headers.get("Authorization") or ""
        parts = auth.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return 401, {"code": "AUTH", "message": "Inicia sesión para continuar."}
        req = urllib.request.Request(f"{SUPABASE_URL}/auth/v1/user", headers={
            "apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {parts[1]}"})
        try:
            with urllib.request.urlopen(req, timeout=15, context=SSL_CTX if SUPABASE_URL.startswith("https") else None) as r:
                user = json.loads(r.read().decode("utf-8") or "{}")
        except urllib.error.HTTPError:
            return 401, {"code": "AUTH", "message": "La sesión no es válida o venció. Vuelve a iniciar sesión."}
        except Exception:
            return 502, {"message": "No pude verificar la sesión con Supabase."}
        email = str(user.get("email") or "").lower()
        if not email:
            return 401, {"code": "AUTH", "message": "La sesión no es válida. Vuelve a iniciar sesión."}
        return None

    def _proxy(self, method):
        if not self._host_ok() or not self._origin_ok():
            return self._json(403, {"message": "Origen no permitido"})
        parsed = urllib.parse.urlsplit(self.path)
        if not parsed.path.startswith("/api/"):
            return self._json(404, {"message": "No encontrado"})
        resource = parsed.path[len("/api/"):]
        if resource == "config":
            if method != "GET":
                return self._json(405, {"message": "No permitido"})
            if not SUPABASE_ANON_KEY:
                return self._json(200, {"authRequired": False})
            return self._json(200, {"authRequired": True, "supabaseUrl": SUPABASE_URL,
                                    "supabaseAnonKey": SUPABASE_ANON_KEY})
        if SUPABASE_ANON_KEY:
            err = self._verify_user()
            if err:
                return self._json(*err)
        if resource not in ALLOWED:
            return self._json(403, {"message": f"Recurso no permitido: {resource}"})
        if method not in ALLOWED[resource]:
            return self._json(405, {"message": f"Método {method} no permitido en {resource}"})

        query = parsed.query
        data = None
        if method in ("POST", "PATCH"):
            if "application/json" not in (self.headers.get("Content-Type") or ""):
                return self._json(415, {"message": "Se espera JSON"})
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0 or length > MAX_BODY:
                return self._json(413, {"message": "Cuerpo vacío o demasiado grande"})
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
            except Exception:
                return self._json(400, {"message": "JSON inválido"})
            if not isinstance(payload, dict):
                return self._json(400, {"message": "Se espera un solo registro"})
            extra = set(payload) - WRITABLE_COLS
            if extra:
                return self._json(400, {"message": "Columnas no permitidas: " + ", ".join(sorted(extra))})
            if method == "PATCH":
                qs = urllib.parse.parse_qs(query)
                ids = qs.get("id", [])
                if len(ids) != 1 or not ids[0].startswith("eq.") or len(qs) != 1:
                    return self._json(400, {"message": "PATCH requiere exactamente un filtro id=eq.<id>"})
            if method == "POST" and query:
                return self._json(400, {"message": "POST no admite parámetros"})
            data = json.dumps(payload).encode("utf-8")

        url = f"{SUPABASE_URL}/rest/v1/{resource}" + (f"?{query}" if query else "")
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Accept": "application/json",
        }
        if data is not None:
            headers["Content-Type"] = "application/json"
            headers["Prefer"] = "return=representation"
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30, context=SSL_CTX if url.startswith("https") else None) as r:
                body, code = r.read(), r.status
        except urllib.error.HTTPError as e:
            body, code = e.read(), e.code
        except Exception as e:
            return self._json(502, {"message": f"No pude conectar con Supabase: {e.__class__.__name__}"})
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    if not (WEB_DIR / "index.html").exists():
        fail(f"No encuentro la carpeta public/ con index.html en {BASE_DIR}")
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    print("COMEX Track · Importaciones")
    print(f"  Abierto en:  http://localhost:{PORT}")
    print(f"  Supabase:    {SUPABASE_URL}")
    print("  Inicio de sesión: " + ("activado (Supabase Auth)" if SUPABASE_ANON_KEY else "desactivado (solo uso local)"))
    print("  (Ctrl+C para detener)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")


if __name__ == "__main__":
    main()
