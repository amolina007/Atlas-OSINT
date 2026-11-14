# Pulso económico (dev)

`#economia` / menú hamburguesa. Chile: dólar, UF, IPC mensual (12 meses separado), TPM nominal, cobre e Imacec interanual. Sin inferencia de IA.

`/.netlify/functions/economy?indicator=dolar` (lista cerrada de seis códigos) utiliza indicadores.cl v1, que redistribuye series SII/BCCh/INE. Cada tarjeta enlaza a la fuente oficial y acredita al distribuidor. Verificación real: 2026-11-14. Mindicador fue descartado porque devolvía IPC de diciembre 2025.

Histórico completo del proveedor para dólar y UF; recursos individuales para otras series. Se entregan hasta seis años; la interfaz ofrece 1M, 6M, 1A, 5A e informa la cobertura realmente recibida. Se excluyen valores futuros de UF, nulos y valores no numéricos. TPM nominal solamente, escalonada entre decisiones. La fecha de un período mensual no se presenta como fecha de publicación.

Caché pública CDN y persistente `atlas-dev-economy-v1`, una hora, con conservación explícita de la última respuesta ante fallos. No se guarda información personal en la caché. Descarga solo al entrar a la sección. API y función no consumen inferencia de IA; hosting/ejecución siguen sujetos al plan Netlify.

Favoritos: `public.atlas_dev_economic_favorites`, clave `(user_id, indicator)`, identidad Core via `window.auraClient`. RLS de propietario para select/insert/delete, sin acceso anon ni actualización de propietario. Cambio de cuenta limpia estado; epochs impiden que una respuesta anterior contamine la nueva sesión. Cambios de dispositivo se sincronizan al entrar o volver visible. La migración corresponde solo a la tabla dev.

Pruebas: `node --test tests/economy.test.mjs`. Datos reales contra los seis conectores; RLS con owner/stranger en transacción revertida. La prueba de navegador autenticada debe comprobar guardar, recargar y recuperar en viewport móvil.
