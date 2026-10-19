# track-importaciones
# COMEX Track · Importaciones

Dashboard local para el seguimiento de las PO de importación. Usa la misma base de Supabase que COMEX Track (tablas `proveedores_impo`, `importaciones` y la vista `v_importaciones_metricas`), pero es una aplicación aparte.

## Cómo arrancarlo (Windows)

1. Copia la carpeta `dashboard_impo` completa a tu computador (por ejemplo, a `Documentos\dashboard_impo`).
2. En esa carpeta, copia `.env.example` y renombra la copia a `.env`. Ábrelo con el Bloc de notas y pega la llave en `SUPABASE_KEY=`:
   ```
   SUPABASE_URL=https://ahcrtxmlotzagtwwyvny.supabase.co
   SUPABASE_KEY=la_llave_aqui
   ```
3. Abre una terminal en la carpeta y ejecuta:
   ```
   python server.py
   ```
   Solo necesita Python 3; no hay que instalar nada más. Si falta el `.env` o la llave, el programa te lo dice en pantalla.
4. Abre **http://localhost:8001** en el navegador. Para detenerlo, presiona Ctrl+C en la terminal.

Puede correr al mismo tiempo que COMEX Track de exportaciones, porque usa otro puerto (8001).

## Cómo se protege la llave

- La llave solo vive en el archivo `.env` de tu computador. **No compartas ni subas ese archivo** a ningún repositorio o chat.
- El navegador nunca ve la llave. La página le pide los datos a `server.py`, y este los pide a Supabase agregando la llave.
- `server.py` solo atiende pedidos hechos desde el mismo computador (`localhost`). Solo deja leer `importaciones`, `v_importaciones_metricas`, `proveedores_impo` y `responsables`, y solo deja crear y editar en `importaciones`. No permite borrar. Para editar exige el id de una sola PO, y rechaza columnas que no existen o que se calculan solas, como el leadtime.

## Qué llave usar

- **Con la llave `anon` (pública):** el dashboard solo lee. Con los permisos actuales:
  - Se pueden leer la vista y los responsables, pero **no la tabla `proveedores_impo`**. Por eso la lista de proveedores se arma con las PO cargadas y el responsable que se sugiere al crear una PO es el de la última PO de ese proveedor, no el del reparto. Hoy esa sugerencia no coincide con el reparto en 4 proveedores: Jiangmen Ti House, Kronospan, Zhejiang Jinyuan y Reliance. El formulario muestra un aviso cuando pasa esto.
  - Guardar no funciona. El dashboard muestra «la llave no tiene permiso para escribir».
- **Para crear y editar PO** se necesita una llave con permiso de escritura. Hoy COMEX Track usa la llave `service_role`, que permite todo en toda la base, incluso saltarse la seguridad. Si usas esa llave, solo debe estar en el `.env` y nunca en el código de la página. Recomendación:
  1. **Rotar** la llave `service_role` en Supabase (Project Settings → API Keys), porque ya quedó expuesta en el `app.js` de COMEX Track.
  2. Más adelante, pasarse a una llave limitada (o a usuarios con inicio de sesión) que solo pueda escribir en `importaciones`.
- **Revisar la seguridad por filas (RLS)** de `proveedores_impo` e `importaciones`. Hoy la `anon` lee `importaciones` a través de la vista, pero no lee `proveedores_impo`. Conviene definir a propósito quién lee y quién escribe en cada tabla.

## Qué hace

- **Importaciones:** muestra las PO activas, es decir, todas menos las Terminadas y Canceladas. Una casilla deja ver también las cerradas. Se puede filtrar por responsable, proveedor, prioridad y estado, y buscar por texto. Las vencidas salen arriba, en rojo.
- **Detalle PO:** muestra los 30 campos de la lista de SharePoint, en el mismo orden, y la línea de tiempo de los 8 hitos, con los días entre cada uno. Avisa si hay fechas fuera de orden.
- **Nueva PO / Editar:**
  - Las listas desplegables son las mismas que acepta la base.
  - Al escoger el proveedor se llena el responsable, y se puede cambiar.
  - El # PO es obligatorio y no se puede repetir.
  - La llegada a Firplak no puede ser anterior al envío de la OC.
  - Si los hitos están fuera de orden, el formulario avisa, pero deja guardar de todos modos.
  - Al editar solo se envían los campos que cambiaron, junto con la fecha de edición.
- **KPI:**
  - **Cumplimiento:** el % de PO que llegaron a Firplak en la ETA según OC o antes.
  - **Leadtime real promedio:** desde el envío de la OC hasta la llegada a Firplak.
  - Se muestran por mes de llegada, por proveedor y por responsable, junto con la lista de PO vencidas.

**Vencida**, según la vista de la base, es una PO activa cuya ETA estimada FPK ya pasó. Si no tiene ETA estimada FPK, se usa la ETA según OC.
