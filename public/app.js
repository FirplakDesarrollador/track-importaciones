/* COMEX Track · Importaciones — front-end. Los datos pasan por /api (server.py en local o la función de Vercel); el navegador solo conoce la llave anon para iniciar sesión. */
'use strict';

// ------------------------------------------------------------------ catálogos (= check constraints)
const PRIORIDADES = ['Normal', 'Prioritaria', 'Estratégica'];
const ESTADOS = ['En producción', 'En tránsito', 'En aduana', 'En conteo', 'En liquidación', 'Terminada', 'Cancelada'];
const CERRADOS = ['Terminada', 'Cancelada'];
const ANTICIPO2 = ['Despacho', 'Contra BL', 'Credito/Factoring'];
const TIPOS_CARGA = ['LCL', 'FCL20', 'FCL40', 'Air', 'Express'];
const COND_PAGO_SUG = ['100', '100 BL', 'Credito', '30/70 Despacho', '30/70 BL', '50/50', 'Factoring'];
const EMBARCADOR_SUG = ['Magnum', 'Pasarex', 'Licarga', 'Ultrabox', 'MSC', 'Loft', 'Deplog', 'Amazon', 'Aliexpress', 'Otro'];

// Los 30 campos de la lista SharePoint "Seguimiento Importaciones 2026", en su orden
const FIELDS = [
  { k: 'proveedor_id', sp: 'Proveedor', label: 'Proveedor', t: 'proveedor', req: true, sec: 'po' },
  { k: 'prioridad', sp: 'Prioridad', label: 'Prioridad', t: 'select', opts: PRIORIDADES, req: true, sec: 'po' },
  { k: 'numero_po', sp: '#PO', label: '# PO', t: 'text', req: true, sec: 'po', ph: 'Ej: 1745-1' },
  { k: 'responsable_id', sp: 'Responsable', label: 'Responsable', t: 'responsable', sec: 'po' },
  { k: 'fecha_envio_oc', sp: 'Fecha_Envio_OC', label: 'Fecha envío OC', t: 'date', sec: 'po' },
  { k: 'eta_segun_oc', sp: 'ETA_Segun_OC', label: 'ETA según OC', t: 'date', sec: 'po' },
  { k: 'eta_estimada_fpk', sp: 'ETA_Estimada_FPK', label: 'ETA estimada FPK', t: 'date', sec: 'po' },
  { k: 'estado_eta', sp: 'Estado_ETA', label: 'Estado ETA', t: 'select', opts: ESTADOS, req: true, sec: 'po' },
  { k: 'condicion_pago', sp: 'Condicion_Pago', label: 'Condición de pago', t: 'text', list: COND_PAGO_SUG, sec: 'pago' },
  { k: 'valor_po', sp: 'Valor_PO', label: 'Valor PO', t: 'number', step: '0.01', sec: 'pago' },
  { k: 'anticipo1_fecha_pago', sp: 'Anticipo1_Fechapago', label: 'Anticipo 1 · fecha de pago', t: 'date', sec: 'pago' },
  { k: 'anticipo2_momento', sp: 'Anticipo2_Momento', label: 'Anticipo 2 · momento', t: 'select', opts: ANTICIPO2, blank: true, sec: 'pago' },
  { k: 'anticipo2_fecha_pago', sp: 'Anticipo2_FechaPago', label: 'Anticipo 2 · fecha de pago', t: 'date', sec: 'pago' },
  { k: 'factura_radicada', sp: 'Factura_Radicada', label: 'Factura radicada', t: 'bool', sec: 'pago' },
  { k: 'factura_radicada_fecha', sp: 'Factura_Radicada_Fecha', label: 'Factura radicada · fecha', t: 'date', sec: 'pago' },
  { k: 'embarcador', sp: 'Embarcador', label: 'Embarcador', t: 'text', list: EMBARCADOR_SUG, sec: 'carga' },
  { k: 'tipo_carga', sp: 'Tipo_Carga', label: 'Tipo de carga', t: 'select', opts: TIPOS_CARGA, blank: true, sec: 'carga' },
  { k: 'cant_bultos', sp: 'Can_Bultos', label: 'Cantidad de bultos', t: 'text', sec: 'carga', ph: 'Ej: 48 bultos, 3 pallets' },
  { k: 'peso_kg', sp: 'Peso_KG', label: 'Peso (kg)', t: 'number', step: '0.01', sec: 'carga' },
  { k: 'volumen_m3', sp: 'Volumen_M3', label: 'Volumen (m³)', t: 'number', step: '0.001', sec: 'carga' },
  { k: 'fecha_bodega_origen', sp: 'Fecha_Bodega_Orig', label: 'Fecha bodega origen', t: 'date', sec: 'hitos', hito: 'Bodega origen' },
  { k: 'fecha_embarque', sp: 'Fecha_Embarque', label: 'Fecha embarque', t: 'date', sec: 'hitos', hito: 'Embarque' },
  { k: 'fecha_llegada_puerto', sp: 'Fecha_Llegada_Puerto', label: 'Fecha llegada a puerto', t: 'date', sec: 'hitos', hito: 'Llegada a puerto' },
  { k: 'fecha_pago_impuestos', sp: 'Fecha_Pago_Impuestos', label: 'Fecha pago de impuestos', t: 'date', sec: 'hitos', hito: 'Pago de impuestos' },
  { k: 'fecha_levante', sp: 'Fecha_Levante', label: 'Fecha levante', t: 'date', sec: 'hitos', hito: 'Levante' },
  { k: 'fecha_salida_puerto', sp: 'Fecha_Salida_Puerto', label: 'Fecha salida de puerto', t: 'date', sec: 'hitos', hito: 'Salida de puerto' },
  { k: 'fecha_llegada_firplak', sp: 'Fecha_Llegada_Firplak', label: 'Fecha llegada a Firplak', t: 'date', sec: 'hitos', hito: 'Llegada a Firplak' },
  { k: 'fecha_entrega_conteo', sp: 'Fecha_Entrega_Conteo', label: 'Fecha entrega conteo', t: 'date', sec: 'hitos', hito: 'Entrega conteo' },
  { k: 'fecha_liquidacion', sp: 'Fecha_Liquidacion', label: 'Fecha liquidación', t: 'date', sec: 'hitos', hito: 'Liquidación' },
  { k: 'fecha_traslado', sp: 'Fecha_Traslado', label: 'Fecha traslado', t: 'date', sec: 'hitos', hito: 'Traslado' },
  { k: 'consolidada_con', sp: 'Consolidada_Con', label: 'Consolidada con', t: 'text', sec: 'otros', ph: 'Otras PO del mismo embarque' },
  { k: 'leadtime_real_dias', sp: 'Leadtime_Real', label: 'Leadtime real (días)', t: 'computed', sec: 'otros' },
  { k: 'observaciones', sp: 'Observaciones', label: 'Observaciones', t: 'textarea', sec: 'otros' },
  { k: 'materiales', sp: 'Materiales OC', label: 'Materiales de la OC', t: 'materiales', sec: 'mat' },
];
const HITOS = FIELDS.filter(f => f.hito);
// Fechas que guardan su fuente en <campo>_fuente (manual, correo:<id>, aduanimex:<archivo>…) y quedan en importaciones_historial
const CON_FUENTE = [...HITOS.map(h => h.k), 'anticipo1_fecha_pago', 'anticipo2_fecha_pago', 'factura_radicada_fecha'];
const fuenteTxt = f => !f ? '' : f === 'manual' ? 'Registro manual' : f.startsWith('correo:') ? 'Correo' : f.startsWith('aduanimex:') ? 'Reporte Aduanimex' : f === 'regla_liquidacion' ? 'Regla: igual a la liquidación' : f === 'regla_llegada+1habil' ? 'Regla: día hábil siguiente a la llegada' : f;

// ------------------------------------------------------------------ pagos: hitos paralelos (parte B)
// Corren al lado de la línea logística; no cambian el estado ni el orden de los 10 hitos.
function pagosDe(r) {
  const emb = !!r.fecha_embarque;
  const a2Esperado = r.anticipo2_momento === 'Despacho' || r.anticipo2_momento === 'Contra BL';
  return [
    { k: 'anticipo1_fecha_pago', nombre: 'Anticipo 1', corto: 'A1', fecha: r.anticipo1_fecha_pago, fuente: r.anticipo1_fecha_pago_fuente,
      estado: r.anticipo1_fecha_pago ? 'hecho' : 'pendiente', nota: r.condicion_pago ? 'Condición: ' + r.condicion_pago : '' },
    { k: 'anticipo2_fecha_pago', nombre: 'Anticipo 2', corto: 'A2', fecha: r.anticipo2_fecha_pago, fuente: r.anticipo2_fecha_pago_fuente,
      estado: r.anticipo2_fecha_pago ? 'hecho' : (a2Esperado && emb ? 'revisar' : r.anticipo2_momento ? 'pendiente' : 'na'),
      nota: r.anticipo2_momento ? 'Momento: ' + r.anticipo2_momento : 'Sin segundo anticipo definido' },
    { k: 'factura_radicada_fecha', nombre: 'Factura radicada', corto: 'F', fecha: r.factura_radicada_fecha, fuente: r.factura_radicada_fecha_fuente,
      estado: r.factura_radicada ? 'hecho' : (r.fecha_llegada_firplak ? 'revisar' : 'pendiente'), nota: r.factura_radicada && !r.factura_radicada_fecha ? 'Radicada (sin fecha registrada)' : '' },
  ];
}
const PAGO_TXT = { hecho: 'Hecho', pendiente: 'Pendiente', revisar: 'Revisar', na: 'No aplica' };
const PAGO_CLS = { hecho: 'bg-emerald-50 text-emerald-800 border-emerald-200', pendiente: 'bg-slate-50 text-slate-700 border-slate-200',
  revisar: 'bg-amber-50 text-amber-800 border-amber-200', na: 'bg-white text-slate-600 border-slate-200' };
function pagosMini(r) {
  return `<div class="mt-1 flex flex-wrap gap-1">${pagosDe(r).filter(p => p.estado !== 'na').map(p =>
    `<span class="px-1.5 py-0.5 rounded border text-[11px] font-semibold ${PAGO_CLS[p.estado]}" title="${esc(p.nombre)}: ${PAGO_TXT[p.estado]}${p.fecha ? ' · ' + fdate(p.fecha) : ''}">${p.corto} ${p.estado === 'hecho' ? '✓' : p.estado === 'revisar' ? '!' : '·'}</span>`).join('')}</div>`;
}
function renderPagos(r) {
  $('pagos').innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-3">${pagosDe(r).map(p => `
    <div class="p-3 rounded-xl border ${PAGO_CLS[p.estado]}">
      <div class="flex items-center justify-between"><h4 class="text-sm font-bold text-slate-900">${esc(p.nombre)}</h4><span class="text-xs font-semibold">${PAGO_TXT[p.estado]}</span></div>
      <div class="mt-1 text-sm text-slate-800">${p.fecha ? fdate(p.fecha) : 'Sin fecha'}</div>
      ${p.nota ? `<div class="text-xs text-slate-600 mt-0.5">${esc(p.nota)}</div>` : ''}
      ${p.estado === 'revisar' ? `<div class="text-xs text-amber-800 mt-0.5">${p.k === 'factura_radicada_fecha' ? 'La mercancía ya llegó y la factura no figura radicada.' : 'Ya embarcó y no hay fecha de este pago.'}</div>` : ''}
      ${p.fuente ? `<div class="text-xs text-slate-600 mt-0.5">Fuente: ${esc(fuenteTxt(p.fuente))}</div>` : ''}
    </div>`).join('')}</div>`;
}
const CAMPO_NOMBRE = k => (FIELDS.find(f => f.k === k) || { label: k }).label;
async function renderHistorial(r) {
  const box = $('historial'); box.innerHTML = '<p class="text-sm text-slate-600" role="status">Cargando historial…</p>';
  let h = [];
  try { h = await api('importaciones_historial?select=campo,valor_anterior,valor_nuevo,fuente,registrado_por,registrado_at&importacion_id=eq.' + encodeURIComponent(r.id) + '&order=registrado_at.desc&limit=50'); }
  catch (e) { if (S.current && S.current.id === r.id) box.innerHTML = '<p class="text-sm text-slate-600">No pude leer el historial: ' + esc(friendlyError(e)) + '</p>'; return; }
  if (!S.current || S.current.id !== r.id) return;
  const fv = v => v == null ? '—' : /^\d{4}-\d{2}-\d{2}$/.test(v) ? fdate(v) : v === 'true' ? 'Sí' : v === 'false' ? 'No' : esc(v);
  box.innerHTML = (h || []).length ? `<div class="overflow-x-auto"><table class="ktbl"><thead><tr><th>Cuándo</th><th>Hito o pago</th><th>Antes</th><th>Ahora</th><th>Fuente</th><th>Quién</th></tr></thead><tbody>${h.map(x => `<tr>
      <td class="whitespace-nowrap">${esc(new Date(x.registrado_at).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</td>
      <td>${esc(CAMPO_NOMBRE(x.campo))}</td><td>${fv(x.valor_anterior)}</td><td class="font-semibold">${fv(x.valor_nuevo)}</td><td>${esc(fuenteTxt(x.fuente))}</td><td>${esc(x.registrado_por || '—')}</td></tr>`).join('')}</tbody></table></div>`
    : '<p class="text-sm text-slate-600">Todavía no hay cambios registrados. El historial empezó el 10/11/2026: desde entonces queda cada fecha que se registra o corrige, con su fuente.</p>';
}

// ------------------------------------------------------------------ estado calculado y alertas por tramo (parte A)
// Días máximos esperando el siguiente hito, según el último hito registrado.
// P90 histórico de las PO que ya cerraron cada tramo (cálculo del 10/11/2026), aprobado por Catalina.
const UMBRALES_ESTANCAMIENTO = {
  diasPorTramo: {
    envio_oc: 70,               // Envío OC → Bodega origen (producción del proveedor). Mediana 29 d, P90 71 d.
    fecha_bodega_origen: 18,    // Bodega origen → Embarque. Mediana 8 d, P90 18 d.
    fecha_embarque: { maritimo: 45, aereo: 5 }, // Embarque → Llegada a puerto. LCL/FCL P90 44 d; Air/Express P90 2 d.
    fecha_llegada_puerto: 19,   // Llegada a puerto → Pago de impuestos. Mediana 7 d, P90 19 d.
    fecha_pago_impuestos: 2,    // Pago de impuestos → Levante. P90 1 d (muestra de 14 PO).
    fecha_levante: 5,           // Levante → Salida de puerto. P90 4 d (muestra de 13 PO).
    fecha_salida_puerto: 3,     // Salida de puerto → Llegada a Firplak. P90 3 d.
    fecha_llegada_firplak: 10,  // Llegada a Firplak → Entrega conteo. Sin historia aún: se usa el P90 de llegada → liquidación (10 d).
    fecha_entrega_conteo: 10,   // Entrega conteo → Liquidación. Sin historia aún (campo nuevo del 10/11/2026); revisar con datos.
    fecha_liquidacion: 2,       // Liquidación → Traslado. Casi siempre el mismo día; máximo 4 d.
    fecha_traslado: null,       // Último hito: no alerta.
  },
  // Pasado este límite sin hitos nuevos y sin ediciones, lo más probable es que la PO ya avanzó
  // y el tracker no se actualizó: se muestra aparte, en gris, como "Sin actualizar".
  diasSinActualizar: 60,
};
const AEREO = ['Air', 'Express'];
function ultimoHito(r) { let u = null; HITOS.forEach((h, i) => { if (r[h.k]) u = { i, h, fecha: r[h.k] }; }); return u; }
// El estado sale de las fechas. El valor manual (estado_eta) solo se usa como respaldo:
// Cancelada y Terminada sin traslado registrado. La entrega de conteo separa En conteo de En liquidación.
function estadoPor(r) {
  const m = r.estado_eta, u = ultimoHito(r), k = u ? u.h.k : null;
  if (m === 'Cancelada') return 'Cancelada';
  if (k === 'fecha_traslado' || m === 'Terminada') return 'Terminada';
  switch (k) {
    case null: case 'fecha_bodega_origen': return 'En producción';
    case 'fecha_embarque': case 'fecha_salida_puerto': return 'En tránsito';
    case 'fecha_llegada_puerto': case 'fecha_pago_impuestos': case 'fecha_levante': return 'En aduana';
    case 'fecha_llegada_firplak': return 'En conteo';
    case 'fecha_entrega_conteo': return 'En liquidación';
    case 'fecha_liquidacion': return 'En liquidación';
  }
  return m || 'En producción';
}
const etaRef = r => r.eta_estimada_fpk || r.eta_segun_oc || null;
const vencidaPor = r => !CERRADOS.includes(estadoPor(r)) && !r.fecha_llegada_firplak && !!etaRef(r) && etaRef(r) < todayBog();
function evaluarEstancamiento(r) {
  if (CERRADOS.includes(estadoPor(r))) return { nivel: 'cerrada' };
  const u = ultimoHito(r), desde = u ? u.fecha : r.fecha_envio_oc, sig = u ? HITOS[u.i + 1] : HITOS[0];
  if (!desde) return { nivel: 'sin_fecha', sig, u };
  const dias = ddiff(todayBog(), desde);
  let umbral = UMBRALES_ESTANCAMIENTO.diasPorTramo[u ? u.h.k : 'envio_oc'];
  if (umbral && typeof umbral === 'object') umbral = AEREO.includes(r.tipo_carga) ? umbral.aereo : umbral.maritimo;
  const base = { dias, umbral, sig, u };
  if (umbral == null || dias <= umbral) return { ...base, nivel: 'ok' };
  const lim = UMBRALES_ESTANCAMIENTO.diasSinActualizar;
  const edit = r.updated_at ? ddiff(todayBog(), String(r.updated_at).slice(0, 10)) : dias;
  if (dias >= lim && edit >= lim) return { ...base, nivel: 'sin_actualizar' };
  return { ...base, nivel: 'atrasada' };
}
// Número para ordenar: el primer número de la PO (1829 en "1829-1853 PARCIAL 2"); el resto desempata.
const poNum = r => { const m = String(r.numero_po || '').match(/\d+/); return m ? Number(m[0]) : 0; };
const WRITABLE = FIELDS.filter(f => f.t !== 'computed').map(f => f.k);
const SECTIONS = [
  ['po', 'Datos de la PO', 'file-text'], ['pago', 'Pago', 'wallet'], ['carga', 'Carga', 'boxes'],
  ['hitos', 'Hitos del flujo (en orden)', 'milestone'], ['otros', 'Otros', 'message-square'], ['mat', 'Materiales de la OC', 'package'],
];

// ------------------------------------------------------------------ estado
const S = { rows: [], proveedores: [], provFallback: false, responsables: [], current: null, editing: null, tab: 'list' };

// ------------------------------------------------------------------ utilidades
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const todayBog = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
const dnum = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const ddiff = (a, b) => (a && b) ? Math.round(dnum(a) - dnum(b)) : null;  // a - b en días
const fdate = s => s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '—';
const fnum = (v, d = 2) => (v === null || v === undefined || v === '') ? '—' : Number(v).toLocaleString('es-CO', { maximumFractionDigits: d });
const pct = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fmes = ym => `${MESES[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
// ------------------------------------------------------------------ materiales (jsonb: [{codigo, descripcion, cantidad, unidad}])
const matList = r => Array.isArray(r?.materiales) ? r.materiales : [];
const matText = r => matList(r).map(m => `${m.codigo || ''} ${m.descripcion || ''}`).join(' ');
function matSummary(r) {
  const m = matList(r); if (!m.length) return '';
  const first = m[0].descripcion || m[0].codigo || '';
  return `<div class="mat-sum" title="${esc(m.map(x => `${x.codigo || ''} · ${x.descripcion || ''} · ${x.cantidad ?? ''} ${x.unidad || ''}`).join('\n'))}">📦 ${esc(first)}${m.length > 1 ? ` <b>+${m.length - 1}</b>` : ''}</div>`;
}
function matTable(r) {
  const m = matList(r);
  if (!m.length) return '<span class="text-slate-400">— Sin materiales registrados</span>';
  return `<table class="mat-tbl"><thead><tr><th>Código SAP</th><th>Descripción</th><th class="num">Cantidad</th></tr></thead><tbody>${
    m.map(x => `<tr><td class="mono">${esc(x.codigo || '—')}</td><td>${esc(x.descripcion || '')}</td><td class="num">${fnum(x.cantidad, 3)}${x.unidad ? ' ' + esc(x.unidad) : ''}</td></tr>`).join('')}</tbody></table>`;
}
function matRowHtml(x = {}) {
  return `<div class="mat-row"><input class="inp mono" data-m="codigo" placeholder="Código SAP" value="${esc(x.codigo || '')}">
    <input class="inp" data-m="descripcion" placeholder="Descripción" value="${esc(x.descripcion || '')}">
    <input class="inp" type="number" min="0" step="any" data-m="cantidad" placeholder="Cant." value="${x.cantidad ?? ''}">
    <input class="inp" data-m="unidad" placeholder="UN" value="${esc(x.unidad || '')}">
    <button type="button" class="mat-del" title="Quitar línea">✕</button></div>`;
}
function matSetEditor(list) {
  const box = $('in_materiales'); if (!box) return;
  box.querySelector('.mat-rows').innerHTML = (list || []).map(matRowHtml).join('');
}
function matReadEditor() {
  const rows = [...document.querySelectorAll('#in_materiales .mat-rows .mat-row')].map(el => {
    const g = k => el.querySelector(`[data-m="${k}"]`).value.trim();
    const c = g('cantidad');
    return { codigo: g('codigo') || null, descripcion: g('descripcion') || null, cantidad: c === '' ? null : Number(c), unidad: g('unidad') || null };
  }).filter(x => x.codigo || x.descripcion);
  return rows.length ? rows : null;
}
const icons = () => window.lucide && lucide.createIcons();

function toast(msg, ok = true) {
  const t = $('toast');
  t.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`;
  t.textContent = msg;
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('hidden'), 4000);
}

// ------------------------------------------------------------------ inicio de sesión (Supabase Auth)
let SB = null;          // cliente supabase-js (solo para iniciar sesión; los datos van por /api)
let AUTH_REQUIRED = true;
let loaded = false;
function showLogin(msg) {
  $('loginMsg').textContent = msg || '';
  $('loginMsg').classList.toggle('hidden', !msg);
  $('loginOverlay').classList.remove('hidden');
  $('userBox').classList.add('hidden'); $('userBox').classList.remove('flex');
  setTimeout(() => $('loginEmail').focus(), 0);
}
function showApp(email) {
  $('loginOverlay').classList.add('hidden'); $('loginMsg').textContent = ''; $('loginMsg').classList.add('hidden');
  if (email) { $('userEmail').textContent = email; $('userBox').classList.remove('hidden'); $('userBox').classList.add('flex'); }
}
async function getToken() {
  if (!SB) return '';
  const { data } = await SB.auth.getSession();
  return (data && data.session && data.session.access_token) || '';
}
async function submitLogin(ev) {
  ev.preventDefault();
  const email = $('loginEmail').value.trim(), password = $('loginPwd').value;
  if (!email || !password || !SB) return;
  $('loginBtn').disabled = true; $('loginBtn').textContent = 'Entrando…';
  const { data, error } = await SB.auth.signInWithPassword({ email, password });
  $('loginBtn').disabled = false; $('loginBtn').textContent = 'Entrar';
  if (error) {
    const m = /invalid login/i.test(error.message) ? 'Correo o contraseña incorrectos.'
      : /not confirmed/i.test(error.message) ? 'El correo no está confirmado.' : 'No pude iniciar sesión: ' + error.message;
    return showLogin(m);
  }
  $('loginPwd').value = '';
  showApp(data.user && data.user.email);
  loadAll();
}
async function logout() {
  if (SB) await SB.auth.signOut({ scope: 'local' }).catch(() => {});
  S.rows = []; loaded = false;
  showLogin('');
}
async function initAuth() {
  let cfg;
  try {
    const r = await fetch('/api/config', { cache: 'no-store' });
    cfg = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(cfg.message || `Error ${r.status}`);
  } catch (e) {
    $('errorBannerText').textContent = 'No pude leer la configuración del servidor: ' + e.message;
    $('errorBanner').classList.remove('hidden');
    return;
  }
  AUTH_REQUIRED = cfg.authRequired !== false;
  if (!AUTH_REQUIRED) { loadAll(); return; }   // modo local sin inicio de sesión
  SB = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'comex-impo-auth' },
  });
  SB.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) showLogin($('loginMsg').textContent);
  });
  const { data } = await SB.auth.getSession();
  if (data && data.session) { showApp(data.session.user.email); loadAll(); }
  else showLogin('');
}

async function api(path, opts = {}) {
  const headers = opts.body ? { 'Content-Type': 'application/json' } : {};
  const token = await getToken(); if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch('/api/' + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = null; const txt = await r.text();
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  if (r.status === 401 && data && data.code === 'AUTH') {
    if (SB) await SB.auth.signOut({ scope: 'local' }).catch(() => {});
    showLogin(data.message || 'Vuelve a iniciar sesión.');
    const e = new Error('Se requiere iniciar sesión.'); e.status = 401; e.auth = true; throw e;
  }
  if (r.status === 403 && data && data.code === 'FORBIDDEN') {
    if (SB) await SB.auth.signOut({ scope: 'local' }).catch(() => {});
    showLogin(data.message);
    const e = new Error(data.message); e.status = 403; e.auth = true; throw e;
  }
  if (!r.ok) { const e = new Error((data && data.message) || `Error ${r.status}`); e.status = r.status; e.data = data; throw e; }
  return data;
}

function friendlyError(e) {
  const d = e.data || {};
  if (e.auth) return e.message;
  if (d.code === 'NO_CONFIG') return d.message;
  if (d.code === '23505') return 'Ya existe una PO con ese número (#PO debe ser único).';
  if (d.code === '23514') return 'Algún valor no está permitido por la base (lista de opciones): ' + String(d.message || '').split('\n')[0].replace(/^ERROR:\s*/, '');
  if (d.code === '23503') return 'El proveedor o el responsable no existen en la base.';
  if (d.code === '42501' || e.status === 401 || e.status === 403)
    return 'La llave del servidor no tiene permiso para escribir en Supabase. Consulta el README.';
  if (d.code === 'PGRST204' || d.code === '42703') return 'Columna desconocida en la base: ' + (d.message || '');
  return e.message || 'Error desconocido';
}

// Badges con el mismo lenguaje visual de COMEX Track
const ESTADO_CLS = {
  'En producción': 'bg-amber-50 text-amber-700 border-amber-200', 'En tránsito': 'bg-blue-50 text-blue-700 border-blue-200',
  'En aduana': 'bg-violet-50 text-violet-700 border-violet-200', 'En conteo': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'En liquidación': 'bg-indigo-50 text-indigo-700 border-indigo-200', 'Terminada': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancelada': 'bg-slate-100 text-slate-500 border-slate-200',
};
const PRIO_CLS = { 'Normal': 'bg-slate-100 text-slate-600', 'Prioritaria': 'bg-orange-100 text-orange-700', 'Estratégica': 'bg-fuchsia-100 text-fuchsia-700' };
const badgeEstado = e => `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${ESTADO_CLS[e] || ''}"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>${esc(e)}</span>`;
const badgePrio = p => `<span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${PRIO_CLS[p] || PRIO_CLS.Normal}">${esc(p || 'Normal')}</span>`;
const badgeVencida = () => `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[11px] font-bold">⚠ Vencida</span>`;

// Días vs ETA: activas → hoy vs ETA estimada FPK (o ETA OC), igual que la marca "vencida" de la vista;
// llegadas → llegada Firplak vs ETA según OC (columna dias_vs_eta_oc de la vista)
function diasVsEta(r) {
  if (r.dias_vs_eta_oc !== null && r.dias_vs_eta_oc !== undefined) {
    const d = r.dias_vs_eta_oc;
    return d <= 0 ? `<span class="text-emerald-700 font-semibold" title="Llegó vs ETA según OC">${d === 0 ? 'En fecha' : d + ' d'} ✓</span>`
      : `<span class="text-rose-700 font-semibold" title="Llegó vs ETA según OC">+${d} d tarde</span>`;
  }
  if (CERRADOS.includes(estadoPor(r))) return '<span class="text-slate-500">—</span>';
  const ref = etaRef(r);
  if (!ref) return '<span class="text-slate-400">Sin ETA</span>';
  const d = ddiff(todayBog(), ref);
  return d > 0 ? `<span class="inline-flex px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">+${d} d vencida</span>`
    : `<span class="text-slate-600">faltan ${-d} d</span>`;
}

// ------------------------------------------------------------------ carga de datos
async function loadAll() {
  $('errorBanner').classList.add('hidden');
  try {
    const [rows, resp] = await Promise.all([
      api('v_importaciones_metricas?select=*&order=numero_po.asc'),
      api('responsables?select=id,nombre,activo&order=nombre.asc'),
    ]);
    S.rows = (rows || []).map(r => ({ ...r, _estado: estadoPor(r), _venc: vencidaPor(r), _est: evaluarEstancamiento(r) }));
    S.responsables = (resp || []).filter(r => r.activo !== false);
    let prov = [];
    try { prov = await api('proveedores_impo?select=id,nombre,pais,responsable_id,respaldo_id,frecuencia,activo&order=nombre.asc'); } catch { prov = []; }
    prov = (prov || []).filter(p => p.activo !== false);
    if (prov.length) { S.proveedores = prov; S.provFallback = false; }
    else { S.proveedores = deriveProveedores(S.rows); S.provFallback = true; }
    $('lastLoad').textContent = 'Actualizado ' + new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' }) + ' (hora Bogotá)';
    fillFilters(); renderStats(); renderList(); renderKpi();
    if (S.current) { const c = S.rows.find(r => r.id === S.current.id); if (c) { S.current = c; renderDetail(); } }
  } catch (e) {
    if (e.auth) return;
    $('errorBannerText').textContent = 'No pude leer los datos: ' + friendlyError(e);
    $('errorBanner').classList.remove('hidden');
  }
  icons();
}

// Si la llave no puede leer proveedores_impo (RLS/permisos), se arma la lista desde la vista.
// Responsable sugerido = el de la PO más reciente de ese proveedor.
function deriveProveedores(rows) {
  const m = new Map();
  [...rows].sort((a, b) => (a.fecha_envio_oc || '').localeCompare(b.fecha_envio_oc || '')).forEach(r => {
    m.set(r.proveedor_id, { id: r.proveedor_id, nombre: r.proveedor, pais: r.pais, responsable_id: r.responsable_id });
  });
  return [...m.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function fillSelect(el, items, firstLabel, keep = true) {
  const prev = el.value;
  el.innerHTML = (firstLabel !== null ? `<option value="">${esc(firstLabel)}</option>` : '') +
    items.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
  if (keep && [...el.options].some(o => o.value === prev)) el.value = prev;
}
function fillFilters() {
  fillSelect($('fResponsable'), S.responsables.map(r => [r.id, r.nombre]), 'Todos los Responsables');
  fillSelect($('fProveedor'), S.proveedores.map(p => [p.id, p.nombre]), 'Todos los Proveedores');
  fillSelect($('fPrioridad'), PRIORIDADES.map(p => [p, p]), 'Todas las Prioridades');
  fillSelect($('fEstado'), ESTADOS.map(p => [p, p]), 'Todos los estados');
}

function renderStats() {
  const act = S.rows.filter(r => !CERRADOS.includes(r._estado));
  $('statTotal').textContent = S.rows.length;
  $('statActivas').textContent = act.length;
  $('statTerminadas').textContent = S.rows.filter(r => r._estado === 'Terminada').length;
  $('statVencidas').textContent = S.rows.filter(r => r._venc).length;
  $('statAtrasadas').textContent = S.rows.filter(r => r._est.nivel === 'atrasada').length;
}

// ------------------------------------------------------------------ lista
function badgeEstanc(ev) {
  if (ev.nivel === 'atrasada') return `<span class="inline-flex items-center px-2 py-0.5 rounded-md border bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-bold whitespace-nowrap" title="Atrasada: supera el límite de ${ev.umbral} días para este tramo">${ev.dias} d · límite ${ev.umbral}</span>`;
  if (ev.nivel === 'sin_actualizar') return `<span class="inline-flex items-center px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200 text-[11px] font-semibold whitespace-nowrap" title="Sin hitos ni ediciones hace ${ev.dias} días: probablemente ya avanzó. Actualiza las fechas.">Sin actualizar · ${ev.dias} d</span>`;
  if (ev.nivel === 'ok') return `<span class="text-slate-600 text-[11px] whitespace-nowrap">${ev.dias} d${ev.umbral != null ? ' de ' + ev.umbral : ''}</span>`;
  return '';
}
function hitoActualHtml(r) {
  const ev = r._est;
  if (ev.nivel === 'cerrada') return '<span class="text-slate-500">—</span>';
  const u = ev.u;
  return `<div class="text-slate-800 font-medium whitespace-nowrap">${u ? esc(u.h.hito) : 'Sin hitos'}</div>
    <div class="text-[11px] text-slate-600 whitespace-nowrap">${u ? fdate(u.fecha) : (r.fecha_envio_oc ? 'OC ' + fdate(r.fecha_envio_oc) : '')}${ev.sig ? ' → ' + esc(ev.sig.hito) : ''}</div>
    <div class="mt-0.5">${badgeEstanc(ev)}</div>`;
}
const NIVEL_ORDEN = { atrasada: 0, sin_actualizar: 2, ok: 3, sin_fecha: 3, cerrada: 4 };
function sortRows(rows, modo) {
  const ref = r => etaRef(r) || '9999';
  const num = (a, b) => (poNum(b) - poNum(a)) || String(b.numero_po).localeCompare(String(a.numero_po), 'es', { numeric: true });
  if (modo === 'eta') return rows.sort((a, b) => ref(a).localeCompare(ref(b)) || num(a, b));
  if (modo === 'reciente') return rows.sort(num);
  // Atención: vencidas, luego atrasadas (más días sobre el límite primero), luego sin actualizar, luego por ETA
  const exceso = r => r._est.umbral != null && r._est.dias != null ? r._est.dias - r._est.umbral : 0;
  return rows.sort((a, b) => (b._venc - a._venc) || (NIVEL_ORDEN[a._est.nivel] - NIVEL_ORDEN[b._est.nivel]) || (exceso(b) - exceso(a)) || ref(a).localeCompare(ref(b)) || num(a, b));
}
function clearFilters() {
  ['fSearch', 'fResponsable', 'fProveedor', 'fPrioridad', 'fEstado'].forEach(id => { $(id).value = ''; });
  ['fTodas', 'fSoloVencidas', 'fSoloAtrasadas'].forEach(id => { $(id).checked = false; });
  renderList();
}
function renderList() {
  const q = $('fSearch').value.trim().toLowerCase();
  const fr = $('fResponsable').value, fp = $('fProveedor').value, fpr = $('fPrioridad').value, fe = $('fEstado').value;
  const todas = $('fTodas').checked || CERRADOS.includes(fe), soloV = $('fSoloVencidas').checked, soloA = $('fSoloAtrasadas').checked;
  const rows = S.rows.filter(r =>
    (todas || !CERRADOS.includes(r._estado)) && (!fr || r.responsable_id === fr) && (!fp || r.proveedor_id === fp) &&
    (!fpr || r.prioridad === fpr) && (!fe || r._estado === fe) && (!soloV || r._venc) && (!soloA || r._est.nivel === 'atrasada') &&
    (!q || [r.numero_po, r.proveedor, r.embarcador, r.observaciones, r.consolidada_con, matText(r)].some(x => (x || '').toLowerCase().includes(q))));
  sortRows(rows, $('fOrden').value);
  $('listCount').textContent = `${rows.length} PO mostradas`;
  $('listBody').innerHTML = rows.length ? rows.map(r => `
    <tr class="hover:bg-slate-50 cursor-pointer ${r._venc ? 'row-vencida' : ''}" data-id="${esc(r.id)}">
      <td class="px-3 py-2.5 font-bold text-slate-900 min-w-[110px] max-w-[160px] break-words">${r._venc ? '<span class="text-rose-600 text-[11px]" title="Vencida">⚠</span> ' : ''}${esc(r.numero_po)}<div class="mt-1 font-normal">${badgePrio(r.prioridad)}</div></td>
      <td class="px-3 py-2.5 min-w-[180px] max-w-[260px]"><div class="font-medium text-slate-800 text-xs sm:text-[13px]">${esc(r.proveedor)}</div><div class="text-[11px] text-slate-500">${esc(r.pais || '')}</div>${matSummary(r)}</td>
      <td class="px-3 py-2.5 text-slate-700">${esc(r.responsable || '—')}</td>
      <td class="px-3 py-2.5 whitespace-nowrap">${badgeEstado(r._estado)}${CERRADOS.includes(r._estado) ? '' : pagosMini(r)}</td>
      <td class="px-3 py-2.5 text-xs">${hitoActualHtml(r)}</td>
      <td class="px-3 py-2.5 whitespace-nowrap text-slate-700"><div title="ETA estimada FPK">${fdate(r.eta_estimada_fpk)}</div><div class="text-[11px] text-slate-600" title="ETA según OC">OC ${fdate(r.eta_segun_oc)}</div></td>
      <td class="px-3 py-2.5 text-slate-600"><div>${esc(r.embarcador || '—')}</div>${r.tipo_carga ? `<span class="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-600">${esc(r.tipo_carga)}</span>` : ''}</td>
      <td class="px-3 py-2.5 whitespace-nowrap text-xs">${diasVsEta(r)}</td>
    </tr>`).join('')
    : `<tr><td colspan="8" class="px-4 py-10 text-center text-slate-600">No hay PO con esos filtros. <button type="button" class="ml-2 text-blue-700 font-semibold underline" data-clear>Limpiar filtros</button></td></tr>`;
}

// ------------------------------------------------------------------ detalle
function openDetail(id) {
  S.current = S.rows.find(r => r.id === id) || null;
  renderDetail(); showTab('detail');
}
function fieldDisplay(f, r) {
  const v = r[f.k];
  switch (f.t) {
    case 'proveedor': return esc(r.proveedor);
    case 'responsable': return esc(r.responsable || '—');
    case 'date': return fdate(v);
    case 'number': return f.k === 'valor_po' ? (v == null ? '—' : '$ ' + fnum(v)) : fnum(v, 3);
    case 'bool': return v ? '<span class="text-emerald-700">✓ Sí</span>' : '<span class="text-slate-500">No</span>';
    case 'computed': return v == null ? '<span class="text-slate-400">— (falta llegada a Firplak)</span>' : `${v} días <span class="text-[10px] text-slate-400 font-normal">(calculado)</span>`;
    case 'materiales': return matTable(r);
    case 'select': return f.k === 'estado_eta' ? badgeEstado(v) : f.k === 'prioridad' ? badgePrio(v) : esc(v || '—');
    default: return v ? esc(v) : '—';
  }
}
function renderDetail() {
  const r = S.current;
  $('detailEmpty').classList.toggle('hidden', !!r); $('detailContent').classList.toggle('hidden', !r);
  if (!r) return;
  $('dPo').textContent = r.numero_po; $('dProveedor').textContent = r.proveedor; $('dPais').textContent = r.pais || '—';
  $('dEstado').innerHTML = badgeEstado(r._estado) + (r.estado_eta && r.estado_eta !== r._estado ? ` <span class="text-[11px] text-slate-600" title="El estado se calcula con las fechas; el valor manual queda como respaldo">(manual: ${esc(r.estado_eta)})</span>` : '');
  $('dPrioridad').innerHTML = badgePrio(r.prioridad);
  $('dVencida').innerHTML = (r._venc ? badgeVencida() : '') + ' ' + badgeEstanc(r._est);
  const lt = r.leadtime_real_dias;
  $('dLeadBadge').innerHTML = `
    <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Leadtime real</div>
    <div class="text-xl font-extrabold text-slate-900">${lt == null ? '—' : lt + ' d'}</div>
    <div class="text-[11px] ${r.llego_a_tiempo === true ? 'text-emerald-700' : r.llego_a_tiempo === false ? 'text-rose-700' : 'text-slate-400'} font-semibold">
      ${r.llego_a_tiempo === true ? `A tiempo vs ETA OC (${r.dias_vs_eta_oc} d)` : r.llego_a_tiempo === false ? `Tarde vs ETA OC (+${r.dias_vs_eta_oc} d)` : 'Sin llegada a Firplak'}</div>`;
  renderStepper(r); renderPagos(r); renderHistorial(r);
  $('detailFields').innerHTML = FIELDS.map((f, i) => `
    <div class="fld ${f.k === 'observaciones' || f.k === 'materiales' ? 'sm:col-span-2 lg:col-span-3' : ''}">
      <div class="k">${i + 1}. ${esc(f.label)} <span class="text-slate-300">· ${esc(f.sp)}</span></div>
      <div class="v">${fieldDisplay(f, r)}</div>
    </div>`).join('');
  $('dMeta').textContent = `Creada: ${r.created_at ? new Date(r.created_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '—'} · Última edición: ${r.updated_at ? new Date(r.updated_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '—'} (hora Bogotá)`;
  icons();
}
function orderWarnings(obj) {
  const w = []; let prev = null;
  HITOS.forEach(h => {
    const v = obj[h.k]; if (!v) return;
    if (prev && v < prev.v) w.push(`«${h.hito}» (${fdate(v)}) es anterior a «${prev.h.hito}» (${fdate(prev.v)}).`);
    if (!prev || v >= prev.v) prev = { h, v };
  });
  return w;
}
function renderStepper(r) {
  const filled = HITOS.map(h => !!r[h.k]);
  const last = filled.lastIndexOf(true);
  const closed = CERRADOS.includes(estadoPor(r));
  const nextIdx = closed ? -1 : filled.indexOf(false, Math.max(0, last));
  let prevDate = r.fecha_envio_oc;
  const cards = HITOS.map((h, i) => {
    const v = r[h.k], done = !!v, isNext = i === nextIdx, isLast = i === last && !closed;
    const gap = done && prevDate ? ddiff(v, prevDate) : null;
    if (done) prevDate = v;
    const cls = isLast ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300 ring-offset-1'
      : done ? 'bg-emerald-50/50 border-emerald-300' : isNext ? 'bg-white border-dashed border-blue-300 shadow-sm' : 'bg-slate-50/60 border-slate-200 opacity-60';
    const tag = isLast ? 'Último' : done ? 'Completado' : isNext ? 'Siguiente' : 'Pendiente';
    const tagCls = isLast ? 'text-blue-700 font-bold' : done ? 'text-emerald-700' : isNext ? 'text-blue-600' : 'text-slate-400';
    return `<div class="p-3 rounded-xl border flex flex-col justify-between ${cls}">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? (isLast ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white') : isNext ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}">${done && !isLast ? '✓' : i + 1}</span>
          <span class="text-[10px] font-semibold uppercase tracking-wider ${tagCls}">${tag}</span>
        </div>
        <h4 class="text-xs font-bold text-slate-800 leading-snug">${esc(h.hito)}</h4>
      </div>
      <div class="mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
        ${done ? `<div class="text-slate-700 font-medium">${fdate(v)}</div>${r[h.k + '_fuente'] && r[h.k + '_fuente'] !== 'manual' ? `<div class="text-[11px] text-slate-600">${esc(fuenteTxt(r[h.k + '_fuente']))}</div>` : ''}<div class="text-[10px] ${gap < 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}">${gap === null ? '' : (i === 0 ? 'desde OC: ' : '') + (gap >= 0 ? '+' : '') + gap + ' d'}</div>`
        : `<span class="text-slate-400 italic">${isNext ? 'Por registrar' : 'En espera'}</span>`}
      </div></div>`;
  }).join('');
  $('stepper').innerHTML = `<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 stepper-10 gap-3">${cards}</div>`;
  const w = orderWarnings(r);
  $('stepperWarn').classList.toggle('hidden', !w.length);
  $('stepperWarn').innerHTML = w.length ? '<strong>Fechas fuera de orden:</strong> ' + w.map(esc).join(' ') : '';
}

// ------------------------------------------------------------------ formulario
function inputHtml(f) {
  const id = 'in_' + f.k, base = 'class="inp" id="' + id + '" name="' + f.k + '"';
  const req = f.req ? ' <span class="text-rose-500">*</span>' : '';
  let ctl;
  switch (f.t) {
    case 'proveedor': ctl = `<select ${base}><option value="">— Escoge el proveedor —</option>${S.proveedores.map(p => `<option value="${esc(p.id)}">${esc(p.nombre)}${p.pais ? ' · ' + esc(p.pais) : ''}</option>`).join('')}</select>`; break;
    case 'responsable': ctl = `<select ${base}><option value="">— Sin asignar —</option>${S.responsables.map(r => `<option value="${esc(r.id)}">${esc(r.nombre)}</option>`).join('')}</select><div id="respHint" class="text-[11px] text-slate-400 mt-1"></div>`; break;
    case 'select': ctl = `<select ${base}>${f.blank ? '<option value="">—</option>' : ''}${f.opts.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select>`; break;
    case 'bool': ctl = `<select ${base}><option value="false">No</option><option value="true">Sí</option></select>`; break;
    case 'date': ctl = `<input type="date" ${base}>`; break;
    case 'number': ctl = `<input type="number" min="0" step="${f.step}" ${base}>`; break;
    case 'textarea': ctl = `<textarea rows="3" ${base}></textarea>`; break;
    case 'materiales': ctl = `<div id="${id}" class="mat-editor"><div class="mat-row mat-head"><span>Código SAP</span><span>Descripción</span><span>Cantidad</span><span>Unidad</span><span></span></div><div class="mat-rows"></div><button type="button" class="mat-add" id="btnMatAdd">+ Agregar línea</button></div>`; break;
    case 'computed': ctl = `<div class="inp bg-slate-100 text-slate-500" id="${id}">Se calcula solo: llegada a Firplak − envío OC</div>`; break;
    default: ctl = `<input type="text" ${base} ${f.ph ? `placeholder="${esc(f.ph)}"` : ''} ${f.list ? `list="dl_${f.k}"` : ''}>${f.list ? `<datalist id="dl_${f.k}">${f.list.map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : ''}`;
  }
  const wide = (f.t === 'textarea' || f.t === 'materiales') ? 'md:col-span-2 lg:col-span-4' : f.t === 'proveedor' ? 'md:col-span-2' : '';
  return `<div class="${wide}"><label class="lbl" for="${id}">${esc(f.label)}${req}</label>${ctl}</div>`;
}
function buildForm() {
  $('poForm').innerHTML = SECTIONS.map(([s, title, ic]) => `
    <div><div class="sec-title"><i data-lucide="${ic}" class="w-3.5 h-3.5"></i>${esc(title)}</div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">${FIELDS.filter(f => f.sec === s).map(inputHtml).join('')}</div></div>`).join('');
  $('in_proveedor_id').addEventListener('change', onProveedorChange);
  $('btnMatAdd').addEventListener('click', () => $('in_materiales').querySelector('.mat-rows').insertAdjacentHTML('beforeend', matRowHtml()));
  $('in_materiales').addEventListener('click', e => { if (e.target.closest('.mat-del')) e.target.closest('.mat-row').remove(); });
  const note = $('provFallbackNote');
  note.classList.toggle('hidden', !S.provFallback);
  note.textContent = S.provFallback ? 'Aviso: la llave actual no puede leer la tabla de proveedores (proveedores_impo). La lista de proveedores se arma desde las PO cargadas y el responsable sugerido es el de la PO más reciente de cada proveedor; revísalo antes de guardar.' : '';
  icons();
}
function onProveedorChange() {
  const p = S.proveedores.find(x => x.id === $('in_proveedor_id').value);
  if (!S.editing && p) {
    $('in_responsable_id').value = p.responsable_id || '';
    const n = S.responsables.find(r => r.id === p.responsable_id);
    $('respHint').textContent = n ? `Asignado por reparto: ${n.nombre}${S.provFallback ? ' (estimado)' : ''}. Puedes cambiarlo.` : '';
  }
}
function openForm(row) {
  S.editing = row || null;
  buildForm();
  $('formErrors').classList.add('hidden');
  if (row) {
    FIELDS.forEach(f => { const el = $('in_' + f.k); if (!el || f.t === 'computed') return; if (f.t === 'materiales') { matSetEditor(matList(row)); return; } const v = row[f.k]; el.value = v === null || v === undefined ? '' : String(v); });
    $('in_leadtime_real_dias').textContent = row.leadtime_real_dias == null ? 'Se calcula solo: llegada a Firplak − envío OC' : `${row.leadtime_real_dias} días (calculado)`;
    $('formTitle').textContent = `Editar PO ${row.numero_po}`;
    $('formSubtitle').textContent = `${row.proveedor} · solo se guardan los campos que cambies.`;
    $('btnSaveLabel').textContent = 'Guardar cambios'; $('navFormLabel').textContent = 'Editar PO';
  } else {
    $('in_prioridad').value = 'Normal'; $('in_estado_eta').value = 'En producción'; $('in_factura_radicada').value = 'false';
    $('in_fecha_envio_oc').value = todayBog();
    $('formTitle').textContent = 'Registrar Nueva PO de Importación';
    $('formSubtitle').textContent = 'Al escoger el proveedor se asigna el responsable según el reparto (puedes cambiarlo).';
    $('btnSaveLabel').textContent = 'Guardar PO'; $('navFormLabel').textContent = 'Nueva PO';
  }
  showTab('form');
}
function readForm() {
  const o = {};
  WRITABLE.forEach(k => {
    const f = FIELDS.find(x => x.k === k), el = $('in_' + k); let v = el.value;
    if (f.t === 'materiales') { o[k] = matReadEditor(); return; }
    if (f.t === 'bool') v = v === 'true';
    else if (f.t === 'number') v = v === '' ? null : Number(v);
    else { v = (v || '').trim(); if (v === '') v = null; }
    o[k] = v;
  });
  return o;
}
function validate(o) {
  const errs = [], warns = [];
  document.querySelectorAll('#poForm .err').forEach(e => e.classList.remove('err'));
  const bad = (k, m) => { errs.push(m); $('in_' + k)?.classList.add('err'); };
  if (!o.proveedor_id) bad('proveedor_id', 'Escoge el proveedor.');
  if (!o.numero_po) bad('numero_po', 'El # PO es obligatorio.');
  else if (S.rows.some(r => r.numero_po.trim().toLowerCase() === o.numero_po.toLowerCase() && (!S.editing || r.id !== S.editing.id)))
    bad('numero_po', `Ya existe la PO ${o.numero_po}.`);
  if (!PRIORIDADES.includes(o.prioridad)) bad('prioridad', 'Prioridad no válida.');
  if (!ESTADOS.includes(o.estado_eta)) bad('estado_eta', 'Estado no válido.');
  if (o.tipo_carga && !TIPOS_CARGA.includes(o.tipo_carga)) bad('tipo_carga', 'Tipo de carga no válido.');
  if (o.anticipo2_momento && !ANTICIPO2.includes(o.anticipo2_momento)) bad('anticipo2_momento', 'Momento de anticipo 2 no válido.');
  ['valor_po', 'peso_kg', 'volumen_m3'].forEach(k => { if (o[k] !== null && (isNaN(o[k]) || o[k] < 0)) bad(k, `${FIELDS.find(f => f.k === k).label}: número no válido.`); });
  if (o.fecha_llegada_firplak && o.fecha_envio_oc && o.fecha_llegada_firplak < o.fecha_envio_oc)
    bad('fecha_llegada_firplak', 'La llegada a Firplak no puede ser anterior al envío de la OC (el leadtime quedaría negativo).');
  warns.push(...orderWarnings(o));
  if (o.fecha_bodega_origen && o.fecha_envio_oc && o.fecha_bodega_origen < o.fecha_envio_oc) warns.push('La fecha de bodega origen es anterior al envío de la OC.');
  if (o.estado_eta === 'Terminada' && !o.fecha_llegada_firplak) warns.push('Está «Terminada» pero no tiene fecha de llegada a Firplak: no contará en el KPI.');
  if (o.eta_segun_oc && o.fecha_envio_oc && o.eta_segun_oc < o.fecha_envio_oc) warns.push('La ETA según OC es anterior al envío de la OC.');
  return { errs, warns };
}
function confirmWarnings(warns) {
  return new Promise(res => {
    $('modalConfirmBody').innerHTML = '<ul class="list-disc pl-5 space-y-1">' + warns.map(w => `<li>${esc(w)}</li>`).join('') + '</ul><p class="text-xs text-slate-500 pt-2">Si las fechas son correctas así, puedes guardar de todos modos.</p>';
    $('modalConfirm').classList.remove('hidden');
    const done = v => { $('modalConfirm').classList.add('hidden'); $('modalConfirmYes').onclick = $('modalConfirmNo').onclick = null; res(v); };
    $('modalConfirmYes').onclick = () => done(true); $('modalConfirmNo').onclick = () => done(false);
  });
}
// Construye el cuerpo exacto que se envía (exportada para pruebas)
function buildPayload(o, original) {
  if (!original) {
    const body = {}; Object.entries(o).forEach(([k, v]) => { if (v !== null) body[k] = v; });
    CON_FUENTE.forEach(k => { if (body[k]) body[k + '_fuente'] = 'manual'; });
    return body;
  }
  const body = {};
  WRITABLE.forEach(k => {
    const a = original[k] ?? null, b = o[k] ?? null;
    const same = (k === 'materiales') ? JSON.stringify(a) === JSON.stringify(b) : (typeof b === 'number' && a !== null) ? Number(a) === b : String(a) === String(b);
    if (!same) body[k] = b;
  });
  CON_FUENTE.forEach(k => { if (k in body) body[k + '_fuente'] = body[k] ? 'manual' : null; });
  if (Object.keys(body).length) body.updated_at = new Date().toISOString();
  return body;
}
async function saveForm() {
  const o = readForm();
  // Regla de traslado (la aplica también la base, trigger a_trg_importaciones_traslado): si hay liquidación y no traslado, queda Terminada.
  if (o.fecha_liquidacion && !o.fecha_traslado && o.estado_eta !== 'Cancelada') o.estado_eta = 'Terminada';
  if (!['Cancelada', 'Terminada'].includes(o.estado_eta)) o.estado_eta = estadoPor(o);   // el estado sale de las fechas
  const { errs, warns } = validate(o);
  const box = $('formErrors');
  if (errs.length) { box.innerHTML = '<strong>Corrige antes de guardar:</strong><ul class="list-disc pl-5 mt-1">' + errs.map(e => `<li>${esc(e)}</li>`).join('') + '</ul>'; box.classList.remove('hidden'); return; }
  box.classList.add('hidden');
  if (warns.length && !(await confirmWarnings(warns))) return;
  const body = buildPayload(o, S.editing);
  if (S.editing && !Object.keys(body).length) { toast('No hay cambios para guardar.'); return; }
  const btn = $('btnSaveForm'); btn.disabled = true; btn.classList.add('opacity-60');
  try {
    let saved;
    if (S.editing) saved = await api('importaciones?id=eq.' + encodeURIComponent(S.editing.id), { method: 'PATCH', body });
    else saved = await api('importaciones', { method: 'POST', body });
    const id = Array.isArray(saved) && saved[0] ? saved[0].id : S.editing?.id;
    if (S.editing && Array.isArray(saved) && !saved.length) throw Object.assign(new Error('No se actualizó ninguna fila (¿permisos?).'), { status: 403 });
    toast(S.editing ? `PO ${o.numero_po} actualizada.` : `PO ${o.numero_po} creada.`);
    S.editing = null; $('navFormLabel').textContent = 'Nueva PO';
    await loadAll();
    if (id) openDetail(id); else showTab('list');
  } catch (e) {
    box.innerHTML = '<strong>No se pudo guardar:</strong> ' + esc(friendlyError(e)); box.classList.remove('hidden');
  } finally { btn.disabled = false; btn.classList.remove('opacity-60'); }
}


// ------------------------------------------------------------------ dividir en parcial
// Convención: "N" → se renombra a "N-1" y se crea "N-2"; "N-k" → se crea "N-(máx+1)".
// Nombres no estándar ("1866-1876 ENVIO 2"): base = texto antes del primer "-" si es numérico; el nombre se sugiere y es editable.
function splitNames(src) {
  const po = src.numero_po.trim(), all = new Set(S.rows.map(r => r.numero_po.trim().toLowerCase()));
  const maxK = base => Math.max(0, ...S.rows.map(r => (r.numero_po.trim().match(new RegExp('^' + base + '-(\\d+)$')) || [])[1]).filter(Boolean).map(Number));
  let m;
  if ((m = po.match(/^(\d+)$/))) {
    const k = maxK(m[1]);
    if (k === 0) return { base: m[1], rename: `${m[1]}-1`, nuevo: `${m[1]}-2`, std: true };
    return { base: m[1], rename: null, nuevo: `${m[1]}-${k + 1}`, std: false };
  }
  if ((m = po.match(/^(\d+)-(\d+)$/))) return { base: m[1], rename: null, nuevo: `${m[1]}-${maxK(m[1]) + 1}`, std: true };
  const head = po.split('-')[0].trim();
  if (/^\d+$/.test(head)) return { base: head, rename: null, nuevo: `${head}-${Math.max(2, maxK(head) + 1)}`, std: false };
  let n = 2, sug; do { sug = `${po} parcial ${n++}`; } while (all.has(sug.toLowerCase()));
  return { base: po, rename: null, nuevo: sug, std: false };
}
function openSplit() {
  const r = S.current; if (!r) return;
  const nm = splitNames(r), mats = matList(r);
  $('splitTitle').textContent = `Dividir en parcial · PO ${r.numero_po}`;
  $('splitBody').innerHTML = `
    ${nm.std ? '' : `<div class="split-note">El nombre <b>${esc(r.numero_po)}</b> no sigue el formato N o N-k. Revisa el nombre sugerido para el nuevo parcial.</div>`}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label class="lbl" for="spRename">Esta PO quedará como</label><input class="inp" id="spRename" value="${esc(nm.rename || r.numero_po)}"></div>
      <div><label class="lbl" for="spNuevo">Nuevo parcial <span class="text-rose-500">*</span></label><input class="inp" id="spNuevo" value="${esc(nm.nuevo)}"></div>
    </div>
    <p class="text-xs text-slate-500">El nuevo parcial copia proveedor, responsable, prioridad, condición de pago, fecha de envío OC y ETA según OC. Queda «En producción», sin datos de embarque ni anticipos, y el <b>valor PO vacío</b> (el valor es de la OC completa; queda la nota «Parcial de ${esc(nm.base)}»).</p>
    <div><div class="sec-title"><i data-lucide="package" class="w-3.5 h-3.5"></i>Materiales que pasan al nuevo parcial</div>
    ${mats.length ? `<table class="mat-tbl"><thead><tr><th>Código SAP</th><th>Descripción</th><th class="num">En esta PO</th><th class="num">Pasan al parcial</th></tr></thead><tbody>${
      mats.map((x, i) => `<tr><td class="mono">${esc(x.codigo || '—')}</td><td>${esc(x.descripcion || '')}</td><td class="num">${fnum(x.cantidad, 3)}${x.unidad ? ' ' + esc(x.unidad) : ''}</td>
        <td class="num"><input class="inp split-q" type="number" min="0" step="any" data-i="${i}" value="0"></td></tr>`).join('')}</tbody></table>
      <div class="mt-2 flex gap-3"><button type="button" class="mat-add" id="spAll">Pasar todo</button><button type="button" class="mat-add" id="spNone">Nada</button></div>`
    : '<span class="text-slate-400">Esta PO no tiene materiales registrados; el parcial se crea sin materiales.</span>'}</div>
    <div id="splitErr" class="hidden form-err"></div>`;
  if (mats.length) {
    $('spAll').onclick = () => document.querySelectorAll('.split-q').forEach(el => el.value = mats[el.dataset.i].cantidad ?? 0);
    $('spNone').onclick = () => document.querySelectorAll('.split-q').forEach(el => el.value = 0);
  }
  $('modalSplit').classList.remove('hidden'); icons();
  $('splitCancel').onclick = () => $('modalSplit').classList.add('hidden');
  $('splitOk').onclick = () => doSplit(r, nm);
}
// Calcula el resultado (exportada para pruebas): { errs, origen, parcial }
function splitPlan(r, nm, rename, nuevo, qtys) {
  const errs = [], taken = new Set(S.rows.filter(x => x.id !== r.id).map(x => x.numero_po.trim().toLowerCase()));
  if (!nuevo) errs.push('Escribe el nombre del nuevo parcial.');
  if (!rename) errs.push('El nombre de esta PO no puede quedar vacío.');
  if (nuevo && taken.has(nuevo.toLowerCase())) errs.push(`Ya existe la PO ${nuevo}.`);
  if (rename && rename.toLowerCase() !== r.numero_po.trim().toLowerCase() && taken.has(rename.toLowerCase())) errs.push(`Ya existe la PO ${rename}.`);
  if (nuevo && rename && nuevo.toLowerCase() === rename.toLowerCase()) errs.push('Los dos nombres deben ser distintos.');
  const mats = matList(r), quedan = [], pasan = [];
  mats.forEach((x, i) => {
    const q = qtys[i] ?? 0, tot = Number(x.cantidad) || 0;
    if (isNaN(q) || q < 0) errs.push(`Línea ${x.codigo || i + 1}: cantidad no válida.`);
    else if (q > tot) errs.push(`Línea ${x.codigo || i + 1}: no puedes pasar ${q}, solo hay ${tot}.`);
    else {
      if (q > 0) pasan.push({ ...x, cantidad: q });
      const rest = Math.round((tot - q) * 1000) / 1000;
      if (rest > 0) quedan.push({ ...x, cantidad: rest });
    }
  });
  const parcial = {
    proveedor_id: r.proveedor_id, responsable_id: r.responsable_id || null, prioridad: r.prioridad || 'Normal',
    condicion_pago: r.condicion_pago || null, fecha_envio_oc: r.fecha_envio_oc || null, eta_segun_oc: r.eta_segun_oc || null,
    numero_po: nuevo, estado_eta: 'En producción', factura_radicada: false,
    observaciones: `Parcial de ${nm.base}`, materiales: pasan.length ? pasan : null,
  };
  Object.keys(parcial).forEach(k => parcial[k] === null && delete parcial[k]);
  const origen = {};
  if (rename !== r.numero_po) origen.numero_po = rename;
  if (mats.length && JSON.stringify(quedan) !== JSON.stringify(mats)) origen.materiales = quedan.length ? quedan : null;
  if (Object.keys(origen).length) origen.updated_at = new Date().toISOString();
  return { errs, origen, parcial };
}
async function doSplit(r, nm) {
  const qtys = [...document.querySelectorAll('.split-q')].map(el => el.value === '' ? 0 : Number(el.value));
  const plan = splitPlan(r, nm, $('spRename').value.trim(), $('spNuevo').value.trim(), qtys);
  const box = $('splitErr');
  if (plan.errs.length) { box.innerHTML = '<ul class="list-disc pl-5">' + plan.errs.map(e => `<li>${esc(e)}</li>`).join('') + '</ul>'; box.classList.remove('hidden'); return; }
  const btn = $('splitOk'); btn.disabled = true; btn.classList.add('opacity-60');
  let created = null;
  try {
    const out = await api('importaciones', { method: 'POST', body: plan.parcial });   // 1) crear el parcial
    created = Array.isArray(out) && out[0] ? out[0] : null;
    if (Object.keys(plan.origen).length) {                                             // 2) ajustar la PO de origen
      const upd = await api('importaciones?id=eq.' + encodeURIComponent(r.id), { method: 'PATCH', body: plan.origen });
      if (Array.isArray(upd) && !upd.length) throw new Error('No se actualizó la PO de origen (¿permisos?).');
    }
    $('modalSplit').classList.add('hidden');
    toast(`Parcial ${plan.parcial.numero_po} creado${plan.origen.numero_po ? ` y la PO quedó como ${plan.origen.numero_po}` : ''}.`);
    await loadAll();
    if (created) openDetail(created.id);
  } catch (e) {
    box.innerHTML = (created ? `<strong>Se creó el parcial ${esc(plan.parcial.numero_po)}, pero no se pudo ajustar la PO de origen:</strong> ` : '<strong>No se pudo crear el parcial:</strong> ') + esc(friendlyError(e));
    box.classList.remove('hidden'); if (created) loadAll();
  } finally { btn.disabled = false; btn.classList.remove('opacity-60'); }
}

// ------------------------------------------------------------------ KPI
function aggregate(rows, keyFn) {
  const m = new Map();
  rows.forEach(r => {
    const k = keyFn(r); if (k == null) return;
    const a = m.get(k) || { key: k, n: 0, ok: 0, lt: [], dv: [] };
    if (r.llego_a_tiempo !== null && r.llego_a_tiempo !== undefined) { a.n++; if (r.llego_a_tiempo) a.ok++; a.dv.push(r.dias_vs_eta_oc); }
    if (r.leadtime_real_dias !== null && r.leadtime_real_dias !== undefined) a.lt.push(r.leadtime_real_dias);
    m.set(k, a);
  });
  return [...m.values()].map(a => ({ ...a, pct: pct(a.ok, a.n), ltAvg: a.lt.length ? a.lt.reduce((s, x) => s + x, 0) / a.lt.length : null, dvAvg: a.dv.length ? a.dv.reduce((s, x) => s + x, 0) / a.dv.length : null }));
}
const pctCls = p => p === null ? 'text-slate-400' : p >= 80 ? 'text-emerald-700' : p >= 60 ? 'text-amber-700' : 'text-rose-700';
function kpiTable(list, label, fmtKey = k => esc(k)) {
  return `<div class="overflow-x-auto"><table class="ktbl"><thead><tr><th>${esc(label)}</th><th class="n">PO llegadas</th><th class="n">A tiempo</th><th class="n">% cumplim.</th><th class="n">Leadtime prom. (d)</th><th class="n">Días prom. vs ETA OC</th></tr></thead><tbody>
  ${list.map(a => `<tr><td class="font-medium text-slate-800">${fmtKey(a.key)}</td><td class="n">${a.n}</td><td class="n">${a.ok}</td><td class="n font-bold ${pctCls(a.pct)}">${a.pct === null ? '—' : a.pct.toLocaleString('es-CO') + ' %'}</td><td class="n">${a.ltAvg === null ? '—' : fnum(a.ltAvg, 1)}</td><td class="n">${a.dvAvg === null ? '—' : (a.dvAvg > 0 ? '+' : '') + fnum(a.dvAvg, 1)}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function svgMonth(list) {
  if (!list.length) return '<p class="text-sm text-slate-400">Sin datos.</p>';
  const W = Math.max(640, list.length * 70), H = 240, pl = 40, pr = 40, pt = 20, pb = 34, bw = Math.min(40, (W - pl - pr) / list.length * 0.6);
  const maxLt = Math.max(...list.map(a => a.ltAvg || 0), 1);
  const x = i => pl + (i + 0.5) * (W - pl - pr) / list.length, yP = p => pt + (H - pt - pb) * (1 - p / 100), yL = l => pt + (H - pt - pb) * (1 - l / (maxLt * 1.1));
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:${W}px;max-height:260px" font-family="inherit">`;
  [0, 25, 50, 75, 100].forEach(g => { s += `<line x1="${pl}" x2="${W - pr}" y1="${yP(g)}" y2="${yP(g)}" stroke="#f1f5f9"/><text x="${pl - 6}" y="${yP(g) + 3}" font-size="10" text-anchor="end" fill="#94a3b8">${g}%</text>`; });
  list.forEach((a, i) => {
    const p = a.pct || 0, c = a.pct >= 80 ? '#10b981' : a.pct >= 60 ? '#f59e0b' : '#f43f5e';
    s += `<rect x="${x(i) - bw / 2}" y="${yP(p)}" width="${bw}" height="${yP(0) - yP(p)}" rx="4" fill="${c}" opacity=".85"><title>${fmes(a.key)}: ${a.pct ?? 0}% (${a.ok}/${a.n})</title></rect>`;
    s += `<text x="${x(i)}" y="${yP(p) - 4}" font-size="10" text-anchor="middle" fill="#334155" font-weight="700">${a.pct ?? 0}% · ${a.n}</text>`;
    s += `<text x="${x(i)}" y="${H - pb + 14}" font-size="10" text-anchor="middle" fill="#64748b">${fmes(a.key)}</text>`;
  });
  const pts = list.map((a, i) => a.ltAvg === null ? null : [x(i), yL(a.ltAvg)]).filter(Boolean);
  if (pts.length) {
    s += `<polyline fill="none" stroke="#2563eb" stroke-width="2" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
    list.forEach((a, i) => { if (a.ltAvg !== null) s += `<circle cx="${x(i)}" cy="${yL(a.ltAvg)}" r="3.5" fill="#2563eb"/><text x="${x(i) + 6}" y="${yL(a.ltAvg) + 12}" font-size="9" fill="#2563eb">${Math.round(a.ltAvg)} d</text>`; });
  }
  return s + `<text x="${W - pr + 4}" y="${pt + 4}" font-size="9" fill="#2563eb">leadtime</text></svg>`;
}
function svgBarsH(list) {
  const rows = list.filter(a => a.n > 0); if (!rows.length) return '';
  const rh = 20, W = 560, lw = 210, H = rows.length * rh + 10;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" font-family="inherit">`;
  rows.forEach((a, i) => {
    const y = 5 + i * rh, w = (W - lw - 70) * (a.pct / 100), c = a.pct >= 80 ? '#10b981' : a.pct >= 60 ? '#f59e0b' : '#f43f5e';
    const name = a.key.length > 32 ? a.key.slice(0, 31) + '…' : a.key;
    s += `<text x="${lw - 6}" y="${y + 13}" font-size="10" text-anchor="end" fill="#334155">${esc(name)}</text>`;
    s += `<rect x="${lw}" y="${y + 3}" width="${W - lw - 70}" height="13" rx="3" fill="#f1f5f9"/><rect x="${lw}" y="${y + 3}" width="${Math.max(w, 1)}" height="13" rx="3" fill="${c}"/>`;
    s += `<text x="${W - 64}" y="${y + 13}" font-size="10" fill="#334155" font-weight="700">${a.pct}% (${a.ok}/${a.n})</text>`;
  });
  return s + '</svg>';
}
function renderKpi() {
  const R = S.rows;
  const all = aggregate(R, () => 'Total')[0] || { n: 0, ok: 0, pct: null, ltAvg: null };
  const venc = R.filter(r => r._venc), act = R.filter(r => !CERRADOS.includes(r._estado));
  const card = (t, v, sub, cls, ic) => `<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><div class="flex items-center justify-between"><span class="text-[11px] uppercase tracking-wider font-bold text-slate-400">${t}</span><i data-lucide="${ic}" class="w-4 h-4 ${cls}"></i></div><div class="text-3xl font-extrabold mt-1 ${cls}">${v}</div><div class="text-xs text-slate-500 mt-1">${sub}</div></div>`;
  $('kpiCards').innerHTML =
    card('Cumplimiento vs ETA OC', all.pct === null ? '—' : all.pct.toLocaleString('es-CO') + ' %', `${all.ok} a tiempo de ${all.n} PO llegadas`, pctCls(all.pct), 'target') +
    card('Leadtime real promedio', all.ltAvg === null ? '—' : fnum(all.ltAvg, 1) + ' d', `Envío OC → llegada Firplak (${all.lt ? all.lt.length : 0} PO)`, 'text-blue-700', 'timer') +
    card('PO activas', act.length, 'En producción, tránsito, aduana, conteo o liquidación', 'text-slate-800', 'package') +
    card('PO vencidas', venc.length, 'Activas con ETA (FPK u OC) ya pasada', 'text-rose-700', 'alert-circle');
  const byMonth = aggregate(R, r => r.fecha_llegada_firplak ? r.fecha_llegada_firplak.slice(0, 7) : null).sort((a, b) => a.key.localeCompare(b.key));
  $('chartMonth').innerHTML = svgMonth(byMonth);
  $('tblMonth').innerHTML = kpiTable(byMonth, 'Mes de llegada', k => esc(fmes(k)));
  const byProv = aggregate(R, r => r.proveedor).sort((a, b) => (b.n - a.n) || a.key.localeCompare(b.key));
  $('chartProv').innerHTML = svgBarsH(byProv) || '<p class="text-sm text-slate-600">Todavía no hay PO llegadas para comparar proveedores.</p>';
  $('tblProv').innerHTML = kpiTable(byProv.filter(a => a.n > 0), 'Proveedor') + (byProv.some(a => !a.n) ? `<p class="text-[11px] text-slate-400 mt-2">Sin llegadas aún: ${byProv.filter(a => !a.n).map(a => esc(a.key)).join(', ')}.</p>` : '');
  $('tblResp').innerHTML = kpiTable(aggregate(R, r => r.responsable || 'Sin asignar').sort((a, b) => a.key.localeCompare(b.key)), 'Responsable');
  $('tblVencidas').innerHTML = venc.length ? `<table class="ktbl"><thead><tr><th># PO</th><th>Proveedor</th><th>Responsable</th><th>Estado</th><th class="n">ETA ref.</th><th class="n">Días</th></tr></thead><tbody>${venc.sort((a, b) => (a.eta_estimada_fpk || a.eta_segun_oc).localeCompare(b.eta_estimada_fpk || b.eta_segun_oc)).map(r => { const ref = r.eta_estimada_fpk || r.eta_segun_oc; return `<tr class="cursor-pointer hover:bg-rose-50" data-id="${esc(r.id)}"><td class="font-bold">${esc(r.numero_po)}</td><td>${esc(r.proveedor)}</td><td>${esc(r.responsable || '—')}</td><td>${esc(r._estado)}</td><td class="n">${fdate(ref)}</td><td class="n text-rose-700 font-bold">+${ddiff(todayBog(), ref)}</td></tr>`; }).join('')}</tbody></table>` : '<p class="text-sm text-slate-400">No hay PO vencidas.</p>';
  icons();
}

// ------------------------------------------------------------------ navegación
function showTab(t) {
  S.tab = t;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + t));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  window.scrollTo(0, 0);
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.tab === 'form') { if (S.tab !== 'form') openForm(S.editing && S.tab === 'form' ? S.editing : null); return; }
    showTab(b.dataset.tab);
  }));
  ['fSearch'].forEach(id => $(id).addEventListener('input', renderList));
  ['fResponsable', 'fProveedor', 'fPrioridad', 'fEstado', 'fTodas', 'fSoloVencidas', 'fSoloAtrasadas', 'fOrden'].forEach(id => $(id).addEventListener('change', renderList));
  $('btnReload').addEventListener('click', loadAll); $('btnRetry').addEventListener('click', () => (AUTH_REQUIRED && !SB) ? initAuth() : loadAll());
  $('listBody').addEventListener('click', e => { if (e.target.closest('[data-clear]')) { clearFilters(); return; } const tr = e.target.closest('tr[data-id]'); if (tr) openDetail(tr.dataset.id); });
  $('tblVencidas').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) openDetail(tr.dataset.id); });
  $('btnDetailToList').addEventListener('click', () => showTab('list'));
  $('btnBackList').addEventListener('click', () => showTab('list'));
  $('btnEditPo').addEventListener('click', () => S.current && openForm(S.current));
  $('btnSplitPo').addEventListener('click', openSplit);
  $('btnSaveForm').addEventListener('click', saveForm);
  $('btnCancelForm').addEventListener('click', () => { const back = S.editing ? 'detail' : 'list'; S.editing = null; $('navFormLabel').textContent = 'Nueva PO'; showTab(back); });
  $('loginForm').addEventListener('submit', submitLogin);
  $('btnLogout').addEventListener('click', logout);
  showTab('list'); icons(); initAuth();
});
