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
  { k: 'embarcador', sp: 'Embarcador', label: 'Embarcador', t: 'text', list: EMBARCADOR_SUG, sec: 'carga' },
  { k: 'tipo_carga', sp: 'Tipo_Carga', label: 'Tipo de carga', t: 'select', opts: TIPOS_CARGA, blank: true, sec: 'carga' },
  { k: 'cant_bultos', sp: 'Can_Bultos', label: 'Cantidad de bultos', t: 'text', sec: 'carga', ph: 'Ej: 48 bultos, 3 pallets' },
  { k: 'peso_kg', sp: 'Peso_KG', label: 'Peso (kg)', t: 'number', step: '0.01', sec: 'carga' },
  { k: 'volumen_m3', sp: 'Volumen_M3', label: 'Volumen (m³)', t: 'number', step: '0.001', sec: 'carga' },
  { k: 'fecha_bodega_origen', sp: 'Fecha_Bodega_Orig', label: 'Fecha bodega origen', t: 'date', sec: 'hitos', hito: 'Bodega origen' },
  { k: 'fecha_embarque', sp: 'Fecha_Embarque', label: 'Fecha embarque', t: 'date', sec: 'hitos', hito: 'Embarque' },
  { k: 'fecha_llegada_puerto', sp: 'Fecha_Llegada_Puerto', label: 'Fecha llegada a puerto', t: 'date', sec: 'hitos', hito: 'Llegada a puerto' },
  { k: 'fecha_pago_impuestos', sp: 'Fecha_Pago_Impuestos', label: 'Fecha pago de impuestos', t: 'date', sec: 'hitos', hito: 'Pago de impuestos' },
  { k: 'fecha_salida_puerto', sp: 'Fecha_Salida_Puerto', label: 'Fecha salida de puerto', t: 'date', sec: 'hitos', hito: 'Salida de puerto' },
  { k: 'fecha_llegada_firplak', sp: 'Fecha_Llegada_Firplak', label: 'Fecha llegada a Firplak', t: 'date', sec: 'hitos', hito: 'Llegada a Firplak' },
  { k: 'fecha_liquidacion', sp: 'Fecha_Liquidacion', label: 'Fecha liquidación', t: 'date', sec: 'hitos', hito: 'Liquidación' },
  { k: 'fecha_traslado', sp: 'Fecha_Traslado', label: 'Fecha traslado', t: 'date', sec: 'hitos', hito: 'Traslado' },
  { k: 'consolidada_con', sp: 'Consolidada_Con', label: 'Consolidada con', t: 'text', sec: 'otros', ph: 'Otras PO del mismo embarque' },
  { k: 'leadtime_real_dias', sp: 'Leadtime_Real', label: 'Leadtime real (días)', t: 'computed', sec: 'otros' },
  { k: 'observaciones', sp: 'Observaciones', label: 'Observaciones', t: 'textarea', sec: 'otros' },
];
const HITOS = FIELDS.filter(f => f.hito);
const WRITABLE = FIELDS.filter(f => f.t !== 'computed').map(f => f.k);
const SECTIONS = [
  ['po', 'Datos de la PO', 'file-text'], ['pago', 'Pago', 'wallet'], ['carga', 'Carga', 'boxes'],
  ['hitos', 'Hitos del flujo (en orden)', 'milestone'], ['otros', 'Otros', 'message-square'],
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
  if (CERRADOS.includes(r.estado_eta)) return '<span class="text-slate-400">—</span>';
  const ref = r.eta_estimada_fpk || r.eta_segun_oc;
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
    S.rows = rows || [];
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
  fillSelect($('fEstado'), ESTADOS.map(p => [p, p]), 'Todos los Estados');
}

function renderStats() {
  const act = S.rows.filter(r => !CERRADOS.includes(r.estado_eta));
  $('statTotal').textContent = S.rows.length;
  $('statActivas').textContent = act.length;
  $('statTerminadas').textContent = S.rows.filter(r => r.estado_eta === 'Terminada').length;
  $('statVencidas').textContent = S.rows.filter(r => r.vencida).length;
}

// ------------------------------------------------------------------ lista
function renderList() {
  const q = $('fSearch').value.trim().toLowerCase();
  const fr = $('fResponsable').value, fp = $('fProveedor').value, fpr = $('fPrioridad').value, fe = $('fEstado').value;
  const todas = $('fTodas').checked || CERRADOS.includes(fe), soloV = $('fSoloVencidas').checked;
  const rows = S.rows.filter(r =>
    (todas || !CERRADOS.includes(r.estado_eta)) && (!fr || r.responsable_id === fr) && (!fp || r.proveedor_id === fp) &&
    (!fpr || r.prioridad === fpr) && (!fe || r.estado_eta === fe) && (!soloV || r.vencida) &&
    (!q || [r.numero_po, r.proveedor, r.embarcador, r.observaciones, r.consolidada_con].some(x => (x || '').toLowerCase().includes(q))));
  // Orden: vencidas primero, luego por ETA (estimada FPK o según OC), sin ETA al final
  const ref = r => r.eta_estimada_fpk || r.eta_segun_oc || '9999';
  rows.sort((a, b) => (b.vencida - a.vencida) || ref(a).localeCompare(ref(b)) || a.numero_po.localeCompare(b.numero_po));
  $('listCount').textContent = `${rows.length} PO mostradas`;
  $('listBody').innerHTML = rows.length ? rows.map(r => `
    <tr class="hover:bg-slate-50 cursor-pointer ${r.vencida ? 'row-vencida' : ''}" data-id="${esc(r.id)}">
      <td class="px-3 py-2.5 font-bold text-slate-900 min-w-[120px] max-w-[180px] break-words">${r.vencida ? '<span class="text-rose-600 text-[11px]" title="Vencida">⚠</span> ' : ''}${esc(r.numero_po)}</td>
      <td class="px-3 py-2.5 min-w-[200px]"><div class="font-medium text-slate-800 text-xs sm:text-[13px]">${esc(r.proveedor)}</div><div class="text-[11px] text-slate-400">${esc(r.pais || '')}</div></td>
      <td class="px-3 py-2.5">${badgePrio(r.prioridad)}</td>
      <td class="px-3 py-2.5 text-slate-700">${esc(r.responsable || '—')}</td>
      <td class="px-3 py-2.5 whitespace-nowrap">${badgeEstado(r.estado_eta)}</td>
      <td class="px-3 py-2.5 whitespace-nowrap text-slate-700">${fdate(r.eta_segun_oc)}</td>
      <td class="px-3 py-2.5 whitespace-nowrap text-slate-700">${fdate(r.eta_estimada_fpk)}</td>
      <td class="px-3 py-2.5 text-slate-600">${esc(r.embarcador || '—')}</td>
      <td class="px-3 py-2.5">${r.tipo_carga ? `<span class="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-600">${esc(r.tipo_carga)}</span>` : '—'}</td>
      <td class="px-3 py-2.5 whitespace-nowrap text-xs">${diasVsEta(r)}</td>
      <td class="px-3 py-2.5 text-right"><span class="text-blue-600 font-semibold text-xs whitespace-nowrap">Ver ›</span></td>
    </tr>`).join('')
    : `<tr><td colspan="11" class="px-4 py-10 text-center text-slate-400">No hay PO con esos filtros.</td></tr>`;
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
    case 'select': return f.k === 'estado_eta' ? badgeEstado(v) : f.k === 'prioridad' ? badgePrio(v) : esc(v || '—');
    default: return v ? esc(v) : '—';
  }
}
function renderDetail() {
  const r = S.current;
  $('detailEmpty').classList.toggle('hidden', !!r); $('detailContent').classList.toggle('hidden', !r);
  if (!r) return;
  $('dPo').textContent = r.numero_po; $('dProveedor').textContent = r.proveedor; $('dPais').textContent = r.pais || '—';
  $('dEstado').innerHTML = badgeEstado(r.estado_eta); $('dPrioridad').innerHTML = badgePrio(r.prioridad);
  $('dVencida').innerHTML = r.vencida ? badgeVencida() : '';
  const lt = r.leadtime_real_dias;
  $('dLeadBadge').innerHTML = `
    <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Leadtime real</div>
    <div class="text-xl font-extrabold text-slate-900">${lt == null ? '—' : lt + ' d'}</div>
    <div class="text-[11px] ${r.llego_a_tiempo === true ? 'text-emerald-700' : r.llego_a_tiempo === false ? 'text-rose-700' : 'text-slate-400'} font-semibold">
      ${r.llego_a_tiempo === true ? `A tiempo vs ETA OC (${r.dias_vs_eta_oc} d)` : r.llego_a_tiempo === false ? `Tarde vs ETA OC (+${r.dias_vs_eta_oc} d)` : 'Sin llegada a Firplak'}</div>`;
  renderStepper(r);
  $('detailFields').innerHTML = FIELDS.map((f, i) => `
    <div class="fld ${f.k === 'observaciones' ? 'sm:col-span-2 lg:col-span-3' : ''}">
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
  const closed = CERRADOS.includes(r.estado_eta);
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
        ${done ? `<div class="text-slate-700 font-medium">${fdate(v)}</div><div class="text-[10px] ${gap < 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}">${gap === null ? '' : (i === 0 ? 'desde OC: ' : '') + (gap >= 0 ? '+' : '') + gap + ' d'}</div>`
        : `<span class="text-slate-400 italic">${isNext ? 'Por registrar' : 'En espera'}</span>`}
      </div></div>`;
  }).join('');
  $('stepper').innerHTML = `<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">${cards}</div>`;
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
    case 'computed': ctl = `<div class="inp bg-slate-100 text-slate-500" id="${id}">Se calcula solo: llegada a Firplak − envío OC</div>`; break;
    default: ctl = `<input type="text" ${base} ${f.ph ? `placeholder="${esc(f.ph)}"` : ''} ${f.list ? `list="dl_${f.k}"` : ''}>${f.list ? `<datalist id="dl_${f.k}">${f.list.map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : ''}`;
  }
  const wide = f.t === 'textarea' ? 'md:col-span-2 lg:col-span-4' : f.t === 'proveedor' ? 'md:col-span-2' : '';
  return `<div class="${wide}"><label class="lbl" for="${id}">${esc(f.label)}${req}</label>${ctl}</div>`;
}
function buildForm() {
  $('poForm').innerHTML = SECTIONS.map(([s, title, ic]) => `
    <div><div class="sec-title"><i data-lucide="${ic}" class="w-3.5 h-3.5"></i>${esc(title)}</div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">${FIELDS.filter(f => f.sec === s).map(inputHtml).join('')}</div></div>`).join('');
  $('in_proveedor_id').addEventListener('change', onProveedorChange);
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
    FIELDS.forEach(f => { const el = $('in_' + f.k); if (!el || f.t === 'computed') return; const v = row[f.k]; el.value = v === null || v === undefined ? '' : String(v); });
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
    return body;
  }
  const body = {};
  WRITABLE.forEach(k => {
    const a = original[k] ?? null, b = o[k] ?? null;
    const same = (typeof b === 'number' && a !== null) ? Number(a) === b : String(a) === String(b);
    if (!same) body[k] = b;
  });
  if (Object.keys(body).length) body.updated_at = new Date().toISOString();
  return body;
}
async function saveForm() {
  const o = readForm(); const { errs, warns } = validate(o);
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
  const venc = R.filter(r => r.vencida), act = R.filter(r => !CERRADOS.includes(r.estado_eta));
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
  $('chartProv').innerHTML = svgBarsH(byProv);
  $('tblProv').innerHTML = kpiTable(byProv.filter(a => a.n > 0), 'Proveedor') + (byProv.some(a => !a.n) ? `<p class="text-[11px] text-slate-400 mt-2">Sin llegadas aún: ${byProv.filter(a => !a.n).map(a => esc(a.key)).join(', ')}.</p>` : '');
  $('tblResp').innerHTML = kpiTable(aggregate(R, r => r.responsable || 'Sin asignar').sort((a, b) => a.key.localeCompare(b.key)), 'Responsable');
  $('tblVencidas').innerHTML = venc.length ? `<table class="ktbl"><thead><tr><th># PO</th><th>Proveedor</th><th>Responsable</th><th>Estado</th><th class="n">ETA ref.</th><th class="n">Días</th></tr></thead><tbody>${venc.sort((a, b) => (a.eta_estimada_fpk || a.eta_segun_oc).localeCompare(b.eta_estimada_fpk || b.eta_segun_oc)).map(r => { const ref = r.eta_estimada_fpk || r.eta_segun_oc; return `<tr class="cursor-pointer hover:bg-rose-50" data-id="${esc(r.id)}"><td class="font-bold">${esc(r.numero_po)}</td><td>${esc(r.proveedor)}</td><td>${esc(r.responsable || '—')}</td><td>${esc(r.estado_eta)}</td><td class="n">${fdate(ref)}</td><td class="n text-rose-700 font-bold">+${ddiff(todayBog(), ref)}</td></tr>`; }).join('')}</tbody></table>` : '<p class="text-sm text-slate-400">No hay PO vencidas.</p>';
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
  ['fResponsable', 'fProveedor', 'fPrioridad', 'fEstado', 'fTodas', 'fSoloVencidas'].forEach(id => $(id).addEventListener('change', renderList));
  $('btnReload').addEventListener('click', loadAll); $('btnRetry').addEventListener('click', () => (AUTH_REQUIRED && !SB) ? initAuth() : loadAll());
  $('listBody').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) openDetail(tr.dataset.id); });
  $('tblVencidas').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) openDetail(tr.dataset.id); });
  $('btnBackList').addEventListener('click', () => showTab('list'));
  $('btnEditPo').addEventListener('click', () => S.current && openForm(S.current));
  $('btnSaveForm').addEventListener('click', saveForm);
  $('btnCancelForm').addEventListener('click', () => { const back = S.editing ? 'detail' : 'list'; S.editing = null; $('navFormLabel').textContent = 'Nueva PO'; showTab(back); });
  $('loginForm').addEventListener('submit', submitLogin);
  $('btnLogout').addEventListener('click', logout);
  showTab('list'); icons(); initAuth();
});
