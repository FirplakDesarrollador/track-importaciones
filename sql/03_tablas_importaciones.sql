-- COMEX Track · Importaciones (Firplak) · v2 aprobada, lista para correr en el SQL Editor de Supabase
-- Espejo de la lista SharePoint "Seguimiento Importaciones 2026", con nombres claros.
-- Tablas nuevas, separadas de exportaciones, en el mismo proyecto Supabase.
-- Reutiliza: responsables. No modifica ninguna tabla existente.

begin;

-- 1) Proveedores internacionales con su responsable fijo (reparto por proveedor)
create table if not exists public.proveedores_impo (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null unique,
  pais              text,
  responsable_id    uuid references public.responsables(id),   -- Laura o Catalina
  respaldo_id       uuid references public.responsables(id),   -- quien lo cubre
  frecuencia        text check (frecuencia in ('Frecuente','Baja')),
  requiere_registro boolean default false,                     -- RIM / registro (Catalina)
  compra_con_tc     boolean default false,                     -- compras con TC de la jefe
  activo            boolean default true,
  created_at        timestamptz default now()
);

-- 2) Importaciones: una fila = una PO (incluye parciales, ej. 1745-1)
create table if not exists public.importaciones (
  id                    uuid primary key default gen_random_uuid(),
  proveedor_id          uuid not null references public.proveedores_impo(id), -- Proveedor
  prioridad             text not null default 'Normal'
                          check (prioridad in ('Normal','Prioritaria','Estratégica')),
  numero_po             text not null unique,                                  -- #PO
  responsable_id        uuid references public.responsables(id),               -- Responsable
  fecha_envio_oc        date,                                                  -- Fecha_Envio_OC
  eta_segun_oc          date,                                                  -- ETA_Segun_OC
  eta_estimada_fpk      date,                                                  -- ETA_Estimada_FPK
  estado_eta            text not null default 'En producción'
                          check (estado_eta in ('En producción','En tránsito','En aduana',
                                                'En conteo','En liquidación','Terminada','Cancelada')),
  condicion_pago        text,                    -- 100, Credito, 30/70 Despacho, 30/70 BL, Factoring, 50/50...
  valor_po              numeric(14,2),           -- Valor_PO
  anticipo1_fecha_pago  date,                    -- Anticipo1_Fechapago
  anticipo2_momento     text check (anticipo2_momento in ('Despacho','Contra BL','Credito/Factoring')),
  anticipo2_fecha_pago  date,                    -- Anticipo2_FechaPago
  factura_radicada      boolean default false,   -- Factura_Radicada (OK)
  embarcador            text,                    -- Magnum, Pasarex, Licarga, Ultrabox, MSC...
  tipo_carga            text check (tipo_carga in ('LCL','FCL20','FCL40','Air','Express')),
  cant_bultos           text,                    -- texto libre: "48 bultos", "80 cajas"
  peso_kg               numeric(12,2),
  volumen_m3            numeric(10,2),
  -- Hitos del flujo, en orden
  fecha_bodega_origen   date,                    -- Fecha_Bodega_Orig
  fecha_embarque        date,
  fecha_llegada_puerto  date,
  fecha_pago_impuestos  date,
  fecha_salida_puerto   date,
  fecha_llegada_firplak date,
  fecha_liquidacion     date,
  fecha_traslado        date,
  consolidada_con       text,                    -- otras PO del mismo embarque
  leadtime_real_dias    int generated always as (fecha_llegada_firplak - fecha_envio_oc) stored,
  observaciones         text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
create index if not exists idx_impo_proveedor   on public.importaciones(proveedor_id);
create index if not exists idx_impo_responsable on public.importaciones(responsable_id);
create index if not exists idx_impo_estado      on public.importaciones(estado_eta);

-- 3) Vista para el dashboard y los KPI
create or replace view public.v_importaciones_metricas as
select i.*,
       p.nombre as proveedor, p.pais,
       r.nombre as responsable,
       case when i.fecha_llegada_firplak is null or i.eta_segun_oc is null then null
            else i.fecha_llegada_firplak <= i.eta_segun_oc end            as llego_a_tiempo,
       case when i.fecha_llegada_firplak is null or i.eta_segun_oc is null then null
            else i.fecha_llegada_firplak - i.eta_segun_oc end             as dias_vs_eta_oc,
       case when i.estado_eta not in ('Terminada','Cancelada')
             and coalesce(i.eta_estimada_fpk, i.eta_segun_oc) < current_date
            then true else false end                                    as vencida
from public.importaciones i
join public.proveedores_impo p on p.id = i.proveedor_id
left join public.responsables r on r.id = i.responsable_id;

commit;
