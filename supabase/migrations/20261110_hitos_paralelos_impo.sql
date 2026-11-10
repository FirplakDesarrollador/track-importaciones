-- COMEX Track · Importaciones · Hitos paralelos (pagos), fuente de cada fecha e historial
-- Aprobado por Catalina el 10/11/2026. Solo agrega: no borra, no renombra, no cambia datos existentes.
-- Respaldo previo: /workspace/comex/backups/*_pre_hitos_paralelos_20261110_1610.*
begin;

-- 1) Pagos como hitos paralelos. anticipo1_fecha_pago, anticipo2_fecha_pago y factura_radicada ya existen;
--    falta la fecha en que se radicó la factura.
alter table public.importaciones add column if not exists factura_radicada_fecha date;

-- 2) Fuente de cada fecha: 'manual', 'correo:<id del mensaje>', 'aduanimex:<archivo>', etc.
alter table public.importaciones add column if not exists fecha_bodega_origen_fuente text;
alter table public.importaciones add column if not exists fecha_embarque_fuente text;
alter table public.importaciones add column if not exists fecha_llegada_puerto_fuente text;
alter table public.importaciones add column if not exists fecha_pago_impuestos_fuente text;
alter table public.importaciones add column if not exists fecha_levante_fuente text;
alter table public.importaciones add column if not exists fecha_salida_puerto_fuente text;
alter table public.importaciones add column if not exists fecha_llegada_firplak_fuente text;
alter table public.importaciones add column if not exists fecha_liquidacion_fuente text;
alter table public.importaciones add column if not exists fecha_traslado_fuente text;
alter table public.importaciones add column if not exists anticipo1_fecha_pago_fuente text;
alter table public.importaciones add column if not exists anticipo2_fecha_pago_fuente text;
alter table public.importaciones add column if not exists factura_radicada_fecha_fuente text;

-- 3) Historial de hitos: una fila por cada fecha que se registra o se corrige.
create table if not exists public.importaciones_historial (
  id              bigint generated always as identity primary key,
  importacion_id  uuid not null references public.importaciones(id),
  campo           text not null,
  valor_anterior  text,
  valor_nuevo     text,
  fuente          text,
  registrado_por  text default coalesce(auth.jwt() ->> 'email', current_user),
  registrado_at   timestamptz not null default now()
);
create index if not exists idx_impo_hist_importacion on public.importaciones_historial(importacion_id, registrado_at desc);
alter table public.importaciones_historial enable row level security;
drop policy if exists auth_select on public.importaciones_historial;
create policy auth_select on public.importaciones_historial for select to authenticated using (true);
drop policy if exists auth_insert on public.importaciones_historial;
create policy auth_insert on public.importaciones_historial for insert to authenticated with check (true);

-- El trigger llena el historial solo: la app y la futura detección por correo no tienen que escribirlo.
create or replace function public.fn_importaciones_historial() returns trigger
language plpgsql security definer set search_path = public as $$
declare c text; v_old text; v_new text; n jsonb := to_jsonb(NEW); o jsonb;
begin
  if TG_OP = 'UPDATE' then o := to_jsonb(OLD); else o := '{}'::jsonb; end if;
  foreach c in array array['fecha_bodega_origen', 'fecha_embarque', 'fecha_llegada_puerto', 'fecha_pago_impuestos', 'fecha_levante', 'fecha_salida_puerto', 'fecha_llegada_firplak', 'fecha_liquidacion', 'fecha_traslado', 'anticipo1_fecha_pago', 'anticipo2_fecha_pago', 'factura_radicada_fecha', 'factura_radicada'] loop
    v_old := o ->> c; v_new := n ->> c;
    if v_new is distinct from v_old and not (TG_OP = 'INSERT' and v_new is null) then
      insert into public.importaciones_historial(importacion_id, campo, valor_anterior, valor_nuevo, fuente)
      values (NEW.id, c, v_old, v_new, coalesce(n ->> (c || '_fuente'), 'manual'));
    end if;
  end loop;
  return NEW;
end $$;
drop trigger if exists trg_importaciones_historial on public.importaciones;
create trigger trg_importaciones_historial after insert or update on public.importaciones
  for each row execute function public.fn_importaciones_historial();

-- 4) La vista agrega las columnas nuevas al final (create or replace solo permite agregar).
create or replace view public.v_importaciones_metricas as  SELECT i.id,
    i.proveedor_id,
    i.prioridad,
    i.numero_po,
    i.responsable_id,
    i.fecha_envio_oc,
    i.eta_segun_oc,
    i.eta_estimada_fpk,
    i.estado_eta,
    i.condicion_pago,
    i.valor_po,
    i.anticipo1_fecha_pago,
    i.anticipo2_momento,
    i.anticipo2_fecha_pago,
    i.factura_radicada,
    i.embarcador,
    i.tipo_carga,
    i.cant_bultos,
    i.peso_kg,
    i.volumen_m3,
    i.fecha_bodega_origen,
    i.fecha_embarque,
    i.fecha_llegada_puerto,
    i.fecha_pago_impuestos,
    i.fecha_salida_puerto,
    i.fecha_llegada_firplak,
    i.fecha_liquidacion,
    i.fecha_traslado,
    i.consolidada_con,
    i.leadtime_real_dias,
    i.observaciones,
    i.created_at,
    i.updated_at,
    p.nombre AS proveedor,
    p.pais,
    r.nombre AS responsable,
        CASE
            WHEN ((i.fecha_llegada_firplak IS NULL) OR (i.eta_segun_oc IS NULL)) THEN NULL::boolean
            ELSE (i.fecha_llegada_firplak <= i.eta_segun_oc)
        END AS llego_a_tiempo,
        CASE
            WHEN ((i.fecha_llegada_firplak IS NULL) OR (i.eta_segun_oc IS NULL)) THEN NULL::integer
            ELSE (i.fecha_llegada_firplak - i.eta_segun_oc)
        END AS dias_vs_eta_oc,
        CASE
            WHEN ((i.estado_eta <> ALL (ARRAY['Terminada'::text, 'Cancelada'::text])) AND (i.fecha_llegada_firplak IS NULL) AND (COALESCE(i.eta_estimada_fpk, i.eta_segun_oc) < CURRENT_DATE)) THEN true
            ELSE false
        END AS vencida,
    i.materiales,
    i.fecha_levante,
    i.factura_radicada_fecha,
    i.fecha_bodega_origen_fuente,
    i.fecha_embarque_fuente,
    i.fecha_llegada_puerto_fuente,
    i.fecha_pago_impuestos_fuente,
    i.fecha_levante_fuente,
    i.fecha_salida_puerto_fuente,
    i.fecha_llegada_firplak_fuente,
    i.fecha_liquidacion_fuente,
    i.fecha_traslado_fuente,
    i.anticipo1_fecha_pago_fuente,
    i.anticipo2_fecha_pago_fuente,
    i.factura_radicada_fecha_fuente
   FROM ((importaciones i
     JOIN proveedores_impo p ON ((p.id = i.proveedor_id)))
     LEFT JOIN responsables r ON ((r.id = i.responsable_id)));
alter view public.v_importaciones_metricas set (security_invoker = on);

commit;
