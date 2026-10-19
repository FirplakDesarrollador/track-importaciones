// COMEX Track · Importaciones — función serverless de Vercel para /api/*
// Reproduce la lista de permisos de server.py. La llave de Supabase solo vive
// en las variables de entorno de Vercel y nunca llega al navegador.
'use strict';

const READ_ONLY = ['GET'];
const ALLOWED = {
  v_importaciones_metricas: READ_ONLY,
  responsables: READ_ONLY,
  proveedores_impo: READ_ONLY,
  importaciones: ['GET', 'POST', 'PATCH'],
};
// leadtime_real_dias es calculada: nunca se envía
const WRITABLE_COLS = new Set([
  'proveedor_id', 'prioridad', 'numero_po', 'responsable_id', 'fecha_envio_oc',
  'eta_segun_oc', 'eta_estimada_fpk', 'estado_eta', 'condicion_pago', 'valor_po',
  'anticipo1_fecha_pago', 'anticipo2_momento', 'anticipo2_fecha_pago', 'factura_radicada',
  'embarcador', 'tipo_carga', 'cant_bultos', 'peso_kg', 'volumen_m3',
  'fecha_bodega_origen', 'fecha_embarque', 'fecha_llegada_puerto', 'fecha_pago_impuestos',
  'fecha_salida_puerto', 'fecha_llegada_firplak', 'fecha_liquidacion', 'fecha_traslado',
  'consolidada_con', 'observaciones', 'updated_at',
]);
const MAX_BODY = 256 * 1024;

function send(res, code, obj) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.end(body);
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Verifica el token de Supabase Auth del usuario. Devuelve {email} o {error: [code, obj]}
async function verifyUser(req, url, anon) {
  const m = /^Bearer\s+(\S+)$/i.exec(String(req.headers['authorization'] || ''));
  if (!m) return { error: [401, { code: 'AUTH', message: 'Inicia sesión para continuar.' }] };
  let r;
  try {
    r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${m[1]}` }, signal: AbortSignal.timeout(15000) });
  } catch (e) { return { error: [502, { message: 'No pude verificar la sesión con Supabase.' }] }; }
  if (r.status !== 200) return { error: [401, { code: 'AUTH', message: 'La sesión no es válida o venció. Vuelve a iniciar sesión.' }] };
  let user; try { user = await r.json(); } catch { user = null; }
  const email = String((user && user.email) || '').toLowerCase();
  if (!email) return { error: [401, { code: 'AUTH', message: 'La sesión no es válida. Vuelve a iniciar sesión.' }] };
  const allowed = String(process.env.ALLOWED_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (allowed.length && !allowed.includes(email)) return { error: [403, { code: 'FORBIDDEN', message: `El usuario ${email} no tiene acceso a esta aplicación.` }] };
  return { email };
}

module.exports = async function handler(req, res) {
  const method = (req.method || 'GET').toUpperCase();
  const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

  // Ruta: /api/<recurso>?... (la regla de vercel.json añade __path=<recurso>)
  const u = new URL(req.url || '/', 'http://x');
  const params = new URLSearchParams(u.search);
  let resource = params.get('__path');
  params.delete('__path');
  if (resource === null) {
    if (!u.pathname.startsWith('/api/')) return send(res, 404, { message: 'No encontrado' });
    resource = decodeURIComponent(u.pathname.slice('/api/'.length));
  }

  // Falla cerrada: sin la configuración completa no se atiende nada
  if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_KEY || !SUPABASE_ANON_KEY) {
    return send(res, 503, { code: 'NO_CONFIG', message: 'El servidor no está configurado: faltan SUPABASE_URL, SUPABASE_KEY o SUPABASE_ANON_KEY en las variables de entorno de Vercel.' });
  }
  // Configuración pública para el navegador (la llave anon es pública por diseño; nunca SUPABASE_KEY)
  if (resource === 'config') {
    if (method !== 'GET') return send(res, 405, { message: 'No permitido' });
    return send(res, 200, { authRequired: true, supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY });
  }
  const auth = await verifyUser(req, SUPABASE_URL, SUPABASE_ANON_KEY);
  if (auth.error) return send(res, auth.error[0], auth.error[1]);

  if (method === 'DELETE' || method === 'PUT') return send(res, 405, { message: 'Borrar no está permitido en esta aplicación.' });
  if (!['GET', 'POST', 'PATCH'].includes(method)) return send(res, 405, { message: 'No permitido' });

  if (!Object.prototype.hasOwnProperty.call(ALLOWED, resource)) return send(res, 403, { message: `Recurso no permitido: ${resource}` });
  if (!ALLOWED[resource].includes(method)) return send(res, 405, { message: `Método ${method} no permitido en ${resource}` });

  const query = params.toString();
  let data;
  if (method === 'POST' || method === 'PATCH') {
    if (!String(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, { message: 'Se espera JSON' });
    let payload;
    try {
      if (req.body !== undefined && req.body !== null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        payload = req.body;
        if (JSON.stringify(payload).length > MAX_BODY) return send(res, 413, { message: 'Cuerpo vacío o demasiado grande' });
      } else {
        let raw;
        if (typeof req.body === 'string') raw = req.body;
        else if (Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
        else { try { raw = await readRaw(req); } catch { return send(res, 413, { message: 'Cuerpo vacío o demasiado grande' }); } }
        if (!raw || raw.length > MAX_BODY) return send(res, 413, { message: 'Cuerpo vacío o demasiado grande' });
        payload = JSON.parse(raw);
      }
    } catch { return send(res, 400, { message: 'JSON inválido' }); }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return send(res, 400, { message: 'Se espera un solo registro' });
    const extra = Object.keys(payload).filter(k => !WRITABLE_COLS.has(k)).sort();
    if (extra.length) return send(res, 400, { message: 'Columnas no permitidas: ' + extra.join(', ') });
    if (method === 'PATCH') {
      const keys = [...new Set([...params.keys()])];
      const ids = params.getAll('id');
      if (ids.length !== 1 || !ids[0].startsWith('eq.') || keys.length !== 1) return send(res, 400, { message: 'PATCH requiere exactamente un filtro id=eq.<id>' });
    }
    if (method === 'POST' && query) return send(res, 400, { message: 'POST no admite parámetros' });
    data = JSON.stringify(payload);
  }

  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' };
  if (data !== undefined) { headers['Content-Type'] = 'application/json'; headers.Prefer = 'return=representation'; }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${resource}${query ? '?' + query : ''}`, {
      method, headers, body: data, signal: AbortSignal.timeout(30000),
    });
    return send(res, r.status, await r.text());
  } catch (e) {
    return send(res, 502, { message: `No pude conectar con Supabase: ${e.name || 'Error'}` });
  }
};
