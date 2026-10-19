-- COMEX Track · Importaciones · Ajustes: volumen con 3 decimales y "vencida" solo si no ha llegado
begin;
drop view if exists public.v_importaciones_metricas;
alter table public.importaciones alter column volumen_m3 type numeric(10,3);
update public.importaciones set volumen_m3 = 1.026 where numero_po = '1821';
create view public.v_importaciones_metricas as
select i.*,
       p.nombre as proveedor, p.pais,
       r.nombre as responsable,
       case when i.fecha_llegada_firplak is null or i.eta_segun_oc is null then null
            else i.fecha_llegada_firplak <= i.eta_segun_oc end            as llego_a_tiempo,
       case when i.fecha_llegada_firplak is null or i.eta_segun_oc is null then null
            else i.fecha_llegada_firplak - i.eta_segun_oc end             as dias_vs_eta_oc,
       case when i.estado_eta not in ('Terminada','Cancelada')
             and i.fecha_llegada_firplak is null
             and coalesce(i.eta_estimada_fpk, i.eta_segun_oc) < current_date
            then true else false end                                    as vencida
from public.importaciones i
join public.proveedores_impo p on p.id = i.proveedor_id
left join public.responsables r on r.id = i.responsable_id;
commit;
select numero_po, volumen_m3 from public.importaciones where numero_po = '1821';
select count(*) filter (where vencida) as vencidas from public.v_importaciones_metricas;
