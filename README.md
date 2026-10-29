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
