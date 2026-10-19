// COMEX Track · Importaciones — función serverless de Vercel para /api/*
// Reproduce la lista de permisos de server.py. La llave de Supabase solo vive
// en las variables de entorno de Vercel y nunca llega al navegador.
'use strict';
const crypto = require('crypto');

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

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a), 'utf8').digest();
  const hb = crypto.createHash('sha256').update(String(b), 'utf8').digest();
  return crypto.timingSafeEqual(ha, hb) && String(a).length === String(b).length;
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const method = (req.method || 'GET').toUpperCase();
  const APP_PASSWORD = process.env.APP_PASSWORD || '';
  const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

  // Falla cerrada: sin contraseña configurada no se atiende nada
  if (!APP_PASSWORD) {
    return send(res, 503, { code: 'NO_PASSWORD', message: 'El servidor no tiene configurada la contraseña de acceso (APP_PASSWORD). Configúrala en Vercel y vuelve a desplegar.' });
  }
  if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_URL.startsWith('https://')) {
    return send(res, 503, { message: 'Faltan SUPABASE_URL (https://...) o SUPABASE_KEY en las variables de entorno de Vercel.' });
  }
  const given = req.headers['x-app-password'] || '';
  if (!safeEqual(given, APP_PASSWORD)) {
    return send(res, 401, { code: 'AUTH', message: 'Contraseña incorrecta o faltante.' });
  }

  if (method === 'DELETE' || method === 'PUT') return send(res, 405, { message: 'Borrar no está permitido en esta aplicación.' });
  if (!['GET', 'POST', 'PATCH'].includes(method)) return send(res, 405, { message: 'No permitido' });

  // Ruta: /api/<recurso>?... (la regla de vercel.json puede añadir __path=<recurso>)
  const u = new URL(req.url || '/', 'http://x');
  const params = new URLSearchParams(u.search);
  let resource = params.get('__path');
  params.delete('__path');
  if (resource === null) {
    if (!u.pathname.startsWith('/api/')) return send(res, 404, { message: 'No encontrado' });
    resource = decodeURIComponent(u.pathname.slice('/api/'.length));
  }
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
