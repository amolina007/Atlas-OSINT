# ATLAS OSINT

Noticiero de fuentes abiertas de Convergencia Aura, con contexto territorial y herramientas de análisis estratégico.

## Estado

La entrada principal de `dev` es «El mundo, en común», con cinco destinos: Hoy, Territorio, Pulso, Fuentes y Aportar. El noticiero utiliza la función RSS existente; no se presenta como una cobertura exhaustiva de todas las fuentes públicas ni como verificación independiente.

- **Hoy:** publicaciones atribuidas a sus medios, síntesis, fecha, enlace y contexto accesible con un toque.
- **Territorio:** publicaciones a un máximo de 500 km de la ubicación elegida, con geografía aproximada. No se solicita GPS automáticamente.
- **Pulso / Aportar:** borradores ciudadanos locales, sin verificar y sin envío público. Guardado explícito con consentimiento, descarga JSON y eliminación. El almacenamiento no está cifrado ni separado por cuentas: en un dispositivo compartido pueden verlo otras personas con acceso a ese navegador. Máximo 50 borradores. No hay archivos adjuntos ni recolección de redes sociales.
- **Fuentes:** directorio derivado de las publicaciones de la consulta actual; no inventa corroboraciones. Conserva los accesos a Mapa estratégico y Mercados.

El mapa mantiene el piloto de la guerra ruso-ucraniana y sus datos editoriales de demostración. `main` y producción requieren autorización independiente.

La participación pública, la moderación, los permisos por identidad y la recepción de evidencias quedan pendientes de conectar a un backend antes de habilitar publicaciones ciudadanas.

## Principios

- Evidencia trazable antes que afirmaciones.
- Confianza explícita y niebla de guerra.
- Separación entre hechos, afirmaciones, inferencias e hipótesis.
- Posiciones deliberadamente aproximadas y sin valor táctico en tiempo real.
- Protección de fuentes, civiles y datos sensibles.

## Estructura

- `dist/index.html`: interfaz principal.
- `dist/styles.css`: sistema visual.
- `dist/app.js`: datos piloto e interacciones.
- `dist/newsroom.css`: portada móvil y cinta de cinco botones, con adaptación a escritorio.
- `dist/newsroom.mjs`: navegación, directorio de fuentes y borradores privados locales.
- `dist/favicon.svg`: identidad mínima.
- `.openai/hosting.json`: configuración de ChatGPT Sites.
- `docs/`: especificación funcional y esquema propuesto para Supabase.

## Desarrollo local con Netlify

Pruebas: `npm test` (Node.js 18.14 o superior).

Requiere Node.js 18.14 o superior. En Windows puede instalarse desde
[nodejs.org](https://nodejs.org/) o con PowerShell:

```powershell
winget install OpenJS.NodeJS.LTS
```

Después de instalar Node.js, cierra y vuelve a abrir PowerShell. Para descargar
Atlas por primera vez ejecuta:

```powershell
cd $HOME\Documents
git clone https://github.com/amolina007/Atlas-OSINT.git
cd Atlas-OSINT
git switch dev
npm run dev
```

Si Atlas ya está descargado, entra en su carpeta y ejecuta:

```powershell
git switch dev
git pull
npm run dev
```

Abre `http://localhost:8888` en el navegador. El comando usa Netlify Dev en
modo local y sin conexión con la cuenta de Netlify, por lo que no crea un
despliegue ni consume créditos. Para detenerlo presiona `Ctrl+C`.

Los cambios se realizan en `dist/`. Basta guardar y recargar el navegador para
verlos. No uses `netlify deploy` ni fusiones `dev` con `main` hasta autorizar la
publicación.

> Prototipo editorial. No sustituye fuentes oficiales ni asesoramiento de seguridad.


## Panel compartido de sesión

El logo y el botón de cuenta abren el panel compartido servido desde AuraCore.
Usa el cliente existente `window.auraClient`, muestra el saldo de AC y la EXP
acumulada de Core por separado, y ocho proyectos con estado y «Ver más».
No convierte ELO a EXP ni calcula EXP desde el saldo. «Iniciar sesión» abre el
diálogo ya existente de Atlas; sin el script compartido conserva ese acceso.
Requiere que el componente de AuraCore esté publicado. No modifica Supabase.


### Selección del panel por entorno

El cargador local del panel elige
`https://dev--convergencia-aura-core.netlify.app/js/aura-hub.js` para los dominios
`dev--*.netlify.app`, `dev.convergenciaaura.cl` y localhost. En dominios de
producción sigue usando `https://core.convergenciaaura.cl/js/aura-hub.js`.
Esto evita que un despliegue dev cargue accidentalmente el panel antiguo de main.
No se cambia main ni se trasladan sesiones entre dominios.

Atlas conserva `script-src self`: `dist/_redirects` sirve el panel mediante rutas del mismo origen (`/aura-core-dev/aura-hub.js` en dev y `/aura-core/aura-hub.js` en producción), con proxy al Core correspondiente. No copia el panel ni permite nuevos orígenes de scripts. Las cabeceras se mantienen en `netlify.toml`.

Verificación: `node --test tests/aura-hub.test.cjs` comprueba cuatro casos de selección de entorno y sus destinos de proxy. En el despliegue dev se verificó el panel anónimo en escritorio y a 390 px: ocho proyectos con estado, «Ver más (3)» despliega once y «Ver menos» vuelve a ocho. Los importes reales se verificaron únicamente en Core con la sesión existente.

## Observatorio «Comprender el mundo» (prototipo local en dev)

Nueva entrada: `/observatorio.html`, accesible desde el botón «Observatorio» de Atlas.
Ejecutar con Node.js 22 o superior: `npm run dev:observatorio`, luego abrir
`http://127.0.0.1:3998/observatorio.html`. Este servidor sirve el observatorio y su
conector; para las funciones anteriores de Atlas, usar `npm run dev`.

- Mapa OpenStreetMap/Leaflet con filtros por proveedor, búsqueda y periodo.
- USGS: feed M≥2,5 de los últimos siete días. NASA EONET v3: hasta 100 eventos
  en treinta días; se representa la última geometría puntual disponible.
- Consulta real desde `netlify/functions/observatory.mjs`, sin claves. Caché en
  memoria de cinco minutos, tiempo límite por proveedor y fallos independientes.
  No se inventan datos si un proveedor falla; la UI muestra cobertura parcial.
- Investigación única local: hasta 100 evidencias con copia de metadatos y fecha
  de consulta, grafo de pertenencia, cronología, notas y exportación JSON.
  No hay sincronización, corroboración automática ni importación JSON.
- El título original de cada evento se conserva en el idioma del proveedor.
  Las notas quedan en localStorage, visible para quien use ese perfil del navegador.
- Pruebas: `npm test` incluye normalización, coordenadas, enlaces seguros,
  geometría reciente de NASA, respuesta malformada y caída parcial.

Este cambio permanece local en `dev`; no se publicó ni se modificó `main`.

## Noticias y participación de Convergencia (dev, noviembre 2026)

`dev.atlas.convergenciaaura.cl/` abre el observatorio con el feed de noticias;
`/atlas-anterior` conserva Atlas anterior. Solo los hosts de desarrollo se reescriben.

- Ocho consultas temáticas de Google News RSS (hasta 25 titulares cada una),
  fuentes atribuidas y enlaces al agregador, deduplicación por URL normalizada,
  orden por fecha/likes/comentarios, búsqueda, medio, periodo y paginación.
- El feed no implica verificación editorial ni cobertura exhaustiva. Noticias sin
  coordenadas confiables se mantienen fuera del mapa; USGS y NASA siguen en Panorama.
- `atlas_dev_news_likes` y `atlas_dev_news_comments` reutilizan Supabase Auth de
  Convergencia. La interfaz admite Google de Core y contraseña de cuenta existente.
  Un like por usuario/noticia, comentarios hasta 1500 caracteres, cinco comentarios
  por minuto, eliminación solo por autor. Conteos mediante RPC agregado.
- Lectura pública; escrituras requieren usuario autenticado no anónimo. RLS impide
  suplantar al autor y borrar interacciones ajenas. Sin service-role en cliente.
  El nombre del comentario procede del perfil de Auth y no acredita identidad verificada.
- Compartir usa el menú nativo, copia al portapapeles o un enlace seleccionable.
  Comparte el enlace original del feed; no publica en redes automáticamente.
- La migración de desarrollo se aplicó en el proyecto compartido sin alterar tablas
  de producción. Las cuentas son compartidas; las interacciones de Atlas dev no.

Verificación: pruebas unitarias de RSS/deduplicación/fallos parciales; SQL en
transacción revertida con dos usuarios temporales valida inserción, conteos públicos,
rechazo de autor falsificado y protección contra borrado ajeno. No se publicaron
comentarios ni likes de prueba con una cuenta real. El servidor local usa
`ATLAS_PORT` opcional; su proxy no emula los componentes Core de Netlify.

### Formato Convergencia y prueba social en dev

Atlas incorpora el acceso oficial a Core (sesión, EXP, Aura Coin y proyectos), su globo y una cinta inferior permanente con Noticias, Mapa, Investigación, Fuentes y Mi cuenta. Los recursos Core se resuelven mediante proxies separados para dev y producción.

Se verificaron likes y comentarios con la cuenta real autorizada, incluida persistencia tras recargar y limpieza de los registros de prueba. Compartir ofrece un diálogo con copia del enlace y menú nativo cuando está disponible; informa cancelación o permite copiar manualmente si el navegador restringe el portapapeles.

### Noticias en mapa e investigación

El feed permite agregar titulares a la investigación local y abrirlos en el mapa. Se conservan medio, enlace, fecha de publicación y fecha de consulta; no se duplican evidencias de la misma noticia. El mapa combina USGS/NASA con noticias según los filtros activos del feed. Un índice local de topónimos sitúa únicamente titulares con una sola mención reconocida, como referencia aproximada explícitamente etiquetada; sin ubicación o con varias menciones no se dibuja un punto, pero la noticia permanece en la lista. No es geolocalización confirmada ni cobertura geográfica exhaustiva.

### Portada editorial

La portada utiliza tarjetas temáticas originales (no fotografías de los hechos), tipografía editorial y navegación inferior única. En PC incorpora un mapa contextual y una vista de las últimas evidencias de la investigación. En móvil los filtros secundarios se despliegan con Filtros. Siguiendo permite elegir temas; estas preferencias se conservan en localStorage y no se sincronizan con la cuenta. Se mantienen los titulares reales, atribución y acciones sociales.

### Imágenes de los medios

Las tarjetas solicitan metadatos de imagen bajo demanda (hasta tres consultas simultáneas). El servidor solo acepta IDs presentes en el feed público: recupera el sitio del medio indicado por Google News, busca el titular completo en portada o en su RSS anunciado y consulta los metadatos Open Graph/Twitter del artículo correspondiente. Los enlaces deben pertenecer al mismo medio. No se descargan ni se republican artículos completos; la imagen pública se sirve mediante un endpoint del mismo origen con atribución y enlace a la publicación. El endpoint solo admite IDs del feed y formatos raster; no acepta URLs arbitrarias.

La búsqueda no es exhaustiva: una noticia fuera de portada/RSS, un bloqueo del medio, ausencia de metadatos o fallo de imagen conserva la ilustración temática. Se rechazan destinos locales/privados, se valida cada redirección y se limita tiempo/tamaño de respuesta. Los resultados se cachean diez minutos. No se eluden restricciones de acceso.

### Investigaciones de la cuenta (dev)

Investigación permite crear y seleccionar varios cuadernos privados, renombrarlos, archivar/restaurar y exportar JSON. `Investigar +` elige el destino o crea uno nuevo desde el feed; también funciona desde el mapa. El cuaderno local anterior se conserva y se copia explícitamente con **Guardar local en mi cuenta**.

Los cuadernos de cuenta se guardan en `atlas_dev_research` con la sesión Convergencia: RLS por propietario no anónimo, sin lectura pública ni permisos para cambiar propietario/versiones. Máximo 100 investigaciones por cuenta (incluye archivadas), 100 fuentes por investigación y 1 MB por documento. El guardado automático usa una versión esperada; si otro dispositivo cambió el documento se conserva el borrador y se ofrece guardarlo como otra investigación. Los borradores pendientes se respaldan por cuenta en este navegador y se recuperan al reconectar. Sin conexión, mantener el navegador o exportar antes de borrar sus datos.

La lista se actualiza al volver a la ventana, cada 30 segundos mientras está visible y sin cambios pendientes, o con **Sincronizar / Reintentar**. No es edición colaborativa en tiempo real. PC y móvil deben ingresar con la misma cuenta. La sincronización se habilita solo en los hosts de dev/local; producción permanece independiente.

Validación: 31 pruebas unitarias, incluyendo dos clientes concurrentes, guardado durante escritura, recuperación offline, aislamiento de borradores y archivo reversible. Verificación SQL en transacción revertida: lectura/escritura privada entre dos usuarios temporales, rechazo de anónimos, propietario inmutable y rechazo de versión desactualizada. Sin hallazgos del asesor de seguridad para la nueva tabla/función.

Las tarjetas ya no usan ilustraciones de relleno: priorizan la fotografía del medio. Si no está disponible, solo muestran un mapa cuando el titular incluye un lugar inequívoco con contexto geográfico explícito (por ejemplo «en Gaza»). En los demás casos, la tarjeta es de texto; un fallo de teselas también oculta el mapa. La referencia se etiqueta como aproximada.

### Lectura con síntesis (dev)

El titular y «Leer síntesis y contexto» abren una lectura dentro de Atlas. La función `news-summary` acepta únicamente IDs del feed, resuelve el artículo en el dominio del medio y exige título coincidente y cuerpo de al menos 180 palabras (HTML de artículo o JSON-LD). No usa el titular/descripción como sustituto del cuerpo, ni accede a contenido marcado como de pago. Reutiliza la descarga HTTPS limitada y protección contra destinos privados.

OpenAI mediante Netlify AI Gateway genera una paráfrasis de 100–180 palabras con referencias internas a párrafos. Se comprueban fragmentos de respaldo y una segunda llamada evalúa apoyo factual/atribuciones; si falla, no se muestra síntesis. El contexto procede exclusivamente del texto recuperado. Se indica explícitamente que es una sola fuente y no corroboración independiente: los controles reducen errores, no garantizan exactitud absoluta. No se devuelve el texto íntegro ni citas extensas al navegador. El usuario puede abrir el original o guardar la noticia en una investigación.

Credenciales solo en servidor, modelo `gpt-4.1-mini` confirmado en el catálogo del gateway, SDK oficial, límite 8 solicitudes/minuto por IP y dominio, caché de diez minutos por instancia y cinco minutos HTTP. Dos llamadas por síntesis generan consumo de AI Gateway; no se generan automáticamente al cargar el feed. Producción devuelve 404 para este endpoint.

### Hashtags y cercanía (dev)

Cada tarjeta y la vista de lectura incluyen hashtags generados con categorías y términos explícitos del titular. Pulsarlos filtra el feed disponible por la misma etiqueta y ofrece quitar el filtro. No se llama al modelo para generar etiquetas. Las ubicaciones usan el índice de topónimos y contexto geográfico explícito del titular; no representan coordenadas verificadas del hecho. La ausencia o ambigüedad se indica sin inventar ubicación.

Para referencias locales, pulsar la ubicación busca otras referencias locales dentro de 100 km, con selector 50/100/250 km y distancia de Haversine entre los puntos aproximados. Una referencia de país permite buscar la misma referencia, sin calcular proximidad desde su centro. No es una búsqueda exhaustiva en la web: aplica a los titulares recuperados, sus fechas y filtros visibles. Pulsar una etiqueta o ubicación reinicia búsqueda, medio, tema y seguimiento para mostrar resultados relacionados; conserva el orden elegido.

### Seguimientos de cuenta y lectura parcial (dev)

Los temas, hashtags y lugares se guardan por separado en `atlas_dev_news_follows`, con RLS privada por propietario no anónimo. El botón Seguir aparece al explorar un hashtag o lugar; Siguiendo combina cualquiera de los temas/hashtags/lugares elegidos. Los lugares seguidos coinciden por referencia identificada del titular (no incluyen automáticamente el radio cercano). La lista lateral permite dejar de seguir y reintentar; los temas locales anteriores se importan explícitamente. Se refresca al volver a la ventana, al reconectar y cada 30 segundos mientras está visible. Sin sesión se invita a ingresar. No se afirma guardado si falla la red; se conserva el estado anterior. Registros independientes evitan reemplazar las preferencias completas desde otro dispositivo.

La extracción de artículos incorpora Mozilla Readability/JSDOM sin ejecución de scripts y reduce el mínimo a 90 palabras reales cuando la identidad de la publicación coincide. La generación ajusta su extensión a la evidencia (60–180 palabras, sin rellenar). Si no alcanza o falla la validación, muestra una ficha atribuida: descripción pública del medio solo si coincide el titular, datos ya conocidos, límites y lecturas relacionadas por términos compartidos. Estas lecturas no se presentan como corroboración ni se usan para inventar contexto. Si solo existe el titular, lo declara. Una ficha parcial no se etiqueta como síntesis completa.

Las tarjetas fluyen en columnas de altura natural en PC y en una columna en móvil, en orden de arriba abajo por columna. Una tarjeta sin foto ni referencia geográfica no reserva un panel visual ni obliga a otra tarjeta a adoptar su altura.

Validación: 42 pruebas unitarias y transacción SQL revertida con dos usuarios temporales para lectura privada, rechazo de suplantación, borrado ajeno y usuarios anónimos. Asesor de seguridad sin hallazgos en la nueva tabla.

### Cobertura alternativa y navegación del lector (dev)
- Cuando no se recupera el cuerpo original, se consulta Google News RSS con el titular y términos del hecho. Se recuperan hasta doce medios distintos, dentro de siete días de la publicación original; las páginas conservan los controles de identidad, acceso público y SSRF.
- Un control semántico exige el mismo hecho (protagonistas, acción, lugar y fecha compatibles). Después, la síntesis y una auditoría separada exigen evidencia literal por párrafo. Las citas se asignan al medio real de cada párrafo. Compartir tema no basta ni se presenta como corroboración independiente.
- Si no hay evidencia aceptada, el lector conserva titular, fuente y descripción editorial disponible, sin párrafos explicativos de relleno. Contexto solo aparece cuando hay antecedentes documentados.
- Los controles inferiores Anterior / Agregar a investigación / Siguiente recorren una instantánea del feed filtrado y ordenado; los extremos se desactivan. Las solicitudes anteriores se cancelan al cambiar y no pueden reemplazar la noticia actual.

Validación de cobertura alternativa: la consulta ya no se detiene en los cuatro primeros medios inaccesibles. Se extraen consultas breves del titular para conservar el objeto del hecho (p. ej., «Sala Cuna Universal»), y luego se exige coincidencia del hecho con el texto recuperado. La auditoría evalúa cada bloque solo contra su párrafo citado; los bloques rechazados se omiten. El lector muestra las fechas de la cobertura alternativa para distinguir balances anteriores.

### Búsqueda pública desde ambos buscadores (dev)
Las consultas de 2 a 160 caracteres se envían a Google News RSS tras 500 ms sin escribir o al pulsar Enter. Se combinan hasta 50 resultados públicos con las coincidencias del feed, sin duplicar IDs; los filtros se siguen aplicando. Al buscar se habilitan todas las fechas. Al borrar se recupera el feed inicial. Las respuestas tardías se descartan y una caída externa conserva las coincidencias locales con opción de reintentar.
El lector y las fotos reciben el ID y la consulta, y vuelven a comprobar que el artículo pertenece a resultados recuperados por el servidor. El cliente no puede enviar una URL arbitraria para sintetizar ni descargar. La cobertura depende del índice público, no representa todas las publicaciones de Internet.

Al guardar una noticia desde el lector, la investigación conserva la síntesis lista, su contexto, referencias y fecha de generación, además de la consulta pública de origen. «Leer síntesis y contexto» en la evidencia abre esa copia guardada; si aún no había síntesis, consulta el servicio con el ID y la búsqueda original. La lectura guardada no se presenta como una actualización posterior. Durante una consulta externa pendiente, el espacio de resultados vacío muestra «Buscando noticias…»; solo termina en estado vacío cuando finaliza la consulta.

### Síntesis persistentes y reapertura rápida (dev)
Las síntesis validadas se conservan por ID de noticia en el almacén Netlify Blobs `atlas-dev-public-summaries`, separado de producción y persistente entre despliegues. La consulta de búsqueda no duplica la síntesis. Se conservan citas y fecha original de generación; son lecturas de la publicación citada, no actualizaciones en vivo. Los resultados incompletos y errores no se guardan como síntesis definitivas. Claves versionadas permiten invalidar lecturas si cambian las reglas editoriales.

El lector conserva hasta 60 lecturas públicas en el navegador y las muestra sin petición de red al reabrirlas, incluso después de recargar. Si el almacenamiento local está bloqueado o lleno, sigue funcionando en memoria. Un dispositivo nuevo recupera la copia del servidor. La primera generación mantiene selección de evidencia y auditoría individual; cada auditoría empieza apenas termina su frase, en paralelo con las restantes. Las solicitudes simultáneas a una misma instancia comparten el trabajo pendiente. No se promete generación instantánea cuando aún hay que recuperar fuentes.

La preparación anticipada comienza después de pintar el feed: cada 1,5 s la cola evalúa si puede iniciar trabajo, prioriza tarjetas visibles y mantiene un máximo de dos solicitudes y cuatro inicios por minuto. Reemplaza pendientes al cambiar filtros/búsqueda; pausa nuevos inicios fuera del feed, con un diálogo abierto, pestaña oculta o ahorro de datos. Las peticiones en curso terminan y se conservan. El lector comparte caché y solicitud pendiente con la cola; abrir/cerrar no reinicia una generación. Las tarjetas preparadas indican «Leer síntesis lista». Los fallos no disparan reintentos automáticos ilimitados; la apertura manual puede reintentarlos. No bloquea titulares, fotos ni interacción esperando las síntesis. Una apertura muy temprana puede aún mostrar preparación.

### Tendencias (dev)
El quinto botón abre `#tendencias`; la cuenta continúa en la cabecera/Core. Diseño responsive con filtros temáticos, búsqueda, Explorar, Mis encuestas y Resultados. Se crean consultas de una pregunta con selección única (2–8 opciones), múltiple, escala fija 1–5 o texto abierto. No se insertan encuestas ni votos de demostración.

`atlas_dev_polls` conserva preguntas inmutables y fechas; `atlas_dev_poll_votes` tiene clave única encuesta/cuenta. Crear, votar y administrar se ejecuta con RPC autenticada; el servidor impone límites, valida opciones, cierra recepción por fecha y prohíbe doble voto. Solo el propietario cierra, archiva o restaura. Una cuenta puede crear hasta 10 encuestas al día. Tablas con RLS; cada persona solo consulta directamente sus propios votos. Resultados agregados para miembros autenticados mediante funciones privadas con `auth.uid()` y wrappers públicos invoker. Respuestas abiertas se publican sin nombre, con aviso en el formulario; resultados nunca entregan IDs de votantes. Evolución muestra número de respuestas diarias (hora de Chile), no una serie histórica de aprobación inventada. No hay ponderación, muestra representativa ni margen de error.

Validación inicial: 61 pruebas y transacción SQL revertida con dos usuarios temporales, comprobando conteos, RLS, rechazo de duplicados, opciones inválidas y administración ajena. Asesor de seguridad sin hallazgos para los nuevos objetos de Tendencias. Migración `20261105204525_atlas_dev_trends.sql` aplicada en el proyecto compartido, únicamente objetos Atlas dev.

### Encuestas con varias preguntas (dev)
Tendencias permite crear entre 1 y 20 preguntas, combinar opción única, selección múltiple, escala 1–5 y texto, y ordenarlas antes de publicar. Todas son obligatorias; la encuesta completa se guarda atómicamente una vez por cuenta. Los resultados desglosan cada pregunta y mantienen la participación diaria de la encuesta. Las encuestas y respuestas anteriores siguen funcionando. `tests/trends-integration.sql` verifica los cuatro formatos, atomicidad, duplicados, permisos, conteos entre dos cuentas y compatibilidad dentro de una transacción revertida.

### Propuestas y administración de Tendencias (dev)
Los miembros proponen preguntas en el banco compartido; solo el administrador de Convergencia (`es_admin_plataforma`, capitán activo) publica o administra encuestas. La autorización se verifica en la base de datos, también para las RPC antiguas. El administrador puede incorporar propuestas al editor, descartarlas o volver a revisarlas. La publicación enlaza y marca las propuestas en la misma transacción. Se bloquean duplicados normalizados (tildes, puntuación y mayúsculas) y se muestran coincidencias de texto para revisión; no se promete deduplicación semántica automática. Las encuestas existentes se conservan. `tests/trends-proposals-integration.sql` verifica permisos, deduplicación, revisión, publicación y voto de miembros en una transacción revertida.

### Capa bélica: Ucrania (dev)
El mapa carga bajo demanda `dist/data/ukraine-control.geojson`, una instantánea derivada de **VIINA 2.0, Yuri Zhukov y Natalie Ayers (2023)**, con control UA/RU/CONTESTED y categoría UNKNOWN para observaciones ausentes. Incluye fecha de corte, metadatos, atribución y descarga bajo **ODbL 1.0**. Los polígonos son celdas geográficas de localidades, disueltas por categoría y simplificadas: no deben interpretarse como una línea militar exacta ni como soberanía. No se calcula control ucraniano restando polígonos rusos. Se muestra aviso de antigüedad a partir de tres días.

Actualizar el conjunto publicado (requiere Python y `shapely==2.0.7`):
```
python scripts/update-conflict-layer.py
npm test
```
Revisar el corte y publicar el archivo en `dev`. No hay actualización automática ni garantía de tiempo real. El script descarga los archivos originales del año actual, escoge el último día disponible, rechaza días incompletos, mantiene las categorías y registra hashes de los originales. `--cache-dir` solo se usa para reprocesar descargas ya obtenidas. La licencia de esta base derivada es ODbL 1.0; los enlaces a originales y licencia están dentro de sus metadatos y en el mapa. Código de integración propio, independiente de la licencia de datos.
Fuente: https://github.com/zhukovyuri/VIINA · Licencia: https://opendatacommons.org/licenses/odbl/1-0/
