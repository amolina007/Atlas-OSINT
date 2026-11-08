# Seguimiento automático en dev

Supabase Cron ejecuta `atlas_private.dispatch_story_updates()` cada cinco minutos.
Despacha hasta cuatro historias activas por tanda, priorizando las revisadas hace más tiempo,
con un mínimo de una hora entre intentos por historia. La cola puede alargar ese intervalo.
Cada revisión examina hasta tres candidatas de los últimos treinta días y comparte el
motor de contraste, síntesis y deduplicación con la revisión manual.

El destino está fijado a la función background de **dev**. Netlify no programa automáticamente
funciones en branch deploys, de ahí el uso de Cron. No se usan sesiones de usuarios ni
credenciales de administrador en Netlify.

## Autorización del trabajo

Cada despacho genera una capacidad aleatoria de 256 bits, válida durante quince minutos
para una única historia. La tabla privada guarda solo su hash. El worker reclama el trabajo
una sola vez; la capacidad permite leer únicamente eventos y marcas de seguimiento,
agregar eventos con control de versión y cerrar el trabajo. No permite escoger otro
propietario, leer notas privadas, editar el título, borrar eventos ni cambiar `lastSeen`.
El cierre invalida la capacidad. Una historia pausada invalida su trabajo al acceder.

La RPC `atlas_dev_story_job` es intencionalmente ejecutable por `anon`, con validación
obligatoria de esta capacidad; una llamada sin ella no revela información. Esta es la
razón del aviso del asesor sobre SECURITY DEFINER. La tabla de trabajos tiene RLS sin
políticas y sin permisos para clientes, intencionalmente inaccesible. Las políticas de
propiedad de `atlas_dev_research` no cambian.

## Operación

Consultar solo `status`, `attempted_at`, `completed_at`, `expires_at` y `request_id` para
verificar trabajos. Nunca imprimir capacidades ni cuerpos de peticiones de pg_net.
`checkedAt` avanza exclusivamente tras una revisión completa; los errores conservan los
datos previos y permiten reintentar en la siguiente hora. La deduplicación y el control de
versión protegen también frente a una revisión manual simultánea.

Desactivar: `select cron.unschedule('atlas-dev-story-updates');`.
La línea de tiempo usa fechas de **publicación**, expresamente identificadas, ya que no
todas las fuentes ofrecen una fecha fiable del evento. No inventa fechas de hechos.

## Portada preparada

`atlas-dev-prepared-news` programa cada hora (minuto 7 UTC) una reserva de hasta 72
noticias públicas con síntesis y contexto completos. `atlas_private.feed_job` autoriza
una sola ejecución con una capacidad efímera; no contiene ni permite consultar cuentas.
La RPC `atlas_dev_feed_job` únicamente reclama/cierra ese trabajo validando su capacidad.
Los avisos de SECURITY DEFINER y RLS sin políticas tienen el mismo propósito que arriba.

Se preparan tres candidatas simultáneamente, con un presupuesto de once minutos por
lote; se guarda el avance y se conserva la reserva válida anterior si falla una fuente.
La portada entrega 24 noticias completas y «Ver más noticias» amplía en bloques de 24.
Si las fuentes no permiten reunir suficientes noticias válidas, no se inventan ni se
publican resúmenes incompletos para rellenar cupos. El navegador puede seguir preparando
resultados de búsquedas específicas con su presupuesto limitado habitual.

## Lo esencial de hoy y coberturas (dev)
El trabajo horario de noticias prepara también `briefing` en el mismo almacén privado de Blobs. El feed recibe el resultado ya calculado; no espera llamadas al modelo. Si la preparación falla se conserva la selección anterior. Solo se muestran en Lo esencial historias publicadas en las últimas 24 horas.

El modelo propone grupos del mismo suceso y elige índices de párrafos existentes. La validación publica exclusivamente texto y enlaces de síntesis guardadas, descarta referencias ajenas al grupo y exige dos publicaciones cronológicamente distintas para mostrar Antes/Ahora. La clasificación semántica sigue siendo automática y puede equivocarse; no se presenta el número de medios como prueba de confirmación independiente. El resto del feed conserva noticias sin agrupar; los filtros se aplican antes de agrupar y la paginación añade 24 tarjetas.
