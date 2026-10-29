begin;
alter table public.importaciones add column if not exists fecha_levante date;
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
    i.fecha_levante
   FROM ((importaciones i
     JOIN proveedores_impo p ON ((p.id = i.proveedor_id)))
     LEFT JOIN responsables r ON ((r.id = i.responsable_id)));
commit;alter view public.v_importaciones_metricas set (security_invoker = on);
