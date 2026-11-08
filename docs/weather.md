# Clima — Atlas dev

El modo Clima reutiliza el mapa Leaflet y conserva los modos Conflictos y Noticias. Incluye búsqueda por Open-Meteo/GeoNames, pronóstico de 48 horas, malla de 25 muestras y capas de lluvia (mm por hora), temperatura (°C), viento a 10 m (km/h, dirección de procedencia) y reportes GDACS. Las flechas señalan hacia dónde se desplaza el viento.

La cuadrícula es una visualización de muestras, no la resolución nativa ni un radar observado. Al pulsar Actualizar área visible se consulta una malla centrada en el mapa de 0,2° a 12°; se muestra extensión, separación y centro. La ficha corresponde al punto central. Las horas usan la zona de la ciudad cuando la búsqueda la proporciona, o UTC para puntos del mapa.

Cada resultado conserva consulta y rango temporal del proveedor. No se inventa fecha de emisión del modelo: el endpoint de pronóstico no la aporta. GDACS usa fecha de modificación del informe y publicación del catálogo; se filtran inundaciones, ciclones, sequías e incendios con informes de últimos 30 días. iscurrent identifica el último episodio, no garantiza que el peligro siga activo; la interfaz dice informes recientes y no reemplaza los avisos meteorológicos nacionales.

API GET /.netlify/functions/weather: mode=search&q=...; mode=forecast&lat=...&lon=...&span=4; mode=alerts. Solo dev, límites de parámetros y rate limit. Caché pública en Blobs de 15 minutos (búsquedas 24 h), última respuesta válida en fallo y fecha conservada. No hay geolocalización automática ni claves nuevas. Fuente Open-Meteo pública para uso no comercial de dev; revisar plan/licencia antes de un eventual lanzamiento comercial. Atribución CC BY 4.0 y GeoNames. GDACS atribuido a Naciones Unidas/Comisión Europea.

No se añaden radar, datos de estación, capas históricas o favoritos sincronizados que no hayan sido conectados. Fuentes: https://open-meteo.com/en/docs ; https://open-meteo.com/en/docs/geocoding-api ; https://www.gdacs.org/xml/rss.xml .
