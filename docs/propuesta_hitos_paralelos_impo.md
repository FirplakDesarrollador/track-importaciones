# Hitos paralelos, fuente e historial · COMEX Track Importaciones

Aprobado por Catalina el 10/11/2026. Migración: `supabase/migrations/20261110_hitos_paralelos_impo.sql`, aplicada el 10/11/2026.

## Qué cambia

**1. Pagos como hitos paralelos.** Anticipo 1, anticipo 2 y factura radicada se muestran al lado de la línea logística de 10 hitos. No cambian el estado ni el orden de esos hitos.
- Columnas que ya existían: `anticipo1_fecha_pago`, `anticipo2_momento`, `anticipo2_fecha_pago` y `factura_radicada`.
- Columna nueva: `factura_radicada_fecha`.
- Estados que muestra la app:
  - **Hecho:** tiene fecha.
  - **Pendiente:** todavía no tiene fecha.
  - **Revisar:** ya pasó el momento esperado y no hay fecha. Para el anticipo 2 con momento Despacho o Contra BL, ese momento es el embarque. Para la factura, es la llegada a Firplak.
  - **No aplica:** no hay un segundo anticipo definido.

**2. Fuente de cada fecha.** Se agregaron 12 columnas `<campo>_fuente` (texto): una por cada uno de los 9 hitos y por las fechas de los 3 pagos. Los valores previstos son:
- `manual`: lo pone la app al guardar.
- `correo:<id del mensaje>`.
- `aduanimex:<archivo>`.

Las fechas cargadas antes del 10/11/2026 quedan con la fuente vacía.

**3. Historial.** La tabla nueva `importaciones_historial` guarda una fila por cada fecha que se registra o se corrige, con `campo`, `valor_anterior`, `valor_nuevo`, `fuente`, `registrado_por` y `registrado_at`.
- La llena sola el trigger `trg_importaciones_historial`, así que ni la app ni la futura detección por correo tienen que escribir en ella.
- Tiene RLS: los usuarios autenticados pueden leer e insertar, y no se puede borrar.

**4. Vista.** `v_importaciones_metricas` agrega las columnas nuevas al final y conserva `security_invoker`.

## Estado calculado (parte A)
El estado sale del último hito con fecha:
- Sin hitos o solo bodega origen: En producción.
- Embarque o salida de puerto: En tránsito.
- Llegada a puerto, pago de impuestos o levante: En aduana.
- Llegada a Firplak: En conteo, o En liquidación si así estaba marcado a mano.
- Liquidación: En liquidación.
- Traslado: Terminada.

El valor manual solo se usa como respaldo para Cancelada y para Terminada sin traslado.

## Lo que no está en esta parte
La detección automática por correo todavía no está activa. Cuando se arme, la rutina o el script debe escribir la fecha y su `<campo>_fuente` en la misma actualización. El historial queda registrado solo.

Fuentes por definir con Catalina:
- **Pago de impuestos:** ¿correo de la agencia de aduanas?
- **Levante, salida de puerto y retiro:** ¿reporte de Aduanimex (Fecha Levante, Fecha de Retiro Total)?
- **Liquidación del agente:** ¿correo de liquidación?
- **Anticipos:** ¿correo de Tesorería?

## Respaldo
En `/workspace/comex/backups/`:
- `importaciones_pre_hitos_paralelos_20261110_1610.json` (132 filas)
- `proveedores_impo_pre_hitos_paralelos_20261110_1610.json` (24 filas)
- `v_importaciones_metricas_pre_hitos_paralelos_20261110_1610.sql`
- `schema_importaciones_pre_hitos_paralelos_20261110_1610.json`

La migración solo agrega columnas. Los únicos `drop ... if exists` son de las políticas y el trigger que ella misma crea, para poder correrla de nuevo sin error.

## Actualización 10/11/2026: entrega conteo y regla de traslado
Decisiones de Catalina:
- **Traslado = liquidación.** Si no hay liquidación, el día hábil colombiano siguiente a la llegada a Firplak (sin fines de semana ni festivos). Lo aplica la base con el trigger `a_trg_importaciones_traslado`, que marca la fuente (`regla_liquidacion` o `regla_llegada+1habil`) y nunca pisa un traslado escrito a mano. El caso "llegada + 1 hábil" solo se aplica cuando la PO se marca Terminada sin liquidación, para no cerrar las PO apenas llegan.
- **Fecha entrega conteo** (manual), con su `_fuente`, entre llegada a Firplak y liquidación. Llegada sin conteo = En conteo; conteo sin liquidación = En liquidación.
- **factura_radicada_fecha**: sin completar hacia atrás por ahora.

Migración: `supabase/migrations/20261110_entrega_conteo_traslado_impo.sql` (columnas, tabla `festivos_co` 2025–2027, función `siguiente_dia_habil_co`, trigger, historial y vista).
