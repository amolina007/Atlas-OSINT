# ATLAS OSINT

Sistema experimental de inteligencia de fuentes abiertas para seguir conflictos mediante una interfaz estratégica inspirada en juegos 4X.

## Estado

MVP publicado como sitio privado en ChatGPT Sites. El piloto utiliza la guerra ruso-ucraniana y datos editoriales de demostración.

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
- `dist/favicon.svg`: identidad mínima.
- `.openai/hosting.json`: configuración de ChatGPT Sites.
- `docs/`: especificación funcional y esquema propuesto para Supabase.

## Desarrollo local con Netlify

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

+
+## Panel compartido de sesión
+
+El logo y el botón de cuenta abren `https://core.convergenciaaura.cl/js/aura-hub.js`.
+Usa el cliente existente `window.auraClient`, muestra el saldo de AC y la EXP
+acumulada de Core por separado, y ocho proyectos con estado y «Ver más».
+No convierte ELO a EXP ni calcula EXP desde el saldo. «Iniciar sesión» abre el
+diálogo ya existente de Atlas; sin el script compartido conserva ese acceso.
+Requiere publicar el componente de AuraCore. No se han modificado Supabase ni hosting.
+

### Selección del panel por entorno

El cargador local del panel elige
`https://dev--convergencia-aura-core.netlify.app/js/aura-hub.js` para los dominios
`dev--*.netlify.app`, `dev.convergenciaaura.cl` y localhost. En dominios de
producción sigue usando `https://core.convergenciaaura.cl/js/aura-hub.js`.
Esto evita que un despliegue dev cargue accidentalmente el panel antiguo de main.
Las políticas CSP de los sitios que las requieren permiten únicamente estos
orígenes concretos de Core en script-src; no se desactiva CSP ni se amplían las
permisiones de datos. No se cambia main ni se trasladan sesiones entre dominios.

Las cabeceras de seguridad se publican desde `dist/_headers`, junto al artefacto estático. La CSP permite los orígenes exactos de Core publicado y Core dev para cargar el panel compartido; conserva las demás restricciones. No se mantiene otra definición de cabeceras en `netlify.toml`.
