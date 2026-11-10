-- Fecha de entrega conteo y regla de fecha de traslado (aprobado por Catalina el 10/11/2026).
-- Solo agrega: columna + fuente, tabla de festivos de Colombia, función de día hábil, trigger de traslado y la vista con las columnas nuevas al final.

-- 1) Fecha de entrega conteo (manual por ahora), entre llegada a Firplak y liquidación
alter table public.importaciones add column if not exists fecha_entrega_conteo date;
alter table public.importaciones add column if not exists fecha_entrega_conteo_fuente text;

-- 2) Festivos de Colombia (Ley Emiliani incluida). Hay que agregar los de 2028 antes de esa fecha.
create table if not exists public.festivos_co (fecha date primary key);
alter table public.festivos_co enable row level security;
drop policy if exists auth_select on public.festivos_co;
create policy auth_select on public.festivos_co for select to authenticated using (true);
insert into public.festivos_co(fecha) values
  ('2025-01-01'),
  ('2025-01-06'),
  ('2025-03-24'),
  ('2025-04-17'),
  ('2025-04-18'),
  ('2025-05-01'),
  ('2025-06-02'),
  ('2025-06-23'),
  ('2025-06-30'),
  ('2025-07-20'),
  ('2025-08-07'),
  ('2025-08-18'),
  ('2025-10-13'),
  ('2025-11-03'),
  ('2025-11-17'),
  ('2025-12-08'),
  ('2025-12-25'),
  ('2026-01-01'),
  ('2026-01-12'),
  ('2026-03-23'),
  ('2026-04-02'),
  ('2026-04-03'),
  ('2026-05-01'),
  ('2026-05-18'),
  ('2026-06-08'),
  ('2026-06-15'),
  ('2026-06-29'),
  ('2026-07-20'),
  ('2026-08-07'),
  ('2026-08-17'),
  ('2026-10-12'),
  ('2026-11-02'),
  ('2026-11-16'),
  ('2026-12-08'),
  ('2026-12-25'),
  ('2027-01-01'),
  ('2027-01-11'),
  ('2027-03-22'),
  ('2027-03-25'),
  ('2027-03-26'),
  ('2027-05-01'),
  ('2027-05-10'),
  ('2027-05-31'),
  ('2027-06-07'),
  ('2027-07-05'),
  ('2027-07-20'),
  ('2027-08-07'),
  ('2027-08-16'),
  ('2027-10-18'),
  ('2027-11-01'),
  ('2027-11-15'),
  ('2027-12-08'),
  ('2027-12-25')
on conflict do nothing;

create or replace function public.siguiente_dia_habil_co(d date) returns date
language sql stable set search_path = public as $$
  select min(x)::date from generate_series(d + 1, d + 20, interval '1 day') x
  where extract(isodow from x) < 6 and not exists (select 1 from public.festivos_co f where f.fecha = x::date)
$$;

-- 3) Regla de traslado: = liquidación; si no hay liquidación y la PO se marca Terminada, siguiente día hábil tras la llegada a Firplak.
--    Nunca toca un traslado ingresado a mano (solo actúa si está vacío o si lo puso la regla).
create or replace function public.fn_importaciones_traslado() returns trigger
language plpgsql set search_path = public as $$
declare regla boolean := NEW.fecha_traslado is null or coalesce(NEW.fecha_traslado_fuente, '') like 'regla%';
begin
  if TG_OP = 'UPDATE' and NEW.fecha_traslado is distinct from OLD.fecha_traslado and coalesce(NEW.fecha_traslado_fuente, '') not like 'regla%' then
    return NEW;  -- alguien escribió el traslado a mano en esta misma edición
  end if;
  if not regla then return NEW; end if;
  if NEW.fecha_liquidacion is not null then
    NEW.fecha_traslado := NEW.fecha_liquidacion; NEW.fecha_traslado_fuente := 'regla_liquidacion';
  elsif NEW.estado_eta = 'Terminada' and NEW.fecha_llegada_firplak is not null then
    NEW.fecha_traslado := public.siguiente_dia_habil_co(NEW.fecha_llegada_firplak); NEW.fecha_traslado_fuente := 'regla_llegada+1habil';
  elsif coalesce(NEW.fecha_traslado_fuente, '') like 'regla%' then
    NEW.fecha_traslado := null; NEW.fecha_traslado_fuente := null;  -- se borró la fecha de la que dependía
  end if;
  return NEW;
end $$;
drop trigger if exists trg_importaciones_traslado on public.importaciones;
-- El historial es un trigger AFTER, así que registra el traslado que deja esta regla.
drop trigger if exists a_trg_importaciones_traslado on public.importaciones;
create trigger a_trg_importaciones_traslado before insert or update on public.importaciones
  for each row execute function public.fn_importaciones_traslado();

-- 4) El historial también registra la fecha de entrega conteo
create or replace function public.fn_importaciones_historial() returns trigger
language plpgsql security definer set search_path = public as $$
declare c text; v_old text; v_new text; n jsonb := to_jsonb(NEW); o jsonb;
begin
  if TG_OP = 'UPDATE' then o := to_jsonb(OLD); else o := '{}'::jsonb; end if;
  foreach c in array array['fecha_bodega_origen', 'fecha_embarque', 'fecha_llegada_puerto', 'fecha_pago_impuestos', 'fecha_levante', 'fecha_salida_puerto', 'fecha_llegada_firplak', 'fecha_entrega_conteo', 'fecha_liquidacion', 'fecha_traslado', 'anticipo1_fecha_pago', 'anticipo2_fecha_pago', 'factura_radicada_fecha', 'factura_radicada'] loop
    v_old := o ->> c; v_new := n ->> c;
    if v_new is distinct from v_old and not (TG_OP = 'INSERT' and v_new is null) then
      insert into public.importaciones_historial(importacion_id, campo, valor_anterior, valor_nuevo, fuente)
      values (NEW.id, c, v_old, v_new, coalesce(n ->> (c || '_fuente'), 'manual'));
    end if;
  end loop;
  return NEW;
end $$;

-- 5) Vista con las columnas nuevas al final
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
    i.factura_radicada_fecha_fuente,
    i.fecha_entrega_conteo,
    i.fecha_entrega_conteo_fuente
   FROM ((importaciones i
     JOIN proveedores_impo p ON ((p.id = i.proveedor_id)))
     LEFT JOIN responsables r ON ((r.id = i.responsable_id)));
alter view public.v_importaciones_metricas set (security_invoker = on);
