import * as maplibregl from "https://cdn.jsdelivr.net/npm/maplibre-gl@6.10.0/dist/maplibre-gl.mjs";

const demoEvents = [
  {
    id: "EVT-0916-01", kind: "ground", kindLabel: "OPERACIÓN TERRESTRE", time: "06:40 UTC", place: "Eje de Limán", lon: 37.8, lat: 49.0,
    title: "Avance ucraniano en el eje de Limán",
    short: "Operación Vivaldi",
    summary: "Fuerzas ucranianas informaron haber despejado o recuperado aproximadamente 85 km² cerca de Limán. La extensión exacta sigue bajo verificación independiente.",
    confidence: "high", confidenceLabel: "ALTA",
    facts: [["Actor principal", "Fuerzas ucranianas"], ["Área declarada", "≈85 km²"], ["Localización", "Óblast de Donetsk"], ["Estado", "Parcialmente verificado"]],
    assessment: "Ganancia localizada con valor operativo potencial. No basta, por sí sola, para inferir una ruptura del frente ni un cambio estratégico general.",
    sources: [["Mando ucraniano", "Comunicado primario", "PRIMARIA"], ["Institute for the Study of War", "Evaluación geoespacial", "ANÁLISIS"], ["Reuters", "Confirmación periodística", "PRENSA"]]
  },
  {
    id: "EVT-0916-02", kind: "air", kindLabel: "ATAQUE AÉREO", time: "08:15 UTC", place: "Nikópol", lon: 34.39, lat: 47.57,
    title: "Ataque con dron contra un autobús",
    short: "Víctimas civiles en Nikópol",
    summary: "Un ataque ruso con dron alcanzó un autobús en las proximidades de Nikópol. Los reportes del turno registran cinco muertos y siete heridos.",
    confidence: "high", confidenceLabel: "ALTA",
    facts: [["Víctimas", "5 muertos"], ["Heridos", "7 personas"], ["Plataforma", "Dron"], ["Objetivo", "Transporte civil"]],
    assessment: "Incidente civil de alta relevancia humanitaria. Las cifras cuentan con corroboración periodística, pero pueden ser revisadas por autoridades locales.",
    sources: [["Autoridad regional", "Balance inicial", "PRIMARIA"], ["Reuters", "Confirmación periodística", "PRENSA"], ["Associated Press", "Reporte independiente", "PRENSA"]]
  },
  {
    id: "EVT-0916-03", kind: "air", kindLabel: "ATAQUE AÉREO", time: "10:20 UTC", place: "Mykolaiv", lon: 32.0, lat: 46.97,
    title: "Evacuación tras ataque a un tren",
    short: "168 pasajeros evacuados",
    summary: "Un ataque dañó infraestructura ferroviaria en la región de Mykolaiv. Se evacuó a 168 pasajeros y no se informaron heridos en el balance inicial.",
    confidence: "high", confidenceLabel: "ALTA",
    facts: [["Evacuados", "168 pasajeros"], ["Heridos", "0 reportados"], ["Sector", "Ferrocarril"], ["Estado", "Servicio afectado"]],
    assessment: "Efecto inmediato sobre movilidad civil y logística. La ausencia inicial de heridos debe leerse como balance provisional.",
    sources: [["Operador ferroviario", "Comunicado operativo", "PRIMARIA"], ["Autoridad regional", "Balance de daños", "PRIMARIA"], ["Reuters", "Reporte periodístico", "PRENSA"]]
  },
  {
    id: "EVT-0916-04", kind: "air", kindLabel: "ATAQUE DE LARGO ALCANCE", time: "13:10 UTC", place: "Syzran · Taganrog", lon: 43.4, lat: 51.0,
    title: "Golpes ucranianos sobre objetivos rusos",
    short: "Refinería y complejo de drones",
    summary: "Fuentes ucranianas atribuyeron ataques contra la refinería de Syzran, instalaciones vinculadas a drones en Taganrog y un radar próximo a Millerovo.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Objetivos", "3 declarados"], ["Alcance", "Profundidad rusa"], ["Daños", "Sin cuantificar"], ["Verificación", "Parcial"]],
    assessment: "La selección de objetivos sugiere presión sostenida sobre energía, producción y vigilancia. El grado de daño requiere evidencia adicional.",
    sources: [["Estado Mayor ucraniano", "Atribución del ataque", "PRIMARIA"], ["Institute for the Study of War", "Síntesis y contexto", "ANÁLISIS"], ["Imágenes abiertas", "Indicadores parciales", "OSINT"]]
  },
  {
    id: "EVT-0916-05", kind: "diplomacy", kindLabel: "DIPLOMACIA", time: "16:30 UTC", place: "Kyiv · Moscú", lon: 32.8, lat: 52.2,
    title: "Sin acuerdo para una tregua energética",
    short: "Propuesta sin compromiso ruso",
    summary: "Kyiv manifestó disposición a una tregua sobre infraestructura energética bajo reciprocidad. No se registró un compromiso equivalente de Moscú durante el turno.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Proponente", "Ucrania"], ["Condición", "Reciprocidad"], ["Respuesta rusa", "Sin compromiso"], ["Estado", "Estancado"]],
    assessment: "La señal diplomática existe, pero todavía no constituye negociación verificable ni reduce por sí misma el riesgo de nuevos ataques.",
    sources: [["Presidencia ucraniana", "Declaración pública", "PRIMARIA"], ["Reuters", "Contexto diplomático", "PRENSA"]]
  }
];

const middleEastEvents = [
  {
    id: "MEA-REF-01", kind: "air", kindLabel: "VIGILANCIA AÉREA Y MISILÍSTICA", time: "REFERENCIA", place: "Levante", lon: 35.2, lat: 32.4,
    title: "Actividad aérea regional bajo seguimiento",
    short: "Actividad aérea regional",
    summary: "Ficha editorial para organizar reportes sobre incursiones, interceptaciones y ataques de largo alcance. No representa una posición ni una operación en tiempo real.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Cobertura", "Israel, territorios palestinos, Líbano y Siria"], ["Dominio", "Aéreo y misilístico"], ["Estado", "Monitoreo estructural"], ["Precisión", "Regional"]],
    assessment: "Las afirmaciones deben separarse por actor, hora, plataforma y evidencia visual o institucional antes de construir una secuencia operacional.",
    sources: [["ONU / OCHA", "Contexto humanitario", "INSTITUCIONAL"], ["Autoridades nacionales", "Declaraciones atribuidas", "PRIMARIA"], ["Medios y verificadores OSINT", "Corroboración cruzada", "ANÁLISIS"]]
  },
  {
    id: "MEA-REF-02", kind: "ground", kindLabel: "DINÁMICA TERRESTRE", time: "REFERENCIA", place: "Gaza · sur del Líbano", lon: 34.9, lat: 31.8,
    title: "Frentes terrestres y acceso humanitario",
    short: "Frentes y acceso",
    summary: "Capa de referencia para contrastar cambios territoriales, restricciones de acceso y efectos sobre población e infraestructura civil.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Variable", "Control y acceso"], ["Escala", "Subregional"], ["Protección", "Datos civiles agregados"], ["Estado", "Requiere actualización por fuente"]],
    assessment: "Los límites de control y evacuación son volátiles. Atlas no debe convertir anuncios de una parte en hechos cartográficos sin corroboración independiente.",
    sources: [["ONU / OCHA", "Acceso y situación humanitaria", "INSTITUCIONAL"], ["CICR", "Protección y derecho humanitario", "INSTITUCIONAL"], ["Fuentes israelíes y palestinas", "Declaraciones atribuidas", "PRIMARIA"]]
  },
  {
    id: "MEA-REF-03", kind: "diplomacy", kindLabel: "DIPLOMACIA REGIONAL", time: "REFERENCIA", place: "Teherán · Jerusalén · capitales regionales", lon: 43.0, lat: 33.0,
    title: "Disuasión, mediación y actores asociados",
    short: "Disuasión regional",
    summary: "Marco para seguir negociaciones, amenazas, sanciones, mediadores y redes de actores estatales y no estatales sin fusionarlos en un solo bloque.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Ámbito", "Regional"], ["Actores", "Estatales y no estatales"], ["Variable", "Escalada y mediación"], ["Estado", "Síntesis atribuida"]],
    assessment: "La causalidad regional requiere distinguir coordinación demostrada, afinidad política e inferencia. Cada vínculo debe conservar procedencia y confianza.",
    sources: [["Naciones Unidas", "Diplomacia multilateral", "INSTITUCIONAL"], ["Gobiernos regionales", "Posiciones oficiales", "PRIMARIA"], ["Agencias internacionales", "Contraste periodístico", "PRENSA"]]
  },
  {
    id: "MEA-REF-04", kind: "air", kindLabel: "SEGURIDAD MARÍTIMA", time: "REFERENCIA", place: "Mar Rojo · Bab el-Mandeb", lon: 42.7, lat: 15.0,
    title: "Navegación comercial y riesgo regional",
    short: "Corredor del mar Rojo",
    summary: "Seguimiento agregado de incidentes y alteraciones de rutas comerciales. No expone identificadores ni posiciones exactas de embarcaciones.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Corredor", "Suez–Bab el-Mandeb"], ["Dominio", "Marítimo"], ["Datos", "Agregados y retrasados"], ["Uso", "Análisis estratégico"]],
    assessment: "La navegación conecta el teatro militar con energía, seguros, comercio y cadenas logísticas globales.",
    sources: [["UKMTO", "Avisos de seguridad marítima", "PRIMARIA"], ["IMO", "Marco marítimo", "INSTITUCIONAL"], ["Global Fishing Watch", "Presencia AIS retrasada", "OSINT"]]
  }
];

const sudanEvents = [
  {
    id: "SDN-REF-01", kind: "ground", kindLabel: "CONTROL TERRITORIAL", time: "REFERENCIA", place: "Jartum y centro de Sudán", lon: 32.55, lat: 15.5,
    title: "Control urbano y corredores logísticos",
    short: "Jartum y eje central",
    summary: "Ficha de referencia para registrar cambios de control, combates urbanos y continuidad de corredores sin asumir que una declaración equivale a dominio efectivo.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Actores", "SAF y RSF"], ["Escala", "Regional"], ["Variable", "Control efectivo"], ["Estado", "Verificación necesaria"]],
    assessment: "En un frente fragmentado, el control de vías, puentes y nodos logísticos puede ser más informativo que colorear provincias completas.",
    sources: [["SAF", "Declaraciones atribuidas", "PRIMARIA"], ["RSF", "Declaraciones atribuidas", "PRIMARIA"], ["ONU / OCHA", "Contexto humanitario", "INSTITUCIONAL"]]
  },
  {
    id: "SDN-REF-02", kind: "ground", kindLabel: "CONFLICTO REGIONAL", time: "REFERENCIA", place: "Darfur", lon: 24.9, lat: 13.2,
    title: "Darfur: violencia y acceso humanitario",
    short: "Darfur y desplazamiento",
    summary: "Capa editorial para relacionar violencia, desplazamientos, rutas de ayuda y afectación de comunidades sin publicar datos personales o trayectorias individuales.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Región", "Darfur"], ["Prioridad", "Protección civil"], ["Datos", "Agregados"], ["Estado", "Cobertura desigual"]],
    assessment: "La escasez de comunicaciones y el acceso limitado exigen mostrar brechas de evidencia, no rellenarlas con inferencias cartográficas.",
    sources: [["ONU / OCHA", "Situación humanitaria", "INSTITUCIONAL"], ["IOM", "Desplazamiento agregado", "INSTITUCIONAL"], ["Organizaciones locales", "Reportes atribuidos", "PRIMARIA"]]
  },
  {
    id: "SDN-REF-03", kind: "diplomacy", kindLabel: "DIPLOMACIA Y ACTORES EXTERNOS", time: "REFERENCIA", place: "Sudán · región del mar Rojo", lon: 35.0, lat: 19.0,
    title: "Mediación y apoyo externo",
    short: "Mediación regional",
    summary: "Marco para registrar iniciativas diplomáticas, sanciones y apoyo exterior con atribución separada para cada actor.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Variable", "Mediación"], ["Ámbito", "Regional e internacional"], ["Método", "Atribución por fuente"], ["Estado", "Seguimiento"]],
    assessment: "Las relaciones externas deben modelarse como vínculos con distinto grado de evidencia, no como alianzas binarias presumidas.",
    sources: [["Naciones Unidas", "Proceso diplomático", "INSTITUCIONAL"], ["Unión Africana", "Mediación regional", "INSTITUCIONAL"], ["Gobiernos involucrados", "Posiciones oficiales", "PRIMARIA"]]
  },
  {
    id: "SDN-REF-04", kind: "air", kindLabel: "INFRAESTRUCTURA Y ABASTECIMIENTO", time: "REFERENCIA", place: "Puerto Sudán", lon: 37.2, lat: 19.6,
    title: "Puerto, suministros y salida al mar",
    short: "Puerto Sudán",
    summary: "Seguimiento estratégico del principal corredor marítimo y de abastecimiento mediante datos públicos agregados y retrasados.",
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Nodo", "Puerto Sudán"], ["Dominio", "Marítimo y logístico"], ["Precisión", "Regional"], ["Datos", "Sin identificadores"]],
    assessment: "La continuidad portuaria afecta ayuda, comercio, combustible y capacidad estatal; los contactos marítimos deben conservar retraso y agregación.",
    sources: [["Autoridad portuaria", "Información operativa pública", "PRIMARIA"], ["ONU / OCHA", "Abastecimiento humanitario", "INSTITUCIONAL"], ["Global Fishing Watch", "Presencia AIS retrasada", "OSINT"]]
  }
];

let events = demoEvents;
let currentTurnKey = "2026-09-16";
let turnArchive = new Map([[currentTurnKey, demoEvents]]);

const state = {
  kind: "all",
  selected: events[0].id,
  view: "theater",
  fog: true,
  conflict: ["russia-ukraine", "middle-east", "sudan", "world-resources"].includes(localStorage.getItem("atlas-conflict")) ? localStorage.getItem("atlas-conflict") : "russia-ukraine",
  resource: ["copper", "lithium", "iron", "oil", "gas", "wheat", "maize", "rice"].includes(localStorage.getItem("atlas-resource")) ? localStorage.getItem("atlas-resource") : "copper",
  resourceRegion: ["world", "americas", "europe-central-asia", "mena", "sub-saharan-africa", "south-asia", "east-asia-pacific"].includes(localStorage.getItem("atlas-resource-region")) ? localStorage.getItem("atlas-resource-region") : "world",
  perspective: localStorage.getItem("atlas-perspective") || "neutral",
  language: localStorage.getItem("atlas-language") || "es",
  layers: new Set(["control", "movements", "routes", "rail", "admin", "water", "terrain", "maritime", "aviation", "resources"])
};

const resourceRegions = {
  world: { label: "Mundo", countries: null },
  americas: { label: "Américas", center: [-82, 8], scale: 0.72, countries: ["Estados Unidos", "Canadá", "México", "Venezuela", "Brasil", "Argentina", "Chile", "Perú", "Bolivia"] },
  "europe-central-asia": { label: "Europa y Asia Central", center: [45, 52], scale: 0.75, countries: ["Rusia", "Francia", "Ucrania", "Turkmenistán"] },
  mena: { label: "Oriente Medio y Norte de África", center: [35, 27], scale: 1.5, countries: ["Arabia Saudita", "Irán", "Irak", "Emiratos Árabes Unidos", "Kuwait", "Libia", "Qatar"] },
  "sub-saharan-africa": { label: "África subsahariana", center: [22, -5], scale: 0.9, countries: ["R. D. del Congo", "Zimbabue"] },
  "south-asia": { label: "Asia meridional", center: [78, 24], scale: 2, countries: ["India", "Pakistán", "Bangladés"] },
  "east-asia-pacific": { label: "Asia oriental y Pacífico", center: [122, 5], scale: 0.78, countries: ["Australia", "China", "Indonesia", "Vietnam", "Tailandia", "Myanmar", "Filipinas"] }
};

const atlasLocationProfiles = [
  { name:"Maipú, Chile", lat:-33.5106, lon:-70.7573, country:"CL", region:"americas", language:"es", markets:["^IPSA","HG=F","CL=F","^GSPC"] },
  { name:"Santiago, Chile", lat:-33.4489, lon:-70.6693, country:"CL", region:"americas", language:"es", markets:["^IPSA","HG=F","CL=F","^GSPC"] },
  { name:"Valparaíso, Chile", lat:-33.0472, lon:-71.6127, country:"CL", region:"americas", language:"es", markets:["^IPSA","HG=F","CL=F","^GSPC"] },
  { name:"Antofagasta, Chile", lat:-23.6509, lon:-70.3975, country:"CL", region:"americas", language:"es", markets:["HG=F","^IPSA","CL=F","^GSPC"] },
  { name:"Buenos Aires, Argentina", lat:-34.6037, lon:-58.3816, country:"AR", region:"americas", language:"es", markets:["^GSPC","^IPSA","HG=F","CL=F"] },
  { name:"Lima, Perú", lat:-12.0464, lon:-77.0428, country:"PE", region:"americas", language:"es", markets:["HG=F","^GSPC","^IPSA","CL=F"] },
  { name:"São Paulo, Brasil", lat:-23.5505, lon:-46.6333, country:"BR", region:"americas", language:"pt", markets:["^GSPC","HG=F","CL=F","^IPSA"] },
  { name:"Ciudad de México, México", lat:19.4326, lon:-99.1332, country:"MX", region:"americas", language:"es", markets:["^GSPC","^DJI","CL=F","HG=F"] },
  { name:"Nueva York, Estados Unidos", lat:40.7128, lon:-74.0060, country:"US", region:"americas", language:"en", markets:["^GSPC","^IXIC","^DJI","GC=F"] },
  { name:"Madrid, España", lat:40.4168, lon:-3.7038, country:"ES", region:"europe-central-asia", language:"es", markets:["^STOXX50E","^FTSE","^GDAXI","^GSPC"] },
  { name:"Kyiv, Ucrania", lat:50.4501, lon:30.5234, country:"UA", region:"europe-central-asia", language:"uk", markets:["^STOXX50E","CL=F","GC=F","^GSPC"] },
  { name:"Moscú, Rusia", lat:55.7558, lon:37.6173, country:"RU", region:"europe-central-asia", language:"ru", markets:["CL=F","GC=F","^STOXX50E","^GSPC"] },
  { name:"Amán, Jordania", lat:31.9539, lon:35.9106, country:"JO", region:"mena", language:"ar", markets:["CL=F","GC=F","^STOXX50E","^GSPC"] },
  { name:"Singapur", lat:1.3521, lon:103.8198, country:"SG", region:"east-asia-pacific", language:"en", markets:["^HSI","000001.SS","^N225","CL=F"] },
  { name:"Tokio, Japón", lat:35.6762, lon:139.6503, country:"JP", region:"east-asia-pacific", language:"ja", markets:["^N225","^HSI","000001.SS","^GSPC"] },
  { name:"Beijing, China", lat:39.9042, lon:116.4074, country:"CN", region:"east-asia-pacific", language:"zh", markets:["000001.SS","^HSI","^N225","HG=F"] }
];

const countryLanguageDefaults = {
  CL:"es",AR:"es",PE:"es",MX:"es",CO:"es",ES:"es",BR:"pt",PT:"pt",US:"en",GB:"en",CA:"en",AU:"en",
  FR:"fr",DE:"de",IT:"it",UA:"uk",RU:"ru",PL:"pl",CZ:"cs",SK:"sk",HU:"hu",RO:"ro",BG:"bg",GR:"el",
  TR:"tr",JO:"ar",SA:"ar",AE:"ar",EG:"ar",IL:"he",IR:"fa",IN:"hi",BD:"bn",PK:"ur",CN:"zh",JP:"ja",
  KR:"ko",VN:"vi",TH:"th",ID:"id",MY:"ms",KE:"sw",TZ:"sw"
};

let atlasContext = JSON.parse(localStorage.getItem("atlas-location-context") || "null");
let atlasLanguageManual = localStorage.getItem("atlas-language-manual") === "true";

function nearestAtlasProfile(location) {
  return atlasLocationProfiles
    .map((profile) => ({ ...profile, distance:distanceKm(location, profile) }))
    .sort((a,b) => a.distance - b.distance)[0];
}

function regionFromCoordinates(lat, lon) {
  if (lon < -25) return "americas";
  if (lat > 34 && lon < 65) return "europe-central-asia";
  if (lat >= 10 && lat <= 40 && lon >= -20 && lon < 65) return "mena";
  if (lat < 12 && lon > -25 && lon < 55) return "sub-saharan-africa";
  if (lon >= 55 && lon < 95 && lat < 38) return "south-asia";
  return "east-asia-pacific";
}

function atlasLanguageForContext(context) {
  return countryLanguageDefaults[context?.country] || nearestAtlasProfile(context || {lat:0,lon:0})?.language || navigator.language.split("-")[0] || "en";
}

function applyAtlasContext(context, { suggestLanguage = true } = {}) {
  if (!context || !Number.isFinite(context.lat) || !Number.isFinite(context.lon)) return;
  atlasContext = {
    name: context.name || "Ubicación seleccionada",
    lat: Number(context.lat),
    lon: Number(context.lon),
    country: (context.country || "").toUpperCase(),
    region: context.region || regionFromCoordinates(Number(context.lat), Number(context.lon)),
    markets: context.markets || nearestAtlasProfile(context)?.markets || ["^GSPC","^IXIC","^DJI","GC=F"]
  };
  localStorage.setItem("atlas-location-context", JSON.stringify(atlasContext));
  newsLocation = { lat:atlasContext.lat, lon:atlasContext.lon };
  const input = byId("atlasLocationInput");
  if (input) input.value = atlasContext.name;
  const status = byId("atlasLocationStatus");
  if (status) status.textContent = `Contexto activo · ${atlasContext.name}`;
  const title = byId("globalContextTitle");
  if (title) title.textContent = `Atlas desde ${atlasContext.name}`;
  const newsTitle = byId("news-title");
  if (newsTitle) newsTitle.textContent = `Noticias desde ${atlasContext.name}`;
  const newsLede = byId("newsLede");
  if (newsLede) newsLede.textContent = "Prioridad territorial combinada con acontecimientos globales de alta relevancia.";
  const marketTitle = byId("markets-title");
  if (marketTitle) marketTitle.textContent = `Mercados relevantes para ${atlasContext.name}`;
  if (byId("resourceRegionSelect")) {
    state.resourceRegion = atlasContext.region;
    byId("resourceRegionSelect").value = state.resourceRegion;
  }
  if (suggestLanguage && !atlasLanguageManual) {
    state.language = atlasLanguageForContext(atlasContext);
    localStorage.setItem("atlas-language", state.language);
  }
  state.view = "world";
  document.querySelectorAll(".segmented button").forEach((button) => button.classList.toggle("active", button.dataset.view === "world"));
  applyAnalysisContext();
  renderNews();
  loadLiveNews();
  if (marketSnapshot.size) renderMarketTiles([...marketSnapshot.values()], marketSnapshotUpdatedAt);
  createMap();
}

async function resolveAtlasLocation(query) {
  const normalized = query.trim().toLocaleLowerCase();
  const known = atlasLocationProfiles.find((profile) => profile.name.toLocaleLowerCase() === normalized)
    || atlasLocationProfiles.find((profile) => profile.name.toLocaleLowerCase().includes(normalized));
  if (known) return known;
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`, { headers:{ Accept:"application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const [result] = await response.json();
  if (!result) throw new Error("Ubicación no encontrada");
  const lat = Number(result.lat);
  const lon = Number(result.lon);
  return {
    name: result.display_name.split(",").slice(0,3).join(","),
    lat, lon,
    country: result.address?.country_code?.toUpperCase() || "",
    region: regionFromCoordinates(lat,lon)
  };
}

async function detectAtlasLocation() {
  const status = byId("atlasLocationStatus");
  if (!navigator.geolocation) {
    if (status) status.textContent = "Geolocalización no disponible · escribe una ubicación";
    return;
  }
  if (status) status.textContent = "Solicitando ubicación aproximada…";
  navigator.geolocation.getCurrentPosition(async (position) => {
    const coords = { lat:position.coords.latitude, lon:position.coords.longitude };
    let context = nearestAtlasProfile(coords);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&lat=${coords.lat}&lon=${coords.lon}`, { headers:{ Accept:"application/json" } });
      if (response.ok) {
        const result = await response.json();
        context = {
          name:[result.address?.city || result.address?.town || result.address?.municipality || result.address?.county, result.address?.country].filter(Boolean).join(", "),
          lat:coords.lat, lon:coords.lon,
          country:result.address?.country_code?.toUpperCase() || context.country,
          region:regionFromCoordinates(coords.lat,coords.lon),
          markets:context.markets
        };
      }
    } catch {}
    applyAtlasContext(context);
  }, () => {
    if (status) status.textContent = "Permiso no concedido · escribe una ubicación";
  }, { enableHighAccuracy:false, timeout:9000, maximumAge:900000 });
}

const byId = (id) => document.getElementById(id);
const atlasSupabase = window.supabase?.createClient && window.ATLAS_SUPABASE
  ? window.supabase.createClient(
      window.ATLAS_SUPABASE.url,
      window.ATLAS_SUPABASE.publishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "convergencia-aura-auth"
        }
      }
    )
  : null;
let atlasAuthCallbackPending = /(?:access_token|refresh_token|error_description|error_code|code)=/i.test(location.hash + location.search);
let atlasMap = null;
let leafletMap = null;
let leafletLayers = {};
let fallbackSvg = null;
let fallbackZoom = null;
let vectorZoomFrame = null;
let vectorDetailLevel = "";
let trafficProjection = null;
let trafficRefreshTimer = null;
let resourceMarkers = [];

let strategicRoutes = [
  { type: "routes", label: "M06 / E40", coordinates: [[22.7, 48.6], [24.0, 49.8], [26.3, 50.6], [30.5, 50.4]] },
  { type: "routes", label: "M03 / E40", coordinates: [[30.5, 50.4], [32.1, 49.4], [35.0, 48.5], [36.2, 50.0], [37.8, 50.0]] },
  { type: "routes", label: "M05 / E95", coordinates: [[30.5, 50.4], [30.1, 49.2], [30.7, 48.5], [30.7, 46.5]] },
  { type: "routes", label: "M14 / E58", coordinates: [[30.7, 46.5], [32.0, 46.9], [35.1, 47.8], [36.8, 47.2], [38.0, 47.1]] },
  { type: "routes", label: "H08 · Dnipró", coordinates: [[30.5, 50.4], [32.0, 49.4], [34.6, 48.5], [35.2, 47.8]] },
  { type: "routes", label: "H20 · Donbás", coordinates: [[36.2, 50.0], [37.4, 49.3], [37.8, 48.0], [37.8, 47.1]] },
  { type: "rail", label: "Corredor Lviv–Kyiv–Járkiv", coordinates: [[23.2, 49.6], [24.0, 49.8], [28.5, 49.2], [30.5, 50.4], [34.6, 49.6], [36.2, 50.0]] },
  { type: "rail", label: "Corredor Kyiv–Dnipro–Zaporiyia", coordinates: [[30.5, 50.4], [32.0, 48.5], [34.9, 48.5], [35.2, 47.8]] },
  { type: "rail", label: "Corredor meridional", coordinates: [[24.0, 49.8], [26.2, 48.3], [30.7, 46.5], [32.0, 46.9], [35.2, 47.8]] },
  { type: "rail", label: "Corredor Donbás", coordinates: [[35.0, 48.5], [36.8, 48.0], [37.8, 48.0], [39.7, 48.0]] }
];

let controlZones = [
  { actor: "ru", label: "Control ruso reportado · este", coordinates: [[[37.0, 51.1], [40.1, 50.9], [40.3, 46.9], [37.2, 46.8], [36.3, 47.5], [37.0, 49.0], [37.0, 51.1]]] },
  { actor: "ru", label: "Control ruso reportado · sur", coordinates: [[[32.4, 46.2], [36.8, 46.3], [37.3, 47.4], [35.8, 47.6], [33.4, 47.1], [32.4, 46.2]]] },
  { actor: "ru", label: "Crimea ocupada", coordinates: [[[32.4, 46.2], [33.1, 45.2], [35.2, 44.4], [36.7, 45.0], [36.1, 45.8], [34.4, 46.2], [32.4, 46.2]]] }
];

let frontLine = [[36.8, 51.0], [37.1, 50.2], [37.7, 49.4], [37.7, 48.4], [36.9, 47.7], [35.8, 47.4], [34.4, 47.1], [33.2, 46.8]];

let movementArrows = [
  { actor: "ru", phase: "2022 · eje norte", coordinates: [[31.0, 53.0], [30.7, 51.8], [30.5, 50.7]] },
  { actor: "ru", phase: "2022–26 · presión oriental", coordinates: [[40.0, 49.8], [38.7, 49.5], [37.7, 49.2]] },
  { actor: "ru", phase: "2022 · eje meridional", coordinates: [[34.4, 45.3], [34.7, 46.4], [35.4, 47.1]] },
  { actor: "ua", phase: "2022 · recuperación noreste", coordinates: [[35.8, 49.4], [37.0, 49.8], [37.7, 50.2]] },
  { actor: "ua", phase: "2022 · recuperación oeste del Dnipró", coordinates: [[32.6, 47.1], [32.1, 46.8], [31.6, 46.7]] }
];

let waterways = [
  { label: "Dnipró", coordinates: [[32.6, 52.3], [30.5, 50.4], [32.0, 49.0], [34.6, 48.5], [35.2, 47.8], [33.4, 46.6]] },
  { label: "Dniéster", coordinates: [[24.0, 49.5], [26.1, 48.7], [28.8, 47.0], [30.2, 46.3]] },
  { label: "Bug Meridional", coordinates: [[27.0, 49.5], [29.3, 48.2], [31.9, 46.9]] },
  { label: "Donets", coordinates: [[36.0, 50.2], [37.5, 49.3], [39.4, 48.6]] }
];

let administrativeLines = [
  [[24.8, 51.4], [25.6, 48.9], [26.0, 47.8]], [[27.7, 52.0], [28.4, 49.8], [28.7, 47.4]],
  [[31.0, 52.2], [31.4, 49.4], [31.8, 46.7]], [[34.2, 51.3], [34.4, 49.0], [34.8, 46.6]],
  [[37.0, 50.8], [36.7, 48.5], [36.2, 46.7]], [[23.0, 49.2], [38.8, 49.1]],
  [[24.0, 50.6], [37.8, 50.5]], [[25.0, 47.8], [37.0, 47.8]]
];

let terrainBands = [
  { level: "high", label: "Cárpatos", coordinates: [[[22.2, 47.7], [24.8, 47.9], [26.0, 49.2], [24.3, 50.0], [22.2, 49.2], [22.2, 47.7]]] },
  { level: "mid", label: "Altiplano central", coordinates: [[[27.0, 48.0], [33.5, 48.0], [34.5, 50.0], [30.0, 51.2], [27.0, 50.0], [27.0, 48.0]]] },
  { level: "mid", label: "Altos del Donets", coordinates: [[[35.2, 47.3], [39.2, 47.3], [39.6, 49.8], [36.7, 50.1], [35.2, 47.3]]] }
];

let maritimeCorridors = [
  { label: "Corredor civil del mar Negro", coordinates: [[30.7, 46.5], [29.9, 44.8], [28.9, 43.2], [29.0, 41.2]] },
  { label: "Constanța–Bósforo", coordinates: [[28.7, 44.2], [29.1, 42.8], [29.0, 41.2]] },
  { label: "Ruta caucásica", coordinates: [[29.0, 41.2], [33.5, 42.0], [38.7, 43.0]] }
];

let aviationCorridors = [
  { label: "Corredor civil norte", coordinates: [[20.9, 52.2], [23.0, 51.8], [26.1, 50.9], [28.8, 47.0]] },
  { label: "Corredor civil occidental", coordinates: [[20.9, 52.2], [21.3, 49.9], [26.1, 47.0], [29.0, 41.2]] },
  { label: "Corredor civil mar Negro", coordinates: [[28.8, 47.0], [28.7, 44.2], [29.0, 41.2]] }
];

// Muestra editorial para que el estado sin credenciales siga siendo legible.
// No representa observaciones reales ni posiciones de vehículos concretos.
let editorialTrafficContacts = {
  aviation: [
    { lon: 21.0, lat: 52.0, count: 7 }, { lon: 24.0, lat: 50.8, count: 4 },
    { lon: 27.0, lat: 48.5, count: 3 }, { lon: 28.5, lat: 44.0, count: 5 },
    { lon: 31.5, lat: 42.0, count: 6 }
  ],
  maritime: [
    { lon: 29.0, lat: 44.0, count: 8 }, { lon: 29.5, lat: 42.2, count: 11 },
    { lon: 32.5, lat: 42.0, count: 5 }, { lon: 37.5, lat: 43.0, count: 7 }
  ]
};

let knownCapabilitySectors = [
  { actor: "ua", type: "Defensa aérea reportada", region: "centro-norte", coordinates: [30.4, 50.2] },
  { actor: "ua", type: "Sector defensivo", region: "noreste", coordinates: [36.0, 49.8] },
  { actor: "ua", type: "Artillería reportada", region: "eje oriental", coordinates: [36.1, 48.3] },
  { actor: "ru", type: "Concentración blindada reportada", region: "sector oriental", coordinates: [38.4, 49.2] },
  { actor: "ru", type: "Defensa aérea reportada", region: "Crimea", coordinates: [34.2, 45.3] },
  { actor: "ru", type: "Sector defensivo", region: "litoral sur", coordinates: [35.2, 46.7] }
];

// D3 interpreta los anillos esféricos en sentido horario. Normalizamos los
// polígonos editoriales para impedir que se rellene el complemento del área.
function normalizedPolygon(rings) {
  return rings.map((ring) => {
    const signedArea = ring.slice(0, -1).reduce((sum, point, index) => {
      const next = ring[index + 1];
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0) / 2;
    return signedArea > 0 ? [...ring].reverse() : ring;
  });
}

let infrastructureZones = [
  { type: "energy", coordinates: [24.8, 49.6] }, { type: "energy", coordinates: [30.4, 50.1] },
  { type: "energy", coordinates: [34.8, 48.5] }, { type: "energy", coordinates: [31.5, 47.1] },
  { type: "civic", coordinates: [24.1, 49.8] }, { type: "civic", coordinates: [30.5, 50.4] },
  { type: "civic", coordinates: [35.0, 48.5] }, { type: "civic", coordinates: [36.2, 50.0] },
  { type: "communications", coordinates: [25.8, 50.3] }, { type: "communications", coordinates: [30.7, 49.0] },
  { type: "communications", coordinates: [34.3, 49.5] }, { type: "communications", coordinates: [32.0, 47.0] }
];

const ukraineTheaterData = {
  events: demoEvents, strategicRoutes, controlZones, frontLine, movementArrows, waterways, administrativeLines,
  terrainBands, maritimeCorridors, aviationCorridors, editorialTrafficContacts, knownCapabilitySectors, infrastructureZones
};

const resourceCatalog = {
  copper: {
    name: "Cobre", category: "mineral", metric: "Reservas nacionales y grandes distritos", unit: "intensidad relativa", year: "USGS 2026", color: "#d98245",
    description: "Ubica países con grandes reservas de cobre y sus principales cinturones mineros. No representa el contorno exacto de cada yacimiento.",
    sourceName: "USGS · Mineral Commodity Summaries 2026", sourceUrl: "https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries",
    entries: [["Chile","Andes centrales",-70.4,-24.0,100,"muy alta"],["Australia","Australia meridional y occidental",134,-25,58,"alta"],["Perú","Cinturón andino",-74,-10,52,"alta"],["R. D. del Congo","Copperbelt",26,-11,46,"alta"],["Rusia","Siberia y Urales",90,59,39,"media"],["México","Sierra Madre",-102,24,31,"media"],["Estados Unidos","Arizona y oeste",-112,34,28,"media"],["China","Distritos interiores",105,34,25,"media"]]
  },
  lithium: {
    name: "Litio", category: "mineral", metric: "Reservas y recursos identificados", unit: "intensidad relativa", year: "USGS 2026", color: "#b493ff",
    description: "Combina salares, pegmatitas y reservas nacionales conocidas; reservas y recursos geológicos no son conceptos intercambiables.",
    sourceName: "USGS · Mineral Commodity Summaries 2026", sourceUrl: "https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries",
    entries: [["Australia","Pegmatitas de Australia occidental",120,-25,100,"muy alta"],["Chile","Salar de Atacama",-69.3,-23.5,88,"muy alta"],["Argentina","Puna y salares",-67,-24,73,"alta"],["China","Qinghai, Sichuan y Tíbet",94,32,62,"alta"],["Bolivia","Salar de Uyuni",-67.5,-20.1,55,"alta"],["Zimbabue","Cinturones de pegmatita",30,-19,32,"media"],["Estados Unidos","Nevada",-117,39,24,"media"]]
  },
  iron: {
    name: "Hierro", category: "mineral", metric: "Reservas de mineral de hierro", unit: "intensidad relativa", year: "USGS 2026", color: "#b66a55",
    description: "Muestra grandes concentraciones nacionales de mineral de hierro y distritos extractivos representativos.",
    sourceName: "USGS · Mineral Commodity Summaries 2026", sourceUrl: "https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries",
    entries: [["Australia","Pilbara",119,-22,100,"muy alta"],["Brasil","Carajás y Minas Gerais",-52,-8,78,"muy alta"],["Rusia","Kursk y Urales",58,53,48,"alta"],["China","Norte y noreste",116,41,40,"media"],["India","Odisha y Chhattisgarh",82,21,36,"media"],["Ucrania","Kryvyi Rih",33.3,47.9,27,"media"],["Canadá","Labrador Trough",-67,54,24,"media"]]
  },
  oil: {
    name: "Petróleo", category: "energy", metric: "Reservas probadas nacionales", unit: "intensidad relativa", year: "EIA · último dato disponible", color: "#e5bf63",
    description: "Concentración relativa de reservas probadas. No equivale a producción diaria, capacidad exportadora ni petróleo inmediatamente recuperable.",
    sourceName: "EIA · International Energy Data", sourceUrl: "https://www.eia.gov/international/data/world",
    entries: [["Venezuela","Faja del Orinoco",-65,8,100,"muy alta"],["Arabia Saudita","Península arábiga",45,24,91,"muy alta"],["Irán","Zagros y golfo Pérsico",53,31,82,"muy alta"],["Canadá","Alberta",-114,56,76,"alta"],["Irak","Mesopotamia",44,33,66,"alta"],["Emiratos Árabes Unidos","Abu Dabi",54,24,56,"alta"],["Rusia","Siberia occidental",75,61,51,"alta"],["Kuwait","Burgan",47.6,29.3,47,"alta"],["Libia","Sirte",18,28,35,"media"],["Estados Unidos","Texas, Golfo y Alaska",-101,38,31,"media"]]
  },
  gas: {
    name: "Gas natural", category: "energy", metric: "Reservas probadas nacionales", unit: "intensidad relativa", year: "EIA · último dato disponible", color: "#69cbd0",
    description: "Reservas probadas de gas natural por país. Los marcadores no representan gasoductos ni flujos comerciales.",
    sourceName: "EIA · International Energy Data", sourceUrl: "https://www.eia.gov/international/data/world",
    entries: [["Rusia","Siberia occidental y Yamal",75,65,100,"muy alta"],["Irán","South Pars y Zagros",52,28,86,"muy alta"],["Qatar","North Field",51.2,25.4,71,"alta"],["Turkmenistán","Galkynysh",59,39,51,"alta"],["Estados Unidos","Grandes cuencas productoras",-100,38,43,"alta"],["China","Sichuan y noroeste",104,34,31,"media"],["Venezuela","Oriente y costa afuera",-65,9,26,"media"],["Arabia Saudita","Península arábiga",45,24,25,"media"]]
  },
  wheat: {
    name: "Trigo", category: "agriculture", metric: "Producción nacional", unit: "intensidad relativa", year: "FAOSTAT · último año comparable", color: "#e8c96c",
    description: "Principales productores de trigo. La intensidad es relativa dentro de esta capa y no representa superficie cultivada exacta.",
    sourceName: "FAOSTAT · Crops and livestock products", sourceUrl: "https://www.fao.org/faostat/en/#data/QCL",
    entries: [["China","Llanura del norte",114,35,100,"muy alta"],["India","Indo-Ganges",78,27,86,"muy alta"],["Rusia","Cinturón cerealero",45,52,71,"alta"],["Estados Unidos","Grandes Llanuras",-100,40,39,"alta"],["Francia","Cuenca de París",2,47,29,"media"],["Canadá","Praderas",-106,52,27,"media"],["Pakistán","Punjab",72,31,25,"media"],["Australia","Cinturones del sur",140,-32,24,"media"],["Ucrania","Estepa y centro",31,49,21,"media"]]
  },
  maize: {
    name: "Maíz", category: "agriculture", metric: "Producción nacional", unit: "intensidad relativa", year: "FAOSTAT · último año comparable", color: "#f0a94b",
    description: "Principales productores de maíz según producción nacional agregada; no muestra rendimiento ni exportaciones.",
    sourceName: "FAOSTAT · Crops and livestock products", sourceUrl: "https://www.fao.org/faostat/en/#data/QCL",
    entries: [["Estados Unidos","Corn Belt",-93,41,100,"muy alta"],["China","Noreste y llanuras",116,40,91,"muy alta"],["Brasil","Centro-oeste y sur",-52,-16,58,"alta"],["Argentina","Pampa",-62,-34,37,"alta"],["India","Centro y sur",78,22,22,"media"],["Ucrania","Centro y estepa",31,49,19,"media"],["México","Altiplano y occidente",-102,22,17,"media"]]
  },
  rice: {
    name: "Arroz", category: "agriculture", metric: "Producción nacional", unit: "intensidad relativa", year: "FAOSTAT · último año comparable", color: "#90c97a",
    description: "Principales productores de arroz; la capa resume producción nacional y no delimita arrozales.",
    sourceName: "FAOSTAT · Crops and livestock products", sourceUrl: "https://www.fao.org/faostat/en/#data/QCL",
    entries: [["China","Cuencas del Yangtsé y sur",113,29,100,"muy alta"],["India","Llanuras y deltas",79,23,95,"muy alta"],["Bangladés","Delta del Ganges",90,24,37,"alta"],["Indonesia","Java y Sumatra",113,-3,34,"alta"],["Vietnam","Deltas del Mekong y Rojo",106,16,27,"media"],["Tailandia","Llanura central",101,15,22,"media"],["Myanmar","Cuenca del Irawadi",96,20,17,"media"],["Filipinas","Luzón y Mindanao",122,12,15,"media"]]
  }
};

function buildResourceEvents(resourceKey) {
  const resource = resourceCatalog[resourceKey] || resourceCatalog.copper;
  const selectedRegion = resourceRegions[state.resourceRegion] || resourceRegions.world;
  const entries = selectedRegion.countries ? resource.entries.filter(([country]) => selectedRegion.countries.includes(country)) : resource.entries;
  return entries.map(([country, region, lon, lat, score, tier], index) => ({
    id: `RES-${resourceKey.toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
    kind: "ground", kindLabel: resource.category === "agriculture" ? "PRODUCCIÓN AGRÍCOLA" : resource.category === "energy" ? "RESERVA ENERGÉTICA" : "RECURSO MINERAL",
    time: resource.year, place: country, lon, lat, title: `${resource.name} · ${country}`, short: `${country} · ${tier}`,
    summary: `${region}. Intensidad ${tier} dentro de la capa mundial de ${resource.name.toLowerCase()}.`,
    confidence: "medium", confidenceLabel: "MEDIA",
    facts: [["Recurso", resource.name], ["Medida", resource.metric], ["Zona representativa", region], ["Escala relativa", `${score}/100`]],
    assessment: "La posición es representativa a escala nacional o regional. No delimita un yacimiento, cultivo o reserva exacta y no sustituye cartografía geológica o agrícola especializada.",
    sources: [[resource.sourceName, resource.year, "INSTITUCIONAL"]], score, tier, color: resource.color
  }));
}

const theaterConfigs = {
  "russia-ukraine": {
    ...ukraineTheaterData,
    title: { es: "Guerra ruso-ucraniana", uk: "Російсько-українська війна", ru: "Российско-украинская война" },
    theater: { es: "TEATRO · EUROPA ORIENTAL", uk: "ТЕАТР · СХІДНА ЄВРОПА", ru: "ТЕАТР · ВОСТОЧНАЯ ЕВРОПА" },
    lede: { es: "Una vista estratégica de la situación, construida sobre afirmaciones trazables y niveles explícitos de confianza.", uk: "Стратегічний огляд на основі простежуваних тверджень і чітко позначених рівнів довіри.", ru: "Стратегический обзор на основе прослеживаемых утверждений и явно обозначенных уровней доверия." },
    center: [35, 51], scale: 2.25, focusCountryIds: [804, 643], adminGeoJSON: true,
    adminLevels: ["TEATRO", "ÓBLASTS", "RAIONES"],
    perspectiveLabels: { es: ["Neutra", "Visión rusa", "Visión ucraniana"], uk: ["Нейтральна", "Російський погляд", "Український погляд"], ru: ["Нейтральная", "Российский взгляд", "Украинский взгляд"] },
    perspectiveNames: ["RU", "UA"], perspectivePatterns: [/rusi|mosc|kremlin|russian/i, /ucrani|kyiv|ukrain/i],
    status: [["INICIATIVA", "Disputada", "↑ local UA"], ["PRESIÓN AÉREA", "Alta", "intensa"], ["DIPLOMACIA", "Estancada", "sin tregua"], ["COBERTURA", "68%", "12 fuentes"]],
    analystNote: "La iniciativa ucraniana es localizada. No equivale a un cambio confirmado del equilibrio general.",
    legend: ["Control UA", "Control RU"], phase: ["Desgaste, adaptación y sistemas no tripulados", "El turno se interpreta mediante cuatro fuerzas acumulativas. Cada nivel expresa una lectura editorial del prototipo, no una puntuación factual."],
    controlLabels: [{ text: "CONTROL UCRANIANO", className: "ua", point: [29.0, 50.4] }, { text: "CONTROL RUSO · APROX.", className: "ru", point: [39.0, 48.0] }],
    fogPoints: [[27,54,60],[43,48,80],[45,56,68],[25,47,50]], liveTraffic: true
  },
  "middle-east": {
    events: middleEastEvents,
    title: { es: "Oriente Medio ampliado", uk: "Розширений Близький Схід", ru: "Расширенный Ближний Восток" },
    theater: { es: "TEATRO · ORIENTE MEDIO Y MAR ROJO", uk: "ТЕАТР · БЛИЗЬКИЙ СХІД І ЧЕРВОНЕ МОРЕ", ru: "ТЕАТР · БЛИЖНИЙ ВОСТОК И КРАСНОЕ МОРЕ" },
    lede: { es: "Un teatro regional que separa frentes, actores asociados, navegación, diplomacia e impacto humanitario.", uk: "Регіональний театр із розділеним аналізом фронтів, акторів, навігації, дипломатії та гуманітарного впливу.", ru: "Региональный театр с раздельным анализом фронтов, акторов, навигации, дипломатии и гуманитарных последствий." },
    center: [41, 28], scale: 1.25, focusCountryIds: [376, 364, 422, 760, 368, 887], adminGeoJSON: false,
    adminLevels: ["TEATRO", "PAÍSES", "SUBREGIONES"],
    perspectiveLabels: { es: ["Neutra", "Visión israelí-occidental", "Visión iraní y actores asociados"], uk: ["Нейтральна", "Ізраїльсько-західний погляд", "Іранський та союзний погляд"], ru: ["Нейтральная", "Израильско-западный взгляд", "Иранский и союзный взгляд"] },
    perspectiveNames: ["ISR/OCC", "IRN/EJE"], perspectivePatterns: [/israel|idf|ee\. ?uu|estadounid|ukmto/i, /ir[aá]n|teher|hezbol|hut[ií]|houthi/i],
    status: [["DINÁMICA", "Regionalizada", "varios frentes"], ["DOMINIO AÉREO", "Intenso", "misiles y drones"], ["DIPLOMACIA", "Fragmentada", "mediación activa"], ["COBERTURA", "Base", "4 fichas marco"]],
    analystNote: "Oriente Medio no es un único frente. Atlas separa actores, escalas y cadenas de evidencia para evitar atribuciones por asociación.",
    legend: ["Actor A / coalición", "Actor B / red asociada"], phase: ["Escalada regional, disuasión y presión sobre corredores", "El modelo observa frentes conectados sin tratarlos como una guerra única ni presumir coordinación entre actores."],
    controlLabels: [], fogPoints: [[34,32,55],[43,34,65],[44,16,55]], liveTraffic: false,
    strategicRoutes: [
      { type: "routes", label: "Mediterráneo–Golfo", coordinates: [[34.8,31.8],[36.3,33.5],[44.4,33.3],[51.4,25.3]] },
      { type: "routes", label: "Suez–mar Rojo", coordinates: [[32.5,30.0],[34.3,27.0],[39.0,20.0],[43.3,12.7]] },
      { type: "rail", label: "Corredores terrestres regionales", coordinates: [[35.2,32.1],[36.3,33.5],[44.4,33.3],[46.7,24.7]] }
    ],
    controlZones: [], frontLine: [], movementArrows: [],
    waterways: [{ label: "Éufrates", coordinates: [[38.0,37.0],[40.5,35.0],[44.0,33.0],[47.5,31.0]] }, { label: "Tigris", coordinates: [[42.0,37.0],[43.5,34.0],[46.5,31.0]] }, { label: "Nilo", coordinates: [[31.2,30.0],[31.0,27.0],[32.5,24.0]] }],
    administrativeLines: [[[34.3,31.2],[35.8,33.3],[36.8,35.8]],[[39.0,32.0],[47.0,32.0]],[[44.0,28.0],[52.0,28.0]],[[38.0,20.0],[45.0,20.0]]],
    terrainBands: [{ level: "high", label: "Montes Zagros", coordinates: [[[43,29],[49,29],[50,37],[45,39],[43,29]]] }, { level: "mid", label: "Alturas del Levante", coordinates: [[[34.5,30],[37,30],[38,36],[35,37],[34.5,30]]] }],
    maritimeCorridors: [{ label: "Mediterráneo oriental", coordinates: [[29,34],[33,33],[35,32]] }, { label: "Suez–Bab el-Mandeb", coordinates: [[32.5,30],[36,24],[40,18],[43.3,12.7]] }, { label: "Hormuz", coordinates: [[43.3,12.7],[52,15],[56.5,26.3]] }],
    aviationCorridors: [{ label: "Corredor mediterráneo", coordinates: [[28,35],[34,35],[40,36]] }, { label: "Corredor del Golfo", coordinates: [[39,30],[46,28],[52,26]] }],
    editorialTrafficContacts: { aviation: [{ lon: 31, lat: 35, count: 8 }, { lon: 45, lat: 29, count: 11 }, { lon: 52, lat: 26, count: 9 }], maritime: [{ lon: 33, lat: 29, count: 7 }, { lon: 41, lat: 17, count: 10 }, { lon: 56, lat: 25, count: 12 }] },
    knownCapabilitySectors: [],
    infrastructureZones: [{ type: "energy", coordinates: [50.5,26.2] }, { type: "energy", coordinates: [44.5,31.0] }, { type: "civic", coordinates: [35.2,31.8] }, { type: "civic", coordinates: [36.3,33.5] }, { type: "communications", coordinates: [44.4,33.3] }]
  },
  sudan: {
    events: sudanEvents,
    title: { es: "Guerra de Sudán", uk: "Війна в Судані", ru: "Война в Судане" },
    theater: { es: "TEATRO · SUDÁN Y MAR ROJO", uk: "ТЕАТР · СУДАН І ЧЕРВОНЕ МОРЕ", ru: "ТЕАТР · СУДАН И КРАСНОЕ МОРЕ" },
    lede: { es: "Seguimiento de una guerra fragmentada mediante control efectivo, corredores, desplazamiento y acceso humanitario.", uk: "Моніторинг фрагментованої війни через фактичний контроль, коридори, переміщення та гуманітарний доступ.", ru: "Мониторинг фрагментированной войны через фактический контроль, коридоры, перемещение и гуманитарный доступ." },
    center: [30, 15], scale: 1.75, focusCountryIds: [729], adminGeoJSON: false,
    adminLevels: ["TEATRO", "ESTADOS", "CORREDORES"],
    perspectiveLabels: { es: ["Neutra", "Visión SAF", "Visión RSF"], uk: ["Нейтральна", "Погляд SAF", "Погляд RSF"], ru: ["Нейтральная", "Взгляд SAF", "Взгляд RSF"] },
    perspectiveNames: ["SAF", "RSF"], perspectivePatterns: [/\bSAF\b|fuerzas armadas|ej[eé]rcito sudan/i, /\bRSF\b|apoyo r[aá]pido/i],
    status: [["CONTROL", "Fragmentado", "nodos y corredores"], ["ACCESO", "Restringido", "cobertura desigual"], ["DIPLOMACIA", "Intermitente", "múltiples mediadores"], ["COBERTURA", "Base", "4 fichas marco"]],
    analystNote: "En Sudán, las zonas coloreadas pueden exagerar el control. La prioridad analítica son ciudades, rutas, puentes y acceso humanitario.",
    legend: ["SAF", "RSF"], phase: ["Fragmentación territorial y crisis humanitaria", "El modelo prioriza nodos, corredores y brechas de evidencia por sobre fronteras de control excesivamente precisas."],
    controlLabels: [], fogPoints: [[25,13,70],[32,15,60],[35,10,55]], liveTraffic: false,
    strategicRoutes: [{ type: "routes", label: "Puerto Sudán–Jartum", coordinates: [[37.2,19.6],[34.0,18.0],[32.55,15.5]] }, { type: "routes", label: "Jartum–Darfur", coordinates: [[32.55,15.5],[29.0,14.0],[24.9,13.2]] }, { type: "rail", label: "Eje del Nilo", coordinates: [[31.8,21.8],[32.55,15.5],[33.6,12.0]] }],
    controlZones: [], frontLine: [], movementArrows: [],
    waterways: [{ label: "Nilo", coordinates: [[31.0,22.0],[32.0,18.0],[32.55,15.5],[33.6,12.0]] }, { label: "Nilo Azul", coordinates: [[35.2,11.5],[33.5,13.0],[32.55,15.5]] }],
    administrativeLines: [[[22,16],[38,16]],[[24,12],[36,12]],[[29,9],[29,21]],[[34,9],[34,21]]],
    terrainBands: [{ level: "high", label: "Macizo de Marra", coordinates: [[[23,11],[25.5,11],[25.8,14.5],[23.5,15],[23,11]]] }, { level: "mid", label: "Litoral del mar Rojo", coordinates: [[[35,9],[38,9],[38,22],[35.5,22],[35,9]]] }],
    maritimeCorridors: [{ label: "Corredor del mar Rojo", coordinates: [[37.2,19.6],[39.5,16.0],[43.3,12.7],[44.0,20.0]] }],
    aviationCorridors: [{ label: "Corredor regional", coordinates: [[30,22],[32.5,15.5],[38,15],[42,20]] }],
    editorialTrafficContacts: { aviation: [{ lon: 32.5, lat: 15.5, count: 3 }, { lon: 37.2, lat: 19.6, count: 5 }], maritime: [{ lon: 37.5, lat: 19.0, count: 6 }, { lon: 41, lat: 15, count: 8 }] },
    knownCapabilitySectors: [],
    infrastructureZones: [{ type: "energy", coordinates: [32.55,15.5] }, { type: "civic", coordinates: [24.9,13.2] }, { type: "civic", coordinates: [37.2,19.6] }, { type: "communications", coordinates: [32.55,15.5] }]
  },
  "world-resources": {
    events: [], resources: true,
    title: { es: "Materias primas mundiales", uk: "Світові сировинні ресурси", ru: "Мировые сырьевые ресурсы" },
    theater: { es: "VISTA MUNDIAL · RECURSOS ESTRATÉGICOS", uk: "СВІТОВИЙ ОГЛЯД · СТРАТЕГІЧНІ РЕСУРСИ", ru: "МИРОВОЙ ОБЗОР · СТРАТЕГИЧЕСКИЕ РЕСУРСЫ" },
    lede: { es: "Compara la concentración geográfica de minerales, energía y producción agrícola sin confundir reservas, extracción y cultivos.", uk: "Порівнює географічну концентрацію мінералів, енергії та сільськогосподарського виробництва.", ru: "Сравнивает географическую концентрацию минералов, энергии и сельскохозяйственного производства." },
    center: [0, 20], scale: 1, focusCountryIds: [], adminGeoJSON: false, forceWorld: true,
    adminLevels: ["MUNDO", "PAÍSES", "REGIONES"],
    perspectiveLabels: { es: ["Datos comparables", "Reservas y oferta", "Producción y demanda"], uk: ["Порівняльні дані", "Запаси й пропозиція", "Виробництво й попит"], ru: ["Сопоставимые данные", "Запасы и предложение", "Производство и спрос"] },
    perspectiveNames: ["OFERTA", "DEMANDA"], perspectivePatterns: [/.^/, /.^/],
    status: [["COBERTURA", "Mundial", "8 recursos"], ["MINERALES", "3 capas", "reservas"], ["ENERGÍA", "2 capas", "reservas probadas"], ["AGRICULTURA", "3 capas", "producción"]],
    analystNote: "Una gran reserva no implica producción inmediata; una gran producción no implica autosuficiencia ni capacidad exportadora.",
    legend: ["Concentración mayor", "Concentración secundaria"], phase: ["Geografía de recursos y dependencias", "Cada capa usa una medida explícita. Las escalas relativas permiten comparar lugares dentro del mismo recurso, no recursos diferentes entre sí."],
    controlLabels: [], fogPoints: [], liveTraffic: false,
    strategicRoutes: [], controlZones: [], frontLine: [], movementArrows: [], waterways: [], administrativeLines: [], terrainBands: [], maritimeCorridors: [], aviationCorridors: [],
    editorialTrafficContacts: { aviation: [], maritime: [] }, knownCapabilitySectors: [], infrastructureZones: []
  }
};

const advisorContent = {
  security: {
    kicker: "ASESORÍA · SEGURIDAD",
    title: "Priorizar continuidad y protección civil",
    copy: "La presión aérea y la exposición de nodos logísticos elevan la necesidad de redundancia, alerta temprana y protección de servicios esenciales.",
    signal: "Ritmo de ataques y recuperación de redes"
  },
  humanitarian: {
    kicker: "ASESORÍA · POBLACIÓN Y AYUDA",
    title: "Mantener acceso y capacidad de respuesta",
    copy: "Los eventos con impacto civil deben leerse junto a desplazamiento, acceso sanitario y continuidad del transporte. El tablero evita inferir cifras no corroboradas.",
    signal: "Acceso humanitario y presión sobre servicios"
  },
  infrastructure: {
    kicker: "ASESORÍA · INFRAESTRUCTURA",
    title: "Seguir fallos en cascada y redundancia",
    copy: "Energía, ferrocarril y telecomunicaciones forman una red interdependiente. Una interrupción local puede amplificar efectos logísticos y civiles.",
    signal: "Tiempo de reparación y alcance de interrupciones"
  },
  diplomacy: {
    kicker: "ASESORÍA · DIPLOMACIA",
    title: "Distinguir señales de compromisos verificables",
    copy: "Las declaraciones públicas indican intención, pero solo acuerdos recíprocos, mecanismos de control y cambios observables reducen el riesgo de escalada.",
    signal: "Reciprocidad, verificación y cumplimiento"
  }
};

const interfaceCopy = {
  es: {
    conflict: "CONFLICTO", conflictHelp: "Selecciona el conflicto que quieres explorar.", conflictName: "Guerra ruso-ucraniana", future: "Más conflictos · próximamente",
    perspective: "PERSPECTIVA EDITORIAL", perspectiveHelp: "Compara énfasis y afirmaciones sin convertir una narrativa en hecho.",
    language: "IDIOMA", languageHelp: "La interfaz y el contenido disponible cambian de idioma.",
    neutralButton: "Neutra", russianButton: "Visión rusa", ukrainianButton: "Visión ucraniana",
    theater: "TEATRO · EUROPA ORIENTAL", title: "Guerra ruso-ucraniana", lede: "Una vista estratégica de la situación, construida sobre afirmaciones trazables y niveles explícitos de confianza.",
    sourceGapRussian: "Este registro no contiene una fuente rusa identificada; se mantiene visible la brecha de evidencia.",
    sourceGapUkrainian: "Este registro no contiene una fuente ucraniana identificada; se mantiene visible la brecha de evidencia."
  },
  uk: {
    conflict: "КОНФЛІКТ", conflictHelp: "Оберіть конфлікт для аналізу.", conflictName: "Російсько-українська війна", future: "Інші конфлікти · незабаром",
    perspective: "РЕДАКЦІЙНА ПЕРСПЕКТИВА", perspectiveHelp: "Порівнюйте акценти й твердження, не перетворюючи наратив на факт.",
    language: "МОВА", languageHelp: "Інтерфейс і доступний перекладений вміст змінюють мову.",
    neutralButton: "Нейтральна", russianButton: "Російський погляд", ukrainianButton: "Український погляд",
    theater: "ТЕАТР · СХІДНА ЄВРОПА", title: "Російсько-українська війна", lede: "Стратегічний огляд на основі простежуваних тверджень і чітко позначених рівнів довіри.",
    sourceGapRussian: "У цьому записі немає ідентифікованого російського джерела; прогалина в доказах залишається видимою.",
    sourceGapUkrainian: "У цьому записі немає ідентифікованого українського джерела; прогалина в доказах залишається видимою."
  },
  ru: {
    conflict: "КОНФЛИКТ", conflictHelp: "Выберите конфликт для анализа.", conflictName: "Российско-украинская война", future: "Другие конфликты · скоро",
    perspective: "РЕДАКЦИОННАЯ ПЕРСПЕКТИВА", perspectiveHelp: "Сравнивайте акценты и утверждения, не превращая нарратив в факт.",
    language: "ЯЗЫК", languageHelp: "Интерфейс и доступный переведённый контент меняют язык.",
    neutralButton: "Нейтральная", russianButton: "Российский взгляд", ukrainianButton: "Украинский взгляд",
    theater: "ТЕАТР · ВОСТОЧНАЯ ЕВРОПА", title: "Российско-украинская война", lede: "Стратегический обзор на основе прослеживаемых утверждений и явно обозначенных уровней доверия.",
    sourceGapRussian: "В этой записи нет идентифицированного российского источника; пробел в доказательствах остаётся видимым.",
    sourceGapUkrainian: "В этой записи нет идентифицированного украинского источника; пробел в доказательствах остаётся видимым."
  }
};

const perspectiveCopy = {
  es: {
    neutral: ["VISTA NEUTRA", "Síntesis comparada y trazable", "Prioriza coincidencias entre fuentes independientes y separa hechos, declaraciones e inferencias."],
    russian: ["VISIÓN RUSA", "Narrativa rusa, siempre atribuida", "Prioriza fuentes y argumentos rusos, muestra contradicciones y conserva la evaluación independiente."],
    ukrainian: ["VISIÓN UCRANIANA", "Narrativa ucraniana, siempre atribuida", "Prioriza fuentes y argumentos ucranianos, muestra contradicciones y conserva la evaluación independiente."],
    disclaimer: "Cambiar de perspectiva no modifica los hechos verificados, la confianza ni la cadena de evidencia."
  },
  uk: {
    neutral: ["НЕЙТРАЛЬНИЙ ОГЛЯД", "Порівняльний і простежуваний синтез", "Надає пріоритет збігам між незалежними джерелами та відокремлює факти, заяви й висновки."],
    russian: ["РОСІЙСЬКИЙ ПОГЛЯД", "Російський наратив із чіткою атрибуцією", "Пріоритизує російські джерела й аргументи, показує суперечності та зберігає незалежну оцінку."],
    ukrainian: ["УКРАЇНСЬКИЙ ПОГЛЯД", "Український наратив із чіткою атрибуцією", "Пріоритизує українські джерела й аргументи, показує суперечності та зберігає незалежну оцінку."],
    disclaimer: "Зміна перспективи не змінює перевірені факти, рівень довіри чи ланцюг доказів."
  },
  ru: {
    neutral: ["НЕЙТРАЛЬНЫЙ ОБЗОР", "Сопоставимый и прослеживаемый синтез", "Отдаёт приоритет совпадениям между независимыми источниками и разделяет факты, заявления и выводы."],
    russian: ["РОССИЙСКИЙ ВЗГЛЯД", "Российский нарратив с явной атрибуцией", "Выдвигает российские источники и аргументы, показывает противоречия и сохраняет независимую оценку."],
    ukrainian: ["УКРАИНСКИЙ ВЗГЛЯД", "Украинский нарратив с явной атрибуцией", "Выдвигает украинские источники и аргументы, показывает противоречия и сохраняет независимую оценку."],
    disclaimer: "Смена перспективы не изменяет проверенные факты, уровень доверия или цепочку доказательств."
  }
};

function currentTheater() {
  return theaterConfigs[state.conflict] || theaterConfigs["russia-ukraine"];
}

function localized(value) {
  if (typeof value === "string") return value;
  return value?.[state.language] || value?.es || "";
}

function applyTheaterData() {
  const config = currentTheater();
  const resourceMode = Boolean(config.resources);
  if (resourceMode) {
    const resource = resourceCatalog[state.resource] || resourceCatalog.copper;
    events = buildResourceEvents(state.resource);
    resourceMarkers = events;
    state.perspective = "neutral";
  } else {
    events = config.events;
    resourceMarkers = [];
  }
  strategicRoutes = config.strategicRoutes;
  controlZones = config.controlZones;
  frontLine = config.frontLine;
  movementArrows = config.movementArrows;
  waterways = config.waterways;
  administrativeLines = config.administrativeLines;
  terrainBands = config.terrainBands;
  maritimeCorridors = config.maritimeCorridors;
  aviationCorridors = config.aviationCorridors;
  editorialTrafficContacts = config.editorialTrafficContacts;
  knownCapabilitySectors = config.knownCapabilitySectors;
  infrastructureZones = config.infrastructureZones;
  state.selected = events[0]?.id || null;
  state.kind = "all";
  state.view = config.forceWorld ? "world" : "theater";
  byId("conflictSelect").value = state.conflict;
  document.querySelectorAll(".segmented button").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  document.querySelector('[data-view="theater"]').disabled = resourceMode;
  config.status.forEach(([label, value, trend], index) => {
    byId(`statusLabel${index + 1}`).textContent = label;
    byId(`statusValue${index + 1}`).textContent = value;
    byId(`statusTrend${index + 1}`).textContent = trend;
  });
  byId("analystNote").textContent = config.analystNote;
  byId("legendActorA").textContent = config.legend[0];
  byId("legendActorB").textContent = config.legend[1];
  byId("strategyPhaseTitle").textContent = config.phase[0];
  byId("strategyPhaseCopy").textContent = config.phase[1];
  byId("map").setAttribute("aria-label", `Mapa estratégico de ${localized(config.title)} con eventos seleccionables`);
  document.querySelector('[data-map-layer="admin"]').closest("label").querySelector("small").textContent = `${config.adminLevels[1].toLowerCase()} y ${config.adminLevels[2].toLowerCase()} · según zoom`;
  byId("resourceControls").hidden = !resourceMode;
  byId("eventFilterGroup").hidden = resourceMode;
  byId("conflictLayerControls").hidden = resourceMode;
  byId("mapSafetyNote").hidden = resourceMode;
  byId("conflictMapLegend").hidden = resourceMode;
  byId("resourceMapLegend").hidden = !resourceMode;
  document.querySelector(".perspective-field").hidden = resourceMode;
  byId("perspectiveNote").hidden = resourceMode;
  document.querySelector(".traffic-data-note").hidden = resourceMode;
  document.querySelector(".map-disclaimer").hidden = resourceMode;
  document.querySelector(".strategy-console").hidden = resourceMode;
  document.querySelector(".force-compare").hidden = state.conflict !== "russia-ukraine";
  if (resourceMode) {
    const resource = resourceCatalog[state.resource] || resourceCatalog.copper;
    const region = resourceRegions[state.resourceRegion] || resourceRegions.world;
    byId("resourceRegionSelect").value = state.resourceRegion;
    byId("resourceSelect").value = state.resource;
    byId("resourceMetric").textContent = `${resource.metric} · ${resource.year}`;
    byId("resourceDescription").textContent = `${region.label}: ${resource.description}`;
    byId("resourceSource").textContent = `${resource.sourceName} ↗`;
    byId("resourceSource").href = resource.sourceUrl;
    byId("statusLabel1").textContent = "REGIÓN";
    byId("statusValue1").textContent = region.label;
    byId("statusTrend1").textContent = state.resourceRegion === "world" ? "vista global" : "vista regional";
    byId("statusLabel4").textContent = "UBICACIONES";
    byId("statusValue4").textContent = String(events.length);
    byId("statusTrend4").textContent = resource.name.toLowerCase();
  }
  byId("dataNotice").textContent = resourceMode
    ? `${resourceRegions[state.resourceRegion].label} · ${events.length} ubicaciones visibles · Posiciones nacionales o regionales aproximadas.`
    : state.conflict === "russia-ukraine"
    ? "Prototipo editorial · Datos de demostración · No sustituye fuentes oficiales ni asesoramiento de seguridad."
    : "Cobertura base · Fichas editoriales de referencia · Pendiente de eventos publicados y verificados.";
}

function hasActorSource(event, actor) {
  const terms = actor === "russian" ? currentTheater().perspectivePatterns[0] : currentTheater().perspectivePatterns[1];
  return event.sources.some(([name]) => terms.test(name));
}

function applyAnalysisContext() {
  const copy = interfaceCopy[state.language] || interfaceCopy.es;
  const lens = perspectiveCopy[state.language] || perspectiveCopy.es;
  let currentLens = lens[state.perspective] || lens.neutral;
  if (state.conflict !== "russia-ukraine" && state.perspective !== "neutral") {
    const labels = currentTheater().perspectiveLabels[state.language] || currentTheater().perspectiveLabels.es;
    const index = state.perspective === "russian" ? 1 : 2;
    currentLens = [labels[index].toUpperCase(), `${labels[index]}, siempre atribuida`, "Prioriza las fuentes de esta perspectiva, conserva contradicciones y no altera la evaluación independiente."];
  }
  document.documentElement.lang = state.language;
  byId("languageSelect").value = state.language;
  byId("conflictLabel").textContent = currentTheater().resources ? "VISTA" : copy.conflict;
  byId("conflictHelp").textContent = currentTheater().resources ? "Explora la distribución mundial de recursos estratégicos." : copy.conflictHelp;
  [...byId("conflictSelect").options].forEach((option) => {
    const optionConfig = theaterConfigs[option.value];
    if (optionConfig) option.textContent = localized(optionConfig.title);
  });
  byId("perspectiveLabel").textContent = copy.perspective;
  byId("perspectiveHelp").textContent = copy.perspectiveHelp;
  if (byId("languageLabel")) byId("languageLabel").textContent = copy.language;
  if (byId("languageHelp")) byId("languageHelp").textContent = copy.languageHelp;
  const perspectiveButtons = [...document.querySelectorAll("[data-perspective]")];
  const perspectiveLabels = currentTheater().perspectiveLabels[state.language] || currentTheater().perspectiveLabels.es;
  perspectiveButtons[0].textContent = perspectiveLabels[0];
  perspectiveButtons[1].textContent = perspectiveLabels[1];
  perspectiveButtons[2].textContent = perspectiveLabels[2];
  perspectiveButtons.forEach((button) => {
    const active = button.dataset.perspective === state.perspective;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  byId("perspectiveNote").dataset.perspectiveTone = state.perspective;
  byId("perspectiveKicker").textContent = currentLens[0];
  byId("perspectiveTitle").textContent = currentLens[1];
  byId("perspectiveDescription").textContent = currentLens[2];
  byId("perspectiveDisclaimer").textContent = lens.disclaimer;
  byId("theaterLabel").textContent = localized(currentTheater().theater);
  byId("briefing-title").textContent = localized(currentTheater().title);
  byId("briefingLede").textContent = localized(currentTheater().lede);
  document.title = `${localized(currentTheater().title)} · ATLAS OSINT`;
}

function renderIntel(event) {
  if (!event) {
    state.selected = null;
    byId("eventCode").textContent = "SIN DATOS";
    byId("eventKind").textContent = "COBERTURA REGIONAL";
    byId("eventTitle").textContent = "Sin ubicaciones en esta capa";
    byId("eventSummary").textContent = "La combinación de región y recurso seleccionada no contiene nodos en la cobertura actual.";
    byId("eventAssessment").textContent = "Prueba otra materia prima o vuelve a la vista mundial para consultar todas las ubicaciones disponibles.";
    byId("eventConfidence").textContent = "N/D";
    byId("eventConfidence").className = "confidence-badge medium";
    byId("eventFacts").innerHTML = "";
    byId("sourceCount").textContent = "0 fuentes";
    byId("sourceList").innerHTML = "";
    return;
  }
  state.selected = event.id;
  syncEventSelection();
  byId("eventCode").textContent = event.id;
  byId("eventKind").textContent = event.kindLabel;
  byId("eventTitle").textContent = event.title;
  byId("eventSummary").textContent = event.summary;
  byId("eventAssessment").textContent = event.assessment;
  const badge = byId("eventConfidence");
  badge.textContent = event.confidenceLabel;
  badge.className = `confidence-badge ${event.confidence}`;
  byId("eventFacts").innerHTML = event.facts.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("");
  const actorPattern = state.perspective === "russian" ? currentTheater().perspectivePatterns[0] : currentTheater().perspectivePatterns[1];
  const sortedSources = state.perspective === "neutral" ? [...event.sources] : [...event.sources].sort((a, b) => Number(actorPattern.test(b[0])) - Number(actorPattern.test(a[0])));
  const missingActorSource = state.perspective !== "neutral" && !hasActorSource(event, state.perspective);
  const languageCopy = interfaceCopy[state.language] || interfaceCopy.es;
  byId("sourceCount").textContent = `${event.sources.length} fuentes`;
  const perspectiveIndex = state.perspective === "russian" ? 0 : 1;
  const gapText = state.conflict === "russia-ukraine"
    ? (state.perspective === "russian" ? languageCopy.sourceGapRussian : languageCopy.sourceGapUkrainian)
    : `No hay una fuente identificada de ${currentTheater().perspectiveNames[perspectiveIndex]}; la brecha permanece visible.`;
  byId("sourceList").innerHTML = sortedSources.map(([name, type, label], index) => `<div class="source-item"><span class="source-num">${String(index + 1).padStart(2, "0")}</span><div><strong>${name}</strong><small>${type}</small></div><em>${label}</em></div>`).join("")
    + (missingActorSource ? `<div class="source-item source-gap"><span class="source-num">!</span><div><strong>${currentTheater().perspectiveNames[perspectiveIndex]}</strong><small>${gapText}</small></div><em>GAP</em></div>` : "");
  document.querySelectorAll(".event-marker, .resource-marker, .timeline-card").forEach((node) => node.classList.toggle("selected", node.dataset.id === event.id));
  if (window.innerWidth < 901) byId("intelPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderTimeline() {
  byId("timeline").innerHTML = events.map((event) => `<button class="timeline-card ${event.kind}${event.id === state.selected ? " selected" : ""}" data-id="${event.id}" data-kind="${event.kind}"><time>${event.time}</time><strong>${event.short}</strong><span>${event.place} · ${event.confidenceLabel.toLowerCase()}</span></button>`).join("");
  document.querySelectorAll(".timeline-card").forEach((button) => button.addEventListener("click", () => renderIntel(events.find((event) => event.id === button.dataset.id))));
}

function applyFilter(kind) {
  state.kind = kind;
  document.querySelectorAll(".filter-chip").forEach((button) => button.classList.toggle("active", button.dataset.kind === kind));
  document.querySelectorAll("[data-kind].event-marker, .timeline-card").forEach((node) => node.classList.toggle("filtered", kind !== "all" && node.dataset.kind !== kind));
  const visible = events.filter((event) => kind === "all" || event.kind === kind);
  byId("visibleCount").textContent = `${visible.length} ${visible.length === 1 ? "evento visible" : "eventos visibles"}`;
  syncEventFilter();
  if (!visible.some((event) => event.id === state.selected) && visible[0]) renderIntel(visible[0]);
}

function createMap() {
  const container = byId("map");
  if (!maplibregl?.Map) return fallbackMap("Cartografía no disponible");
  if (atlasMap) atlasMap.remove();
  container.innerHTML = "";
  fallbackSvg = null;
  fallbackZoom = null;
  // Modo estable: cartografía SVG local sin teselas externas ni WebGL.
  // Evita lienzos negros y cuadros de imagen rota en despliegues de rama.
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  createVectorFallback(container);
  return;
  if (!document.createElement("canvas").getContext("webgl2")) {
    createVectorFallback(container);
    return;
  }

  try {
    atlasMap = new maplibregl.Map({
      container,
      center: state.view === "theater" ? [31.5, 49.1] : [20, 30],
      zoom: state.view === "theater" ? 4.65 : 1.15,
      minZoom: 1,
      maxZoom: 12,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          topo: {
            type: "raster",
            tiles: [
              "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
              "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
              "https://c.tile.opentopomap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            maxzoom: 17,
            attribution: "© OpenStreetMap contributors · SRTM | OpenTopoMap"
          }
        },
        layers: [
          { id: "atlas-background", type: "background", paint: { "background-color": "#07100d" } },
          {
            id: "topographic-base",
            type: "raster",
            source: "topo",
            paint: {
              "raster-opacity": 0.82,
              "raster-saturation": -0.38,
              "raster-contrast": 0.18,
              "raster-brightness-min": 0.08,
              "raster-brightness-max": 0.72
            }
          }
        ]
      }
    });
  } catch (error) {
    console.warn("MapLibre no está disponible; usando cartografía vectorial de respaldo.", error.message);
    atlasMap = null;
    createVectorFallback(container);
    return;
  }
  atlasMap.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  atlasMap.on("load", () => {
    addAdministrativeTopographicLayers();
    addStrategicLayers();
    addFogLayer();
    addEventLayers();
    syncMapLayers();
    syncEventFilter();
  });
  atlasMap.on("error", (event) => {
    if (event?.error?.message) console.warn("ATLAS map warning:", event.error.message);
  });
}

function lonLatToLeaflet(coordinates) {
  return coordinates.map(([lon, lat]) => [lat, lon]);
}

function createLeafletAtlas(container) {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  if (atlasMap) {
    atlasMap.remove();
    atlasMap = null;
  }
  container.innerHTML = "";
  const config = currentTheater();
  const selectedRegion = resourceRegions[state.resourceRegion] || resourceRegions.world;
  const regional = Boolean(config.resources && state.resourceRegion !== "world");
  const center = regional ? selectedRegion.center : state.view === "theater" ? config.center : [20, 30];
  const zoom = regional ? 4 : state.view === "theater" ? 5 : 2;

  leafletMap = L.map(container, {
    center: [center[1], center[0]],
    zoom,
    minZoom: 2,
    maxZoom: 16,
    zoomControl: false,
    preferCanvas: true
  });

  const fallbackTiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    opacity: 0.82,
    attribution: "© OpenStreetMap contributors"
  }).addTo(leafletMap);

  const transparentTile = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  const topographicTiles = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    opacity: 0.88,
    errorTileUrl: transparentTile,
    attribution: "Esri World Topographic Map · Sources: Esri, USGS, NOAA"
  }).addTo(leafletMap);

  let topographicErrors = 0;
  topographicTiles.on("tileerror", () => {
    topographicErrors += 1;
    if (topographicErrors >= 4 && leafletMap.hasLayer(topographicTiles)) {
      leafletMap.removeLayer(topographicTiles);
      console.warn("Topographic tiles unavailable; OpenStreetMap fallback remains active.");
    }
  });

  leafletLayers = {
    control: L.layerGroup().addTo(leafletMap),
    movements: L.layerGroup().addTo(leafletMap),
    admin: L.layerGroup().addTo(leafletMap),
    events: L.layerGroup().addTo(leafletMap),
    resources: L.layerGroup().addTo(leafletMap)
  };

  controlZones.forEach((zone) => {
    L.polygon(lonLatToLeaflet(zone.coordinates[0]), {
      color: zone.actor === "ru" ? "#ff816e" : "#75c8f5",
      weight: 2,
      fillColor: zone.actor === "ru" ? "#c2413d" : "#377fa8",
      fillOpacity: 0.24
    }).addTo(leafletLayers.control);
  });
  if (frontLine.length > 1) {
    L.polyline(lonLatToLeaflet(frontLine), { color: "#f4d897", weight: 3, dashArray: "5 6", opacity: 0.95 }).addTo(leafletLayers.control);
  }

  movementArrows.forEach((movement) => {
    L.polyline(lonLatToLeaflet(movement.coordinates), {
      color: movement.actor === "ru" ? "#e77867" : "#71aee8",
      weight: 2.2,
      opacity: 0.85,
      dashArray: "8 6"
    }).bindTooltip(movement.phase, { sticky: true }).addTo(leafletLayers.movements);
  });

  if (config.adminGeoJSON) {
    Promise.all([
      fetch("./data/ukraine-oblasts.geojson").then((response) => response.json()),
      fetch("./data/ukraine-districts.geojson").then((response) => response.json())
    ]).then(([oblasts, districts]) => {
      L.geoJSON(oblasts, { style: { color: "#eff7f1", weight: 1.25, opacity: 0.75, fillOpacity: 0 } }).addTo(leafletLayers.admin);
      L.geoJSON(districts, { style: { color: "#d1dfd6", weight: 0.65, opacity: 0.48, dashArray: "3 4", fillOpacity: 0 } }).addTo(leafletLayers.admin);
      syncLeafletLayers();
    }).catch((error) => console.warn("Administrative GeoJSON unavailable.", error.message));
  }

  if (config.resources) {
    resourceMarkers.forEach((item) => {
      L.circleMarker([item.lat, item.lon], {
        radius: 5 + Math.sqrt(item.score) * 0.55,
        color: item.color,
        weight: 1.5,
        fillColor: item.color,
        fillOpacity: 0.58
      }).bindTooltip(item.place).on("click", () => renderIntel(item)).addTo(leafletLayers.resources);
    });
  } else {
    events.forEach((event) => {
      const color = event.kind === "ground" ? "#79d6a0" : event.kind === "air" ? "#e77867" : "#ad8de3";
      L.circleMarker([event.lat, event.lon], {
        radius: event.id === state.selected ? 8 : 6,
        color: "#07100d",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95
      }).bindTooltip(event.place.split(" · ")[0]).on("click", () => renderIntel(event)).addTo(leafletLayers.events);
    });
  }

  leafletMap.on("zoomend", () => {
    const z = leafletMap.getZoom();
    byId("zoomDetailState").textContent = z >= 9 ? "DETALLE · LOCAL" : z >= 6 ? "DETALLE · REGIONAL" : "DETALLE · TEATRO";
  });
  syncLeafletLayers();
  setTimeout(() => leafletMap?.invalidateSize(), 50);
}

function syncLeafletLayers() {
  if (!leafletMap) return;
  Object.entries(leafletLayers).forEach(([name, layer]) => {
    const visible = name === "events" || (name === "resources" && currentTheater().resources) || state.layers.has(name);
    if (visible && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
    if (!visible && leafletMap.hasLayer(layer)) leafletMap.removeLayer(layer);
  });
}

function createVectorFallback(container) {
  if (!window.d3 || !window.topojson) return fallbackMap("Cartografía no disponible");
  const width = Math.max(container.clientWidth, 500);
  const height = Math.max(container.clientHeight, 500);
  const svg = d3.select(container).html("").append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-label", "Mapa vectorial de respaldo");
  const viewport = svg.append("g").attr("class", "map-viewport");
  fallbackSvg = svg;
  fallbackZoom = d3.zoom().scaleExtent([1, 8]).on("zoom", (event) => {
    viewport.attr("transform", event.transform);
    const scale = event.transform.k;
    if (vectorZoomFrame) cancelAnimationFrame(vectorZoomFrame);
    vectorZoomFrame = requestAnimationFrame(() => {
      updateVectorDetail(scale);
      updateVectorTextScale(scale);
      updateVectorSymbolScale(scale);
      vectorZoomFrame = null;
    });
  });
  svg.call(fallbackZoom).on("dblclick.zoom", null);
  const config = currentTheater();
  const selectedRegion = resourceRegions[state.resourceRegion] || resourceRegions.world;
  const regionalResourceView = Boolean(config.resources && state.resourceRegion !== "world");
  const projection = regionalResourceView
    ? d3.geoMercator().center(selectedRegion.center).scale(width * selectedRegion.scale).translate([width / 2, height / 2])
    : state.view === "theater"
    ? d3.geoMercator().center(config.center).scale(width * config.scale).translate([width / 2, height / 2])
    : atlasContext
      ? d3.geoMercator().center([atlasContext.lon, atlasContext.lat]).scale(width * 0.46).translate([width / 2, height / 2])
      : d3.geoNaturalEarth1().scale(width / 6.35).translate([width / 2, height / 2]);
  const path = d3.geoPath(projection);
  viewport.append("path").datum(d3.geoGraticule10()).attr("class", "graticule").attr("d", path);

  const finish = () => {
    drawVectorTerrain(viewport, projection);
    drawVectorControl(viewport, projection);
    drawVectorAdministrative(viewport, projection);
    drawVectorWater(viewport, projection);
    drawVectorStrategicLayers(viewport, projection);
    drawVectorTraffic(viewport, projection);
    drawVectorMovements(viewport, projection);
    drawVectorCapabilities(viewport, projection);
    drawVectorFog(viewport, projection);
    if (currentTheater().resources) drawVectorResources(viewport, projection);
    else drawVectorEvents(viewport, projection);
    if (atlasContext && state.view === "world") {
      const point = projection([atlasContext.lon, atlasContext.lat]);
      if (point) {
        const marker = viewport.append("g").attr("class","atlas-context-marker").attr("transform",`translate(${point[0]},${point[1]})`);
        marker.append("circle").attr("class","atlas-context-halo").attr("r",18);
        marker.append("circle").attr("class","atlas-context-core").attr("r",5);
        marker.append("text").attr("x",9).attr("y",-9).text(atlasContext.name);
      }
    }
    syncMapLayers();
    updateVectorDetail(1);
    updateVectorTextScale(1);
    updateVectorSymbolScale(1);
  };
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world) => {
    const countries = topojson.feature(world, world.objects.countries).features;
    viewport.insert("g", ":first-child").selectAll("path").data(countries).join("path")
      .attr("class", (country) => `country${config.focusCountryIds.includes(Number(country.id)) ? " focus-ua" : ""}`).attr("d", path);
    finish();
  }).catch(() => {
    viewport.append("path").datum({ type: "Feature", geometry: { type: "Polygon", coordinates: [[[20,44],[48,44],[51,59],[22,61],[20,44]]] } }).attr("class", "country focus-ua").attr("d", path);
    finish();
  });
}

function drawVectorTerrain(svg, projection) {
  const path = d3.geoPath(projection);
  const group = svg.append("g").attr("class", "map-layer layer-terrain");
  group.selectAll("path.terrain-band").data(terrainBands).join("path")
    .attr("class", (band) => `terrain-band ${band.level}`)
    .attr("d", (band) => path({ type: "Polygon", coordinates: normalizedPolygon(band.coordinates) }));

  const contours = terrainBands.flatMap((band) => {
    const ring = band.coordinates[0];
    const center = ring.reduce((sum, point) => [sum[0] + point[0], sum[1] + point[1]], [0, 0]).map((value) => value / ring.length);
    return [0.82, 0.64, 0.46].map((factor, index) => ({
      level: band.level,
      index,
      coordinates: [ring.map((point) => [
        center[0] + (point[0] - center[0]) * factor,
        center[1] + (point[1] - center[1]) * factor
      ])]
    }));
  });
  group.selectAll("path.terrain-contour").data(contours).join("path")
    .attr("class", (contour) => `terrain-contour ${contour.level}`)
    .attr("d", (contour) => path({ type: "Polygon", coordinates: contour.coordinates }));

  group.selectAll("text").data(terrainBands).join("text").attr("class", "terrain-label")
    .attr("x", (band) => projection(band.coordinates[0][Math.floor(band.coordinates[0].length / 2)])[0])
    .attr("y", (band) => projection(band.coordinates[0][Math.floor(band.coordinates[0].length / 2)])[1])
    .text((band) => `▲ ${band.label}`);
}

function drawVectorControl(svg, projection) {
  const path = d3.geoPath(projection);
  const group = svg.append("g").attr("class", "map-layer layer-control");
  group.selectAll("path.control-zone").data(controlZones).join("path")
    .attr("class", (zone) => `control-zone ${zone.actor}`)
    .attr("d", (zone) => path({ type: "Polygon", coordinates: normalizedPolygon(zone.coordinates) }));
  if (frontLine.length > 1) {
    group.append("path").datum({ type: "LineString", coordinates: frontLine }).attr("class", "front-buffer").attr("d", path);
    group.append("path").datum({ type: "LineString", coordinates: frontLine }).attr("class", "front-line").attr("d", path);
  }
  currentTheater().controlLabels.forEach((label) => {
    const point = projection(label.point);
    if (point) group.append("text").attr("class", `control-label ${label.className}`).attr("x", point[0]).attr("y", point[1]).text(label.text);
  });
}

function drawVectorAdministrative(svg, projection) {
  const path = d3.geoPath(projection);
  const group = svg.append("g").attr("class", "map-layer layer-admin");
  group.append("g").attr("class", "admin-schematic").selectAll("path").data(administrativeLines).join("path")
    .attr("class", "admin-line admin-line-schematic").attr("d", (coordinates) => path({ type: "LineString", coordinates }));

  if (!currentTheater().adminGeoJSON) return;

  Promise.all([
    d3.json("./data/ukraine-oblasts.geojson"),
    d3.json("./data/ukraine-districts.geojson")
  ]).then(([oblasts, districts]) => {
    group.select(".admin-schematic").remove();
    group.append("g").attr("class", "admin-oblasts zoom-regional").append("path")
      .datum(oblasts)
      .attr("class", "admin-line admin-line-oblast")
      .attr("d", path);
    group.append("g").attr("class", "admin-districts zoom-detail").append("path")
      .datum(districts)
      .attr("class", "admin-line admin-line-district")
      .attr("d", path);
    group.append("g").attr("class", "admin-labels zoom-regional").selectAll("text")
      .data(oblasts.features).join("text")
      .attr("class", "admin-label")
      .attr("x", (feature) => path.centroid(feature)[0])
      .attr("y", (feature) => path.centroid(feature)[1])
      .text((feature) => feature.properties.shapeName.replace(/ Oblast$/i, ""));
    vectorDetailLevel = "";
    updateVectorDetail(fallbackSvg?.property("__zoom")?.k || 1);
    updateVectorTextScale(fallbackSvg?.property("__zoom")?.k || 1);
  }).catch((error) => {
    console.warn("Administrative boundary data unavailable; using schematic fallback.", error.message);
  });
}

function drawVectorWater(svg, projection) {
  const path = d3.geoPath(projection);
  const group = svg.append("g").attr("class", "map-layer layer-water");
  group.selectAll("path.waterway-casing").data(waterways).join("path").attr("class", "waterway-casing")
    .attr("d", (river) => path({ type: "LineString", coordinates: river.coordinates }));
  group.selectAll("path.waterway").data(waterways).join("path").attr("class", "waterway")
    .attr("d", (river) => path({ type: "LineString", coordinates: river.coordinates }));
  group.selectAll("text").data(waterways).join("text").attr("class", "water-label zoom-regional")
    .attr("x", (river) => projection(river.coordinates[Math.floor(river.coordinates.length / 2)])[0] + 4)
    .attr("y", (river) => projection(river.coordinates[Math.floor(river.coordinates.length / 2)])[1] - 4)
    .text((river) => river.label);
}

function drawVectorTraffic(svg, projection) {
  trafficProjection = projection;
  const path = d3.geoPath(projection);
  [
    ["maritime", maritimeCorridors],
    ["aviation", aviationCorridors]
  ].forEach(([type, corridors]) => {
    const group = svg.append("g").attr("class", `map-layer layer-${type}`);
    group.selectAll("path").data(corridors).join("path").attr("class", `traffic-corridor ${type}`)
      .attr("d", (corridor) => path({ type: "LineString", coordinates: corridor.coordinates }));
    group.selectAll("text").data(corridors).join("text").attr("class", "traffic-label zoom-regional")
      .attr("x", (corridor) => projection(corridor.coordinates[Math.floor(corridor.coordinates.length / 2)])[0] + 5)
      .attr("y", (corridor) => projection(corridor.coordinates[Math.floor(corridor.coordinates.length / 2)])[1] - 5)
      .text((corridor) => corridor.label);
    group.selectAll("text.traffic-symbol").data(corridors).join("text")
      .attr("class", `traffic-symbol ${type} zoom-regional`)
      .attr("x", (corridor) => projection(corridor.coordinates[Math.floor(corridor.coordinates.length / 2)])[0])
      .attr("y", (corridor) => projection(corridor.coordinates[Math.floor(corridor.coordinates.length / 2)])[1])
      .text(type === "aviation" ? "✈" : "◆");
  });
  renderTrafficContacts(editorialTrafficContacts, true);
  scheduleTrafficRefresh();
}

function renderTrafficContacts(contacts, editorial = false) {
  if (!fallbackSvg || !trafficProjection) return;
  ["aviation", "maritime"].forEach((type) => {
    const group = fallbackSvg.select(`.layer-${type}`);
    if (group.empty()) return;
    const nodes = group.selectAll(`g.traffic-contact.${type}`).data(contacts[type] || [], (_, index) => `${type}-${index}`)
      .join((enter) => {
        const node = enter.append("g");
        node.append("circle").attr("class", "contact-pulse").attr("r", 7);
        node.append("circle").attr("class", "contact-core").attr("r", type === "aviation" ? 2.4 : 2.8);
        node.append("text").attr("x", 5).attr("y", -5);
        node.append("title");
        return node;
      })
      .attr("class", `traffic-contact ${type} zoom-regional${editorial ? " editorial" : ""}`)
      .attr("transform", (contact) => `translate(${trafficProjection([contact.lon, contact.lat]).join(",")})`);
    nodes.select("text").text((contact) => contact.count > 1 ? contact.count : "");
    nodes.select("title").text((contact) => editorial
      ? `Muestra editorial de ${type === "aviation" ? "tráfico aéreo" : "presencia marítima"}; no es una observación real.`
      : `${contact.count} señales agrupadas en una celda regional; sin identificadores ni posición exacta.`);
    nodes.classed("zoom-visible", vectorDetailLevel !== "theater");
  });
  syncMapLayers();
}

async function loadTrafficContacts() {
  const status = byId("trafficStatus");
  if (!currentTheater().liveTraffic) {
    status.textContent = "MUESTRA EDITORIAL · tráfico agregado pendiente de fuente regional";
    status.classList.remove("live");
    return;
  }
  try {
    const response = await fetch("/.netlify/functions/traffic", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const contacts = {
      aviation: payload.aviation?.contacts || [],
      maritime: payload.maritime?.contacts || []
    };
    if (contacts.aviation.length || contacts.maritime.length) {
      renderTrafficContacts(contacts, false);
      const observed = payload.aviation?.observedAt ? new Date(payload.aviation.observedAt) : null;
      const time = observed && !Number.isNaN(observed.valueOf())
        ? observed.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
        : "reciente";
      status.textContent = `ACTUALIZADO ${time} UTC · cuadrícula regional · sin identificadores`;
      status.classList.add("live");
      return;
    }
    status.textContent = "MUESTRA EDITORIAL · configura OpenSky para actualización agregada";
    status.classList.remove("live");
  } catch (error) {
    console.warn("ATLAS traffic feed unavailable; keeping editorial sample.", error.message);
    status.textContent = "FUENTE NO DISPONIBLE · mostrando muestra editorial";
    status.classList.remove("live");
  }
}

function scheduleTrafficRefresh() {
  clearInterval(trafficRefreshTimer);
  loadTrafficContacts();
  if (currentTheater().liveTraffic) trafficRefreshTimer = setInterval(loadTrafficContacts, 5 * 60 * 1000);
}

function drawVectorMovements(svg, projection) {
  const path = d3.geoPath(projection);
  const defs = svg.append("defs");
  [["ru", "#e77867"], ["ua", "#71aee8"]].forEach(([actor, color]) => {
    defs.append("marker").attr("id", `arrow-${actor}`).attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5)
      .attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", color);
  });
  const group = svg.append("g").attr("class", "map-layer layer-movements");
  group.selectAll("path").data(movementArrows).join("path").attr("class", (arrow) => `movement-arrow ${arrow.actor}`)
    .attr("marker-end", (arrow) => `url(#arrow-${arrow.actor})`)
    .attr("d", (arrow) => path({ type: "LineString", coordinates: arrow.coordinates }));
  group.selectAll("text").data(movementArrows).join("text").attr("class", "movement-label zoom-regional")
    .attr("x", (arrow) => projection(arrow.coordinates[1])[0] + 6)
    .attr("y", (arrow) => projection(arrow.coordinates[1])[1] - 6)
    .text((arrow) => arrow.phase);
}

function drawVectorCapabilities(svg, projection) {
  const group = svg.append("g").attr("class", "map-layer layer-units zoom-detail");
  const nodes = group.selectAll("g").data(knownCapabilitySectors).join("g")
    .attr("class", (item) => `capability-sector ${item.actor}`)
    .attr("transform", (item) => `translate(${projection(item.coordinates).join(",")})`);
  nodes.append("circle").attr("class", "capability-uncertainty").attr("r", 24);
  nodes.append("path").attr("class", "capability-symbol").attr("d", "M-4,-4 H4 V4 H-4 Z M-7,0 H7 M0,-7 V7");
  nodes.append("text").attr("x", 11).attr("y", -4).text((item) => item.type);
  nodes.append("text").attr("class", "capability-region").attr("x", 11).attr("y", 7).text((item) => `${item.region} · área ≥50 km`);
}

function updateVectorDetail(scale) {
  const regional = scale >= 1.55;
  const detailed = scale >= 2.35;
  const level = detailed ? "district" : regional ? "oblast" : "theater";
  if (level === vectorDetailLevel) return;
  vectorDetailLevel = level;
  document.querySelectorAll(".zoom-regional").forEach((node) => node.classList.toggle("zoom-visible", regional));
  document.querySelectorAll(".zoom-detail").forEach((node) => node.classList.toggle("zoom-visible", detailed));
  const status = byId("zoomDetailState");
  const levels = currentTheater().adminLevels;
  if (status) status.textContent = `DETALLE · ${detailed ? levels[2] : regional ? levels[1] : levels[0]}`;
}

function updateVectorTextScale(scale) {
  if (!fallbackSvg) return;
  fallbackSvg.selectAll(".map-viewport text").each(function () {
    const text = d3.select(this);
    const x = Number(text.attr("x")) || 0;
    const y = Number(text.attr("y")) || 0;
    text.attr("transform", scale === 1 ? null : `translate(${x},${y}) scale(${1 / scale}) translate(${-x},${-y})`);
  });
}

function updateVectorSymbolScale(scale) {
  if (!fallbackSvg) return;
  const inverseScale = 1 / scale;
  fallbackSvg.selectAll(".event-marker circle, .resource-marker circle, .critical-zone circle, .capability-sector circle, .capability-sector path, .traffic-contact circle")
    .attr("transform", scale === 1 ? null : `scale(${inverseScale})`);
}

function drawVectorStrategicLayers(svg, projection) {
  const path = d3.geoPath(projection);
  ["routes", "rail"].forEach((type) => {
    const routes = strategicRoutes.filter((route) => route.type === type);
    const group = svg.append("g").attr("class", `map-layer layer-${type}`);
    group.selectAll("path").data(routes).join("path").attr("class", `strategic-route ${type}`)
      .attr("d", (route) => path({ type: "LineString", coordinates: route.coordinates }));
    if (type === "routes") {
      group.selectAll("text").data(routes).join("text").attr("class", "route-label zoom-regional")
        .attr("x", (route) => projection(route.coordinates[Math.floor(route.coordinates.length / 2)])[0])
        .attr("y", (route) => projection(route.coordinates[Math.floor(route.coordinates.length / 2)])[1] - 7).text((route) => route.label);
    } else {
      group.selectAll("text").data(routes).join("text").attr("class", "route-label rail-label zoom-regional")
        .attr("x", (route) => projection(route.coordinates[Math.floor(route.coordinates.length / 2)])[0])
        .attr("y", (route) => projection(route.coordinates[Math.floor(route.coordinates.length / 2)])[1] + 9).text((route) => route.label);
    }
  });
  ["energy", "civic", "communications"].forEach((type) => {
    const group = svg.append("g").attr("class", `map-layer layer-${type}`);
    const nodes = group.selectAll("g").data(infrastructureZones.filter((zone) => zone.type === type)).join("g")
      .attr("class", `critical-zone ${type}`).attr("transform", (zone) => `translate(${projection(zone.coordinates).join(",")})`);
    nodes.append("circle").attr("class", "zone-halo").attr("r", 17);
    nodes.append("circle").attr("class", "zone-core").attr("r", 4);
  });
}

function drawVectorFog(svg, projection) {
  const fog = svg.append("g").attr("class", `fog-layer${state.fog ? "" : " hidden"}`);
  currentTheater().fogPoints.forEach(([lon, lat, radius]) => {
    const point = projection([lon, lat]);
    if (point) fog.append("circle").attr("cx", point[0]).attr("cy", point[1]).attr("r", radius).attr("fill", "rgba(152,174,159,.08)");
  });
}

function drawVectorResources(svg, projection) {
  const group = svg.append("g").attr("class", "map-layer layer-resources");
  const nodes = group.selectAll("g.resource-marker").data(resourceMarkers).join("g")
    .attr("class", (item) => `resource-marker ${item.tier === "muy alta" ? "major" : "secondary"}`)
    .attr("data-id", (item) => item.id)
    .attr("transform", (item) => `translate(${projection([item.lon, item.lat]).join(",")})`)
    .on("click", (_, item) => renderIntel(item));
  nodes.append("circle").attr("class", "resource-halo").attr("r", (item) => 8 + Math.sqrt(item.score) * 1.25).attr("fill", (item) => item.color);
  nodes.append("circle").attr("class", "resource-core").attr("r", (item) => 3 + Math.sqrt(item.score) * 0.38).attr("fill", (item) => item.color);
  nodes.append("text").attr("class", "resource-label").attr("x", 12).attr("y", -8).text((item) => item.place);
  nodes.append("title").text((item) => `${item.title} · ${item.facts[3][1]}`);
  nodes.filter((item) => item.id === state.selected).classed("selected", true);
}

function drawVectorEvents(svg, projection) {
  const nodes = svg.append("g").selectAll("g").data(events).join("g")
    .attr("class", (event) => `event-marker ${event.kind}`).attr("data-kind", (event) => event.kind).attr("data-id", (event) => event.id)
    .attr("transform", (event) => `translate(${projection([event.lon, event.lat]).join(",")})`).on("click", (_, event) => renderIntel(event));
  nodes.append("circle").attr("class", "marker-ring").attr("r", 13);
  nodes.append("circle").attr("class", "marker-core").attr("r", 4.5);
  nodes.append("text").attr("class", "marker-label").attr("x", 11).attr("y", -9).text((event) => event.place.split(" · ")[0]);
  nodes.filter((event) => event.id === state.selected).classed("selected", true);
  applyFilter(state.kind);
}

function addAdministrativeTopographicLayers() {
  if (!atlasMap?.isStyleLoaded()) return;
  if (!currentTheater().adminGeoJSON) return;

  atlasMap.addSource("atlas-admin-oblasts", {
    type: "geojson",
    data: "./data/ukraine-oblasts.geojson"
  });
  atlasMap.addSource("atlas-admin-districts", {
    type: "geojson",
    data: "./data/ukraine-districts.geojson"
  });
  atlasMap.addLayer({
    id: "atlas-admin-oblast-lines",
    type: "line",
    source: "atlas-admin-oblasts",
    minzoom: 3,
    paint: {
      "line-color": "#dbe8df",
      "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.7, 8, 1.6],
      "line-opacity": 0.68
    }
  });
  atlasMap.addLayer({
    id: "atlas-admin-oblast-labels",
    type: "symbol",
    source: "atlas-admin-oblasts",
    minzoom: 4.2,
    layout: {
      "text-field": ["coalesce", ["get", "shapeName"], ["get", "name"]],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 13],
      "text-transform": "uppercase",
      "text-letter-spacing": 0.08,
      "text-allow-overlap": false
    },
    paint: {
      "text-color": "#eef5f0",
      "text-halo-color": "#101914",
      "text-halo-width": 1.6
    }
  });
  atlasMap.addLayer({
    id: "atlas-admin-district-lines",
    type: "line",
    source: "atlas-admin-districts",
    minzoom: 6,
    paint: {
      "line-color": "#b7c9bf",
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.45, 10, 1.1],
      "line-opacity": 0.46,
      "line-dasharray": [2, 2]
    }
  });
}

function addStrategicLayers() {
  ["routes", "rail"].forEach((type) => {
    const routes = strategicRoutes.filter((route) => route.type === type);
    atlasMap.addSource(`atlas-${type}`, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: routes.map((route) => ({
          type: "Feature",
          properties: { label: route.label },
          geometry: { type: "LineString", coordinates: route.coordinates }
        }))
      }
    });
    atlasMap.addLayer({
      id: `atlas-${type}-line`,
      type: "line",
      source: `atlas-${type}`,
      paint: type === "routes"
        ? { "line-color": "#e7b567", "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.2, 7, 3], "line-opacity": 0.82 }
        : { "line-color": "#71aee8", "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1, 7, 2.4], "line-opacity": 0.76, "line-dasharray": [3, 2] }
    });
    if (type === "routes") {
      atlasMap.addLayer({
        id: "atlas-routes-label",
        type: "symbol",
        source: "atlas-routes",
        minzoom: 4.2,
        layout: { "symbol-placement": "line-center", "text-field": ["get", "label"], "text-size": 10, "text-allow-overlap": false },
        paint: { "text-color": "#dce6de", "text-halo-color": "#07100d", "text-halo-width": 1.5 }
      });
    }
  });

  ["energy", "civic", "communications"].forEach((type) => {
    const zones = infrastructureZones.filter((zone) => zone.type === type);
    const color = type === "energy" ? "#e7b567" : type === "civic" ? "#79d6a0" : "#ad8de3";
    atlasMap.addSource(`atlas-${type}`, {
      type: "geojson",
      data: { type: "FeatureCollection", features: zones.map((zone) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: zone.coordinates } })) }
    });
    atlasMap.addLayer({
      id: `atlas-${type}-halo`, type: "circle", source: `atlas-${type}`,
      paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 12, 7, 22], "circle-color": color, "circle-opacity": 0.08, "circle-stroke-color": color, "circle-stroke-width": 1.2, "circle-stroke-opacity": 0.8 }
    });
    atlasMap.addLayer({
      id: `atlas-${type}-core`, type: "circle", source: `atlas-${type}`,
      paint: { "circle-radius": 3.5, "circle-color": color, "circle-stroke-color": "#07100d", "circle-stroke-width": 1 }
    });
  });
}

function syncMapLayers() {
  syncLeafletLayers();
  document.querySelectorAll(".map-layer").forEach((layer) => {
    const name = [...layer.classList].find((className) => className.startsWith("layer-"))?.replace("layer-", "");
    layer.classList.toggle("hidden", !state.layers.has(name));
  });
  if (!atlasMap?.isStyleLoaded()) return;
  const ids = {
    routes: ["atlas-routes-line", "atlas-routes-label"], rail: ["atlas-rail-line"],
    energy: ["atlas-energy-halo", "atlas-energy-core"], civic: ["atlas-civic-halo", "atlas-civic-core"],
    communications: ["atlas-communications-halo", "atlas-communications-core"],
    admin: ["atlas-admin-oblast-lines", "atlas-admin-oblast-labels", "atlas-admin-district-lines"]
  };
  Object.entries(ids).forEach(([name, layerIds]) => {
    layerIds.forEach((id) => { if (atlasMap.getLayer(id)) atlasMap.setLayoutProperty(id, "visibility", state.layers.has(name) ? "visible" : "none"); });
  });
}

function changeMapZoom(direction) {
  if (leafletMap) direction > 0 ? leafletMap.zoomIn() : leafletMap.zoomOut();
  else if (atlasMap) direction > 0 ? atlasMap.zoomIn({ duration: 220 }) : atlasMap.zoomOut({ duration: 220 });
  else if (fallbackSvg && fallbackZoom) fallbackSvg.transition().duration(220).call(fallbackZoom.scaleBy, direction > 0 ? 1.5 : 1 / 1.5);
}

function resetMapZoom() {
  if (leafletMap) {
    const config = currentTheater();
    const center = state.view === "theater" ? config.center : [20, 30];
    leafletMap.setView([center[1], center[0]], state.view === "theater" ? 5 : 2);
  } else if (atlasMap) atlasMap.easeTo({ center: state.view === "theater" ? currentTheater().center : [20, 30], zoom: state.view === "theater" ? 4.65 : 1.15, bearing: 0, pitch: 0, duration: 300 });
  else if (fallbackSvg && fallbackZoom) fallbackSvg.transition().duration(260).call(fallbackZoom.transform, d3.zoomIdentity);
}

function addFogLayer() {
  atlasMap.addSource("atlas-fog", {
    type: "geojson",
    data: { type: "FeatureCollection", features: currentTheater().fogPoints.map(([lon, lat]) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [lon, lat] } })) }
  });
  atlasMap.addLayer({
    id: "atlas-fog-layer", type: "circle", source: "atlas-fog",
    layout: { visibility: state.fog ? "visible" : "none" },
    paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 32, 7, 80], "circle-color": "#9aae9f", "circle-opacity": 0.08, "circle-blur": 0.8 }
  });
}

function eventGeoJSON() {
  return {
    type: "FeatureCollection",
    features: events.map((event) => ({
      type: "Feature",
      properties: { id: event.id, kind: event.kind, place: event.place.split(" · ")[0], selected: event.id === state.selected },
      geometry: { type: "Point", coordinates: [event.lon, event.lat] }
    }))
  };
}

function addEventLayers() {
  atlasMap.addSource("atlas-events", { type: "geojson", data: eventGeoJSON() });
  const eventColor = ["match", ["get", "kind"], "ground", "#79d6a0", "air", "#e77867", "diplomacy", "#ad8de3", "#d9f99d"];
  atlasMap.addLayer({
    id: "atlas-event-halo", type: "circle", source: "atlas-events",
    paint: { "circle-radius": ["case", ["get", "selected"], 16, 12], "circle-color": eventColor, "circle-opacity": 0.12, "circle-stroke-color": eventColor, "circle-stroke-width": ["case", ["get", "selected"], 2.5, 1.2], "circle-stroke-opacity": 0.8 }
  });
  atlasMap.addLayer({
    id: "atlas-event-core", type: "circle", source: "atlas-events",
    paint: { "circle-radius": 5, "circle-color": eventColor, "circle-stroke-color": "#07100d", "circle-stroke-width": 2 }
  });
  atlasMap.addLayer({
    id: "atlas-event-label", type: "symbol", source: "atlas-events",
    layout: { "text-field": ["get", "place"], "text-size": 10, "text-offset": [1.1, -1], "text-anchor": "left", "text-allow-overlap": false },
    paint: { "text-color": "#e9efe7", "text-halo-color": "#07100d", "text-halo-width": 2 }
  });
  atlasMap.on("click", "atlas-event-core", (event) => {
    const selected = events.find((item) => item.id === event.features?.[0]?.properties?.id);
    if (selected) renderIntel(selected);
  });
  atlasMap.on("mouseenter", "atlas-event-core", () => { atlasMap.getCanvas().style.cursor = "pointer"; });
  atlasMap.on("mouseleave", "atlas-event-core", () => { atlasMap.getCanvas().style.cursor = ""; });
}

function syncEventFilter() {
  if (!atlasMap?.isStyleLoaded()) return;
  const filter = state.kind === "all" ? null : ["==", ["get", "kind"], state.kind];
  ["atlas-event-halo", "atlas-event-core", "atlas-event-label"].forEach((id) => { if (atlasMap.getLayer(id)) atlasMap.setFilter(id, filter); });
}

function syncEventSelection() {
  const source = atlasMap?.getSource("atlas-events");
  if (source) source.setData(eventGeoJSON());
  document.querySelectorAll(".event-marker, .resource-marker").forEach((node) => node.classList.toggle("selected", node.dataset.id === state.selected));
}

function fallbackMap(message) {
  byId("map").innerHTML = `<div class="map-loading"><span></span>${message}</div>`;
}

function normalizePublicEvent(event, index) {
  const rawKind = String(event.event_type || "").toLowerCase();
  const kind = rawKind.includes("diplom") || rawKind.includes("negoti")
    ? "diplomacy"
    : rawKind.includes("air") || rawKind.includes("missile") || rawKind.includes("drone")
      ? "air"
      : "ground";
  const confidenceScore = Number(event.confidence || 0);
  const confidence = confidenceScore >= 4 ? "high" : confidenceScore >= 2 ? "medium" : "low";
  const occurredAt = event.occurred_at ? new Date(event.occurred_at) : null;

  return {
    id: `EVT-${String(event.id).slice(0, 8).toUpperCase() || index + 1}`,
    kind,
    kindLabel: kind === "diplomacy" ? "DIPLOMACIA" : kind === "air" ? "ATAQUE AÉREO" : "OPERACIÓN TERRESTRE",
    time: occurredAt && !Number.isNaN(occurredAt.valueOf())
      ? `${occurredAt.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`
      : "HORA SIN CONFIRMAR",
    place: event.location_name || "Ubicación aproximada",
    lon: Number(event.longitude),
    lat: Number(event.latitude),
    title: event.title,
    short: event.title,
    summary: event.summary || "Resumen editorial pendiente.",
    confidence,
    confidenceLabel: confidence === "high" ? "ALTA" : confidence === "medium" ? "MEDIA" : "BAJA",
    facts: [
      ["Verificación", event.verification_status || "sin clasificar"],
      ["Conflicto", event.conflict_slug || "sin asignar"],
      ["Precisión", "Posición pública aproximada"]
    ],
    assessment: "Registro publicado desde la capa pública de ATLAS. Consulte la cadena de evidencia antes de extraer conclusiones.",
    sources: [],
    turnDate: occurredAt && !Number.isNaN(occurredAt.valueOf())
      ? occurredAt.toISOString().slice(0, 10)
      : null
  };
}

async function loadPublishedEvents() {
  if (currentTheater().resources) return;
  if (!atlasSupabase) return;

  const { data, error } = await atlasSupabase
    .from("atlas_events")
    .select("id, conflict_slug, occurred_at, event_type, title, summary, location_name, latitude, longitude, verification_status, confidence, created_at")
    .order("occurred_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.warn("ATLAS public feed unavailable; using editorial demo data.", error.message);
    return;
  }
  if (!data?.length) {
    byId("dataNotice").textContent = "Supabase conectado · Sin eventos publicados · Mostrando datos de demostración.";
    return;
  }

  const published = data
    .filter((event) => event.conflict_slug === state.conflict)
    .map(normalizePublicEvent)
    .filter((event) => Number.isFinite(event.lon) && Number.isFinite(event.lat));
  if (!published.length) return;

  turnArchive = published.reduce((archive, event) => {
    const key = event.turnDate || "sin-fecha";
    if (!archive.has(key)) archive.set(key, []);
    archive.get(key).push(event);
    return archive;
  }, new Map());
  const availableTurns = [...turnArchive.keys()].filter((key) => key !== "sin-fecha").sort().reverse();
  currentTurnKey = availableTurns[0] || [...turnArchive.keys()][0];
  events = turnArchive.get(currentTurnKey) || published;
  state.selected = events[0].id;
  updateTurnButton();
  renderTurnArchive();
  byId("dataNotice").textContent = `Supabase conectado · ${published.length} eventos en ${turnArchive.size} turnos · Posiciones aproximadas.`;
  renderTimeline();
  renderIntel(events[0]);
  createMap();
}

document.querySelectorAll(".filter-chip").forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.kind)));
byId("resetFilters").addEventListener("click", () => applyFilter("all"));
byId("fogToggle").addEventListener("change", (event) => {
  state.fog = event.target.checked;
  if (atlasMap?.getLayer("atlas-fog-layer")) atlasMap.setLayoutProperty("atlas-fog-layer", "visibility", state.fog ? "visible" : "none");
  document.querySelector(".fog-layer")?.classList.toggle("hidden", !state.fog);
});
document.querySelectorAll("[data-map-layer]").forEach((input) => input.addEventListener("change", () => {
  if (input.checked) state.layers.add(input.dataset.mapLayer);
  else state.layers.delete(input.dataset.mapLayer);
  syncMapLayers();
}));
byId("zoomIn").addEventListener("click", () => changeMapZoom(1));
byId("zoomOut").addEventListener("click", () => changeMapZoom(-1));
byId("zoomReset").addEventListener("click", resetMapZoom);
document.querySelectorAll(".segmented button").forEach((button) => button.addEventListener("click", () => {
  state.view = button.dataset.view;
  document.querySelectorAll(".segmented button").forEach((item) => item.classList.toggle("active", item === button));
  createMap();
}));

document.querySelectorAll("[data-strategy-view]").forEach((button) => button.addEventListener("click", () => {
  const selectedView = button.dataset.strategyView;
  document.querySelectorAll("[data-strategy-view]").forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".strategy-view").forEach((view) => {
    const active = view.id === `${selectedView}View`;
    view.classList.toggle("active", active);
    view.hidden = !active;
  });
}));

document.querySelectorAll("[data-force-view]").forEach((button) => button.addEventListener("click", () => {
  const selectedView = button.dataset.forceView;
  document.querySelectorAll("[data-force-view]").forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".force-view").forEach((view) => {
    view.hidden = view.id !== `${selectedView}View`;
  });
}));

document.querySelectorAll(".advisor").forEach((button) => button.addEventListener("click", () => {
  const content = advisorContent[button.dataset.advisor];
  if (!content) return;
  document.querySelectorAll(".advisor").forEach((item) => item.classList.toggle("active", item === button));
  byId("advisorKicker").textContent = content.kicker;
  byId("advisorTitle").textContent = content.title;
  byId("advisorCopy").textContent = content.copy;
  byId("advisorSignal").textContent = content.signal;
}));

byId("conflictSelect").addEventListener("change", (event) => {
  state.conflict = event.target.value;
  localStorage.setItem("atlas-conflict", state.conflict);
  applyTheaterData();
  applyAnalysisContext();
  renderTimeline();
  renderIntel(events[0]);
  createMap();
  if (!currentTheater().resources) loadPublishedEvents();
});
byId("resourceSelect").addEventListener("change", (event) => {
  state.resource = event.target.value;
  localStorage.setItem("atlas-resource", state.resource);
  applyTheaterData();
  applyAnalysisContext();
  renderTimeline();
  renderIntel(events[0]);
  createMap();
});
byId("resourceRegionSelect").addEventListener("change", (event) => {
  state.resourceRegion = event.target.value;
  localStorage.setItem("atlas-resource-region", state.resourceRegion);
  applyTheaterData();
  applyAnalysisContext();
  renderTimeline();
  renderIntel(events[0]);
  createMap();
});
byId("languageSelect").addEventListener("change", (event) => {
  state.language = event.target.value;
  atlasLanguageManual = true;
  localStorage.setItem("atlas-language", state.language);
  localStorage.setItem("atlas-language-manual", "true");
  applyAnalysisContext();
  renderNews();
  if (marketSnapshot.size) renderMarketTiles([...marketSnapshot.values()], marketSnapshotUpdatedAt);
  renderIntel(events.find((item) => item.id === state.selected) || events[0]);
});
document.querySelectorAll("[data-perspective]").forEach((button) => button.addEventListener("click", () => {
  state.perspective = button.dataset.perspective;
  localStorage.setItem("atlas-perspective", state.perspective);
  applyAnalysisContext();
  renderIntel(events.find((item) => item.id === state.selected) || events[0]);
}));

const dialog = byId("infoDialog");
[byId("methodButton"), byId("aboutButton"), byId("traceButton")].forEach((button) => button.addEventListener("click", () => dialog.showModal()));
byId("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
byId("closeIntel").addEventListener("click", () => byId("intelPanel").classList.toggle("collapsed"));
function formatTurnDate(key) {
  if (key === "sin-fecha") return "FECHA PENDIENTE";
  const date = new Date(`${key}T12:00:00Z`);
  return Number.isNaN(date.valueOf())
    ? key.toUpperCase()
    : date.toLocaleDateString("es-CL", { day:"2-digit", month:"short", year:"numeric", timeZone:"UTC" }).replaceAll(".", "").toUpperCase();
}

function recentTurnKeys() {
  const datedKeys = [...turnArchive.keys()].filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key)).sort().reverse();
  const anchorKey = datedKeys[0] || currentTurnKey;
  const anchor = new Date(`${anchorKey}T12:00:00Z`);
  if (Number.isNaN(anchor.valueOf())) return datedKeys.slice(0, 8);

  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(anchor);
    date.setUTCDate(anchor.getUTCDate() - index);
    return date.toISOString().slice(0, 10);
  });
}

function updateTurnButton() {
  const keys = recentTurnKeys();
  const latest = keys[0] || currentTurnKey;
  byId("turnStatus").textContent = currentTurnKey === latest ? "Turno activo" : "Turno archivado";
  byId("turnDate").textContent = formatTurnDate(currentTurnKey);
  byId("turnButton").classList.toggle("archived", currentTurnKey !== latest);
}

function selectTurn(key) {
  const selectedEvents = turnArchive.get(key) || [];
  currentTurnKey = key;
  events = selectedEvents;
  state.selected = events[0]?.id || null;
  state.kind = "all";
  document.querySelectorAll(".filter-chip").forEach((button) => button.classList.toggle("active", button.dataset.kind === "all"));
  updateTurnButton();
  renderTurnArchive();
  renderTimeline();
  renderIntel(events[0] || null);
  if (!events.length) {
    byId("eventKind").textContent = "TURNO ARCHIVADO";
    byId("eventTitle").textContent = "Sin eventos publicados";
    byId("eventSummary").textContent = `No hay eventos registrados para el turno del ${formatTurnDate(key)}.`;
    byId("eventAssessment").textContent = "El turno está disponible para consulta, pero todavía no contiene información publicada.";
  }
  byId("visibleCount").textContent = `${events.length} ${events.length === 1 ? "evento visible" : "eventos visibles"}`;
  createMap();
  byId("turnArchiveDialog")?.close();
}

function renderTurnArchive() {
  const list = byId("turnArchiveList");
  if (!list) return;
  const keys = recentTurnKeys();
  list.innerHTML = keys.length ? keys.map((key, index) => {
    const turnEvents = turnArchive.get(key) || [];
    const highConfidence = turnEvents.filter((event) => event.confidence === "high").length;
    const turnNumber = 8 - index;
    return `<button type="button" class="turn-archive-item${key === currentTurnKey ? " active" : ""}" data-turn-key="${key}">
      <span><b>TURNO ${turnNumber}${index === 0 ? " · ACTUAL" : ""}</b><strong>${formatTurnDate(key)}</strong></span>
      <span class="turn-archive-metrics"><em>${turnEvents.length ? `${turnEvents.length} eventos` : "Sin eventos"}</em><small>${turnEvents.length ? `${highConfidence} confianza alta` : "Disponible para consulta"}</small></span>
    </button>`;
  }).join("") : '<div class="turn-archive-empty">Todavía no existen turnos archivados.</div>';
  list.querySelectorAll("[data-turn-key]").forEach((button) => button.addEventListener("click", () => selectTurn(button.dataset.turnKey)));
}

byId("turnButton").addEventListener("click", () => {
  renderTurnArchive();
  byId("turnArchiveDialog")?.showModal();
});
byId("turnArchiveClose")?.addEventListener("click", () => byId("turnArchiveDialog")?.close());
byId("turnArchiveDialog")?.addEventListener("click", (event) => {
  if (event.target === byId("turnArchiveDialog")) byId("turnArchiveDialog").close();
});
updateTurnButton();
renderTurnArchive();

applyTheaterData();
applyAnalysisContext();
renderTimeline();
renderIntel(events[0]);
createMap();
if (!currentTheater().resources) loadPublishedEvents();
window.addEventListener("resize", () => { clearTimeout(window.mapResizeTimer); window.mapResizeTimer = setTimeout(() => atlasMap?.resize(), 180); });


const marketInstruments = [
  { symbol: "^GSPC", code: "S&P 500", region: "Estados Unidos", size: "size-xl" },
  { symbol: "^IXIC", code: "Nasdaq", region: "Estados Unidos", size: "size-xl" },
  { symbol: "^DJI", code: "Dow Jones", region: "Estados Unidos", size: "size-lg" },
  { symbol: "^STOXX50E", code: "Euro Stoxx 50", region: "Europa", size: "size-lg" },
  { symbol: "^FTSE", code: "FTSE 100", region: "Reino Unido", size: "size-md" },
  { symbol: "^GDAXI", code: "DAX", region: "Alemania", size: "size-md" },
  { symbol: "^N225", code: "Nikkei 225", region: "Japón", size: "size-lg" },
  { symbol: "000001.SS", code: "Shanghai", region: "China", size: "size-md" },
  { symbol: "^HSI", code: "Hang Seng", region: "Hong Kong", size: "size-md" },
  { symbol: "^IPSA", code: "IPSA", region: "Chile", size: "size-md" },
  { symbol: "CL=F", code: "WTI", region: "Energía", size: "size-sm" },
  { symbol: "GC=F", code: "Oro", region: "Refugio", size: "size-sm" },
  { symbol: "HG=F", code: "Cobre", region: "Industria", size: "size-sm" }
];
let marketSnapshot = new Map();
let marketSnapshotUpdatedAt = null;

function renderMarketTiles(items, updatedAt) {
  marketSnapshot = new Map(items.map((item) => [item.symbol, item]));
  marketSnapshotUpdatedAt = updatedAt || null;
  const priority = atlasContext?.markets || [];
  items = [...items].sort((a,b) => {
    const ai = priority.indexOf(a.symbol);
    const bi = priority.indexOf(b.symbol);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  if (currentNewsId) {
    const selectedNews = atlasNews.find((item) => item.id === currentNewsId);
    if (selectedNews) renderNewsMarketIndicators(selectedNews);
  }
  const container = byId("marketHeatmap");
  if (!container) return;
  container.innerHTML = items.map((item, index) => {
    const change = Number(item.changePercent);
    const available = Number.isFinite(change);
    const tone = !available ? "unavailable" : change > 0.08 ? "gain" : change < -0.08 ? "loss" : "flat";
    const label = available ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "Sin dato";
    const meta = marketInstruments.find((instrument) => instrument.symbol === item.symbol) || marketInstruments[index] || {};
    return `<a class="market-tile ${tone} ${meta.size || "size-md"}" href="https://finance.yahoo.com/quote/${encodeURIComponent(item.symbol)}" target="_blank" rel="noreferrer" aria-label="${meta.code}: ${label}">
      <span class="market-symbol">${item.symbol}</span>
      <strong>${meta.code}</strong>
      <span class="market-change">${label}</span>
      <small>${meta.region} · última sesión</small>
    </a>`;
  }).join("");
  const stamp = byId("marketTimestamp");
  if (stamp) stamp.textContent = updatedAt ? `Actualizado: ${new Date(updatedAt).toLocaleString(state.language || "es")}` : "Última sesión disponible";
}

async function loadMarketHeatmap() {
  const container = byId("marketHeatmap");
  if (!container) return;
  try {
    const response = await fetch("/.netlify/functions/markets", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    renderMarketTiles(payload.items, payload.updatedAt);
  } catch (error) {
    renderMarketTiles(marketInstruments.map((item) => ({ symbol: item.symbol, changePercent: null })), null);
    const stamp = byId("marketTimestamp");
    if (stamp) stamp.textContent = "Proveedor temporalmente no disponible · estructura del mercado visible";
  }
}

loadMarketHeatmap();


const demoAtlasNews = [
  { id:"N-CL-01", title:"Actividad metropolitana y servicios en Santiago", place:"Santiago, Chile", lat:-33.4489, lon:-70.6693, category:"territory", type:"HECHO", age:1, relevance:82, summary:"La Región Metropolitana concentra señales que afectan la vida diaria: movilidad, continuidad de servicios públicos, decisiones municipales y eventos de impacto territorial. Atlas reúne estos antecedentes para mostrar qué ocurre, dónde sucede y qué organismo debe responder, evitando confundir un reporte inicial con una conclusión definitiva.", analysis:"La ficha territorial reúne señales locales y exige confirmar fecha, organismo responsable y alcance antes de convertirlas en una conclusión.", hashtags:["#Santiago","#ServiciosPúblicos","#Territorio"], source:"Gobierno Regional Metropolitano", sourceUrl:"https://www.gobiernosantiago.cl/" },
  { id:"N-CL-02", title:"Señales económicas relevantes para Chile", place:"Santiago, Chile", lat:-33.4489, lon:-70.6693, category:"economy", type:"ANÁLISIS", age:3, relevance:78, summary:"El desempeño del cobre, el tipo de cambio, las tasas de interés y la actividad interna forman una lectura conectada de la economía chilena. Atlas presenta estas variables como señales complementarias: un movimiento aislado no demuestra una causa, pero su convergencia puede anticipar presiones sobre precios, empleo, crédito o ingresos fiscales.", analysis:"La cercanía geográfica no prueba impacto económico directo. Deben contrastarse cobre, dólar, tasas y actividad con series oficiales.", hashtags:["#Chile","#Economía","#Cobre"], source:"Banco Central de Chile", sourceUrl:"https://www.bcentral.cl/" },
  { id:"N-UA-01", title:"Evolución del frente ruso-ucraniano", place:"Kyiv, Ucrania", lat:50.4501, lon:30.5234, category:"geopolitics", type:"HECHO", age:2, relevance:96, summary:"El seguimiento del frente ruso-ucraniano combina cambios territoriales, ataques de largo alcance, presión logística y señales diplomáticas. Cada dato se clasifica según su corroboración y procedencia, porque una declaración militar, una imagen geolocalizada y una evaluación independiente no tienen el mismo peso probatorio ni describen necesariamente la misma escala.", analysis:"La situación cambia rápidamente. Atlas distingue hechos corroborados, afirmaciones de cada actor e inferencias editoriales.", hashtags:["#Ucrania","#Rusia","#OSINT"], source:"OCHA Ukraine", sourceUrl:"https://www.unocha.org/ukraine" },
  { id:"N-ME-01", title:"Tensiones regionales y rutas energéticas", place:"Amán, Jordania", lat:31.9539, lon:35.9106, category:"geopolitics", type:"ANÁLISIS", age:4, relevance:91, summary:"Las tensiones de Oriente Medio conectan seguridad regional, navegación comercial, infraestructura energética y decisiones diplomáticas. Atlas observa cómo un incidente localizado puede alterar rutas, primas de riesgo o posiciones políticas, pero separa el hecho comprobado de las proyecciones sobre escalada para no presentar escenarios posibles como resultados inevitables.", analysis:"Las rutas energéticas y las tensiones regionales deben analizarse con cronología, capacidad material e hipótesis alternativas.", hashtags:["#OrienteMedio","#Energía","#Geopolítica"], source:"OCHA Middle East", sourceUrl:"https://www.unocha.org/middle-east-and-north-africa" },
  { id:"N-SD-01", title:"Situación humanitaria y territorial en Sudán", place:"Jartum, Sudán", lat:15.5007, lon:32.5599, category:"security", type:"HECHO", age:5, relevance:88, summary:"La crisis en Sudán combina desplazamiento, interrupción de servicios, restricciones de acceso humanitario y control territorial fragmentado. Los reportes disponibles permiten delinear tendencias, aunque la falta de conectividad y acceso produce importantes vacíos de información; por eso las cifras publicadas deben entenderse como mínimos documentados.", analysis:"Los vacíos de acceso y telecomunicaciones producen subregistro. Las cifras deben leerse como mínimos documentados.", hashtags:["#Sudán","#CrisisHumanitaria","#África"], source:"OCHA Sudan", sourceUrl:"https://www.unocha.org/sudan" },
  { id:"N-AS-01", title:"Mercados asiáticos y cadenas de suministro", place:"Singapur", lat:1.3521, lon:103.8198, category:"economy", type:"ANÁLISIS", age:6, relevance:80, summary:"Los mercados asiáticos entregan señales sobre manufactura, comercio marítimo, demanda de materias primas y funcionamiento de las cadenas de suministro. Atlas relaciona precios, fletes, inventarios y actividad industrial para construir contexto, sin atribuir automáticamente cada variación bursátil a un único evento político o económico.", analysis:"Los movimientos de mercado son señales, no explicaciones causales. Deben contrastarse con comercio, fletes e inventarios.", hashtags:["#Asia","#Mercados","#CadenasDeSuministro"], source:"IMF Data", sourceUrl:"https://data.imf.org/" },
  { id:"N-TECH-01", title:"Infraestructura digital y exposición a incidentes cibernéticos", place:"Santiago, Chile", lat:-33.4489, lon:-70.6693, category:"technology", type:"ANÁLISIS", age:2, relevance:84, summary:"La continuidad de servicios digitales depende de centros de datos, redes de telecomunicaciones, proveedores de nube y sistemas públicos interconectados. Atlas reúne alertas técnicas y comunicados oficiales para distinguir una vulnerabilidad conocida, un incidente confirmado y una interrupción que efectivamente afecta a personas u organizaciones.", analysis:"Una alerta de vulnerabilidad no demuestra explotación. La evaluación debe identificar producto, alcance, evidencia y medidas de mitigación.", hashtags:["#Ciberseguridad","#InfraestructuraDigital","#Chile"], source:"CSIRT de Gobierno de Chile", sourceUrl:"https://www.csirt.gob.cl/" },
  { id:"N-RES-01", title:"Cobre, agua y exposición climática del norte minero", place:"Antofagasta, Chile", lat:-23.6509, lon:-70.3975, category:"resources", type:"ANÁLISIS", age:7, relevance:86, summary:"La producción de cobre en el norte de Chile conecta disponibilidad hídrica, energía, puertos, empleo y recaudación fiscal. Atlas superpone instalaciones y corredores productivos con señales climáticas para mostrar dependencias territoriales, evitando convertir variaciones meteorológicas o de precios en predicciones automáticas de producción.", analysis:"El riesgo productivo surge de la convergencia entre clima, agua, energía, operación minera y logística; ninguna variable aislada basta.", hashtags:["#Cobre","#Agua","#Clima"], source:"Comisión Chilena del Cobre", sourceUrl:"https://www.cochilco.cl/" },
  { id:"N-HEALTH-01", title:"Señales de salud pública y presión territorial sobre la red", place:"Maipú, Chile", lat:-33.5106, lon:-70.7573, category:"health", type:"HECHO", age:3, relevance:81, summary:"La vigilancia sanitaria territorial permite relacionar circulación de enfermedades, demanda asistencial y capacidad de respuesta de la red. Atlas prioriza datos agregados y fuentes institucionales, preserva la privacidad y diferencia una señal epidemiológica temprana de una tendencia confirmada por series comparables.", analysis:"La incidencia, gravedad y presión asistencial deben analizarse por población, periodo y territorio; los casos aislados no describen por sí solos una tendencia.", hashtags:["#SaludPública","#Maipú","#Vigilancia"], source:"Ministerio de Salud de Chile", sourceUrl:"https://www.minsal.cl/" },
  { id:"N-INFRA-01", title:"Puertos y corredores logísticos de la zona central", place:"Valparaíso, Chile", lat:-33.0472, lon:-71.6127, category:"infrastructure", type:"ANÁLISIS", age:5, relevance:83, summary:"Los puertos de Valparaíso y San Antonio, junto con las rutas hacia Santiago y los pasos cordilleranos, forman una red crítica para abastecimiento y comercio exterior. Atlas contextualiza interrupciones, obras y congestión según su duración, capacidad afectada y alternativas disponibles dentro del sistema logístico.", analysis:"Una interrupción local adquiere relevancia estratégica cuando reduce capacidad, carece de rutas alternativas o coincide con presión sobre otros nodos.", hashtags:["#Puertos","#Logística","#Infraestructura"], source:"Ministerio de Transportes y Telecomunicaciones", sourceUrl:"https://www.mtt.gob.cl/" }
];
let atlasNews = [...demoAtlasNews];
let liveNewsRequestId = 0;

async function loadLiveNews() {
  if (!atlasContext) return;
  const requestId = ++liveNewsRequestId;
  const feed = byId("newsFeed");
  if (feed) feed.setAttribute("aria-busy","true");
  const stateNode = byId("newsLocationState");
  if (stateNode) stateNode.innerHTML = `<span class="location-pulse searching"></span><div><strong>ACTUALIZANDO NOTICIAS</strong><small>${atlasContext.name}</small></div>`;
  try {
    const params = new URLSearchParams({
      location:atlasContext.name,
      country:atlasContext.country || "CL",
      language:state.language || "es",
      lat:String(atlasContext.lat),
      lon:String(atlasContext.lon)
    });
    const response = await fetch(`/api/news?${params}`, { headers:{ Accept:"application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (requestId !== liveNewsRequestId) return;
    if (!Array.isArray(payload.articles) || !payload.articles.length) throw new Error("Sin artículos");
    atlasNews = payload.articles;
    currentNewsId = null;
    renderNews();
    if (stateNode) stateNode.innerHTML = `<span class="location-pulse active"></span><div><strong>${atlasContext.name.toUpperCase()}</strong><small>${atlasNews.length} noticias reales · actualización automática</small></div>`;
  } catch (error) {
    if (requestId !== liveNewsRequestId) return;
    atlasNews = [...demoAtlasNews];
    renderNews();
    if (stateNode) stateNode.innerHTML = `<span class="location-pulse"></span><div><strong>FUENTE TEMPORALMENTE NO DISPONIBLE</strong><small>Mostrando fichas editoriales de respaldo</small></div>`;
    console.warn("Live news unavailable; using editorial fallback.", error.message);
  } finally {
    if (feed) feed.removeAttribute("aria-busy");
  }
}


const newsCategoryLabels = {
  territory:"Territorio y Chile",
  geopolitics:"Geopolítica y conflictos",
  economy:"Economía y mercados",
  security:"Seguridad y emergencias",
  technology:"Tecnología y ciberespacio",
  resources:"Energía, recursos y clima",
  health:"Salud, ciencia y sociedad",
  infrastructure:"Infraestructura y logística"
};

const newsEditorialMeta = {
  "N-CL-01":{scope:"Local",urgency:"Seguimiento",format:"Noticia"},
  "N-CL-02":{scope:"Nacional",urgency:"Contexto",format:"Análisis"},
  "N-UA-01":{scope:"Mundial",urgency:"Seguimiento",format:"Noticia"},
  "N-ME-01":{scope:"Regional",urgency:"Seguimiento",format:"Análisis"},
  "N-SD-01":{scope:"Regional",urgency:"Última hora",format:"Noticia"},
  "N-AS-01":{scope:"Mundial",urgency:"Contexto",format:"Análisis"},
  "N-TECH-01":{scope:"Nacional",urgency:"Seguimiento",format:"Investigación"},
  "N-RES-01":{scope:"Regional",urgency:"Contexto",format:"Análisis"},
  "N-HEALTH-01":{scope:"Local",urgency:"Seguimiento",format:"Noticia"},
  "N-INFRA-01":{scope:"Regional",urgency:"Seguimiento",format:"Análisis"}
};

const newsMapContexts = {
  "N-CL-01": {
    layer:"MOVILIDAD Y SERVICIOS",
    insight:"El eje Santiago–Maipú concentra población y desplazamientos; Valparaíso y San Antonio conectan la capital con puertos y abastecimiento.",
    points:[{name:"Maipú",lon:-70.76,lat:-33.51,role:"Nodo urbano"},{name:"Santiago",lon:-70.67,lat:-33.45,role:"Centro metropolitano"},{name:"Valparaíso",lon:-71.62,lat:-33.05,role:"Puerto"},{name:"San Antonio",lon:-71.61,lat:-33.59,role:"Puerto"}],
    lines:[{name:"Corredor central–puertos",coordinates:[[-70.76,-33.51],[-70.95,-33.47],[-71.3,-33.35],[-71.62,-33.05]]}]
  },
  "N-CL-02": {
    layer:"CORREDORES ECONÓMICOS",
    insight:"La lectura económica conecta el centro financiero de Santiago con puertos exportadores y el corredor cordillerano hacia Argentina.",
    points:[{name:"Santiago",lon:-70.67,lat:-33.45,role:"Centro financiero"},{name:"Valparaíso",lon:-71.62,lat:-33.05,role:"Comercio exterior"},{name:"San Antonio",lon:-71.61,lat:-33.59,role:"Comercio exterior"},{name:"Los Andes",lon:-70.60,lat:-32.83,role:"Paso logístico"}],
    lines:[{name:"Eje exportador",coordinates:[[-71.62,-33.05],[-70.67,-33.45],[-70.60,-32.83]]}]
  },
  "N-UA-01": {
    layer:"FRENTE Y LOGÍSTICA",
    insight:"Kyiv funciona como centro político y logístico; Dnipró articula la retaguardia y Limán se ubica próximo al frente oriental.",
    points:[{name:"Kyiv",lon:30.52,lat:50.45,role:"Centro político"},{name:"Dnipro",lon:35.05,lat:48.46,role:"Nodo logístico"},{name:"Limán",lon:37.80,lat:48.99,role:"Sector del frente"}],
    lines:[{name:"Eje logístico oriental",coordinates:[[30.52,50.45],[32.0,49.5],[35.05,48.46],[37.80,48.99]]},{name:"Frente aproximado",coordinates:[[37.0,51.0],[37.6,49.5],[36.9,47.7]]}]
  },
  "N-ME-01": {
    layer:"ENERGÍA Y CONECTIVIDAD",
    insight:"Amán se sitúa entre el Levante y los corredores hacia el mar Rojo; Suez y Bab el-Mandeb son pasos críticos para energía y comercio.",
    points:[{name:"Amán",lon:35.91,lat:31.95,role:"Centro regional"},{name:"Suez",lon:32.55,lat:29.97,role:"Paso marítimo"},{name:"Aqaba",lon:35.01,lat:29.53,role:"Puerto energético"},{name:"Bab el-Mandeb",lon:43.35,lat:12.58,role:"Estrecho crítico"}],
    lines:[{name:"Ruta mar Rojo",coordinates:[[32.55,29.97],[34.8,27.5],[38.5,20.0],[43.35,12.58]]}]
  },
  "N-SD-01": {
    layer:"ACCESO HUMANITARIO",
    insight:"Jartum concentra la crisis urbana; Puerto Sudán sostiene la entrada de suministros y Darfur reúne graves restricciones de acceso.",
    points:[{name:"Jartum",lon:32.56,lat:15.50,role:"Crisis urbana"},{name:"Puerto Sudán",lon:37.22,lat:19.62,role:"Entrada de ayuda"},{name:"Darfur",lon:24.90,lat:13.20,role:"Acceso restringido"}],
    lines:[{name:"Corredor de abastecimiento",coordinates:[[37.22,19.62],[34.6,17.5],[32.56,15.50]]}]
  },
  "N-AS-01": {
    layer:"CADENAS DE SUMINISTRO",
    insight:"Singapur y el estrecho de Malaca forman un cuello de botella entre el Índico y el Pacífico para energía, contenedores y manufacturas.",
    points:[{name:"Singapur",lon:103.82,lat:1.35,role:"Hub portuario"},{name:"Malaca",lon:102.25,lat:2.20,role:"Paso marítimo"},{name:"Johor",lon:103.76,lat:1.49,role:"Nodo industrial"}],
    lines:[{name:"Estrecho de Malaca",coordinates:[[99.8,5.7],[101.2,3.8],[102.25,2.20],[103.82,1.35],[104.6,0.5]]}]
  }
};

Object.assign(newsMapContexts, {
  "N-TECH-01": {
    layer:"INFRAESTRUCTURA DIGITAL",
    insight:"Santiago concentra servicios públicos y empresariales; los enlaces internacionales y centros de datos conectan la continuidad local con proveedores globales.",
    points:[{name:"Santiago",lon:-70.67,lat:-33.45,role:"Demanda digital"},{name:"Valparaíso",lon:-71.62,lat:-33.05,role:"Enlaces costeros"},{name:"Maipú",lon:-70.76,lat:-33.51,role:"Servicios urbanos"}],
    lines:[{name:"Red metropolitana",coordinates:[[-71.62,-33.05],[-70.67,-33.45],[-70.76,-33.51]]}]
  },
  "N-RES-01": {
    layer:"RECURSOS Y CLIMA",
    insight:"Antofagasta conecta faenas mineras interiores con desalación, energía y puertos del Pacífico.",
    points:[{name:"Antofagasta",lon:-70.40,lat:-23.65,role:"Puerto y servicios"},{name:"Calama",lon:-68.93,lat:-22.46,role:"Nodo minero"},{name:"Mejillones",lon:-70.45,lat:-23.10,role:"Energía y puerto"}],
    lines:[{name:"Corredor minero-portuario",coordinates:[[-68.93,-22.46],[-69.65,-23.1],[-70.45,-23.10],[-70.40,-23.65]]}]
  },
  "N-HEALTH-01": {
    layer:"RED SANITARIA TERRITORIAL",
    insight:"Maipú forma parte de una red metropolitana donde movilidad, densidad y capacidad asistencial condicionan la respuesta sanitaria.",
    points:[{name:"Maipú",lon:-70.76,lat:-33.51,role:"Cobertura local"},{name:"Santiago",lon:-70.67,lat:-33.45,role:"Red metropolitana"},{name:"Pudahuel",lon:-70.77,lat:-33.44,role:"Conectividad"}],
    lines:[{name:"Continuidad de red",coordinates:[[-70.77,-33.44],[-70.76,-33.51],[-70.67,-33.45]]}]
  },
  "N-INFRA-01": {
    layer:"PUERTOS Y CORREDORES",
    insight:"Valparaíso y San Antonio conectan el comercio marítimo con Santiago y los pasos hacia Argentina.",
    points:[{name:"Valparaíso",lon:-71.61,lat:-33.05,role:"Puerto"},{name:"San Antonio",lon:-71.61,lat:-33.59,role:"Puerto"},{name:"Santiago",lon:-70.67,lat:-33.45,role:"Centro de demanda"},{name:"Los Andes",lon:-70.60,lat:-32.83,role:"Paso terrestre"}],
    lines:[{name:"Sistema logístico central",coordinates:[[-71.61,-33.59],[-70.67,-33.45],[-70.60,-32.83]]},{name:"Eje Valparaíso",coordinates:[[-71.61,-33.05],[-70.67,-33.45]]}]
  }
});

const newsMarketLinks = {
  "N-CL-01":[
    {symbol:"^IPSA",label:"IPSA",reason:"Actividad local"},
    {symbol:"HG=F",label:"Cobre",reason:"Ingreso exportador"}
  ],
  "N-CL-02":[
    {symbol:"^IPSA",label:"IPSA",reason:"Mercado chileno"},
    {symbol:"HG=F",label:"Cobre",reason:"Principal exportación"},
    {symbol:"^GSPC",label:"S&P 500",reason:"Entorno global"}
  ],
  "N-UA-01":[
    {symbol:"CL=F",label:"Petróleo WTI",reason:"Energía y sanciones"},
    {symbol:"GC=F",label:"Oro",reason:"Demanda defensiva"},
    {symbol:"^STOXX50E",label:"Euro Stoxx 50",reason:"Exposición europea"}
  ],
  "N-ME-01":[
    {symbol:"CL=F",label:"Petróleo WTI",reason:"Riesgo energético"},
    {symbol:"GC=F",label:"Oro",reason:"Activo refugio"},
    {symbol:"^STOXX50E",label:"Euro Stoxx 50",reason:"Comercio y energía"}
  ],
  "N-SD-01":[
    {symbol:"GC=F",label:"Oro",reason:"Exportación regional"},
    {symbol:"CL=F",label:"Petróleo WTI",reason:"Economía regional"}
  ],
  "N-AS-01":[
    {symbol:"^HSI",label:"Hang Seng",reason:"Comercio asiático"},
    {symbol:"000001.SS",label:"Shanghai",reason:"Manufactura china"},
    {symbol:"^N225",label:"Nikkei 225",reason:"Industria regional"}
  ],
  "N-TECH-01":[
    {symbol:"^IXIC",label:"Nasdaq",reason:"Sector tecnológico"},
    {symbol:"^GSPC",label:"S&P 500",reason:"Exposición digital"}
  ],
  "N-RES-01":[
    {symbol:"HG=F",label:"Cobre",reason:"Recurso estratégico"},
    {symbol:"^IPSA",label:"IPSA",reason:"Exposición minera"}
  ],
  "N-HEALTH-01":[
    {symbol:"^IPSA",label:"IPSA",reason:"Entorno económico local"}
  ],
  "N-INFRA-01":[
    {symbol:"HG=F",label:"Cobre",reason:"Carga exportadora"},
    {symbol:"^IPSA",label:"IPSA",reason:"Actividad chilena"}
  ]
};

function renderNewsMarketIndicators(item) {
  const container = byId("newsMarketIndicators");
  if (!container) return;
  const categoryMarketLinks = {
    territory:[{symbol:"^IPSA",label:"Mercado local",reason:"Contexto territorial"}],
    geopolitics:[{symbol:"CL=F",label:"Petróleo WTI",reason:"Riesgo geopolítico"},{symbol:"GC=F",label:"Oro",reason:"Activo defensivo"}],
    economy:[{symbol:"^GSPC",label:"S&P 500",reason:"Mercado global"},{symbol:"HG=F",label:"Cobre",reason:"Actividad industrial"}],
    security:[{symbol:"GC=F",label:"Oro",reason:"Percepción de riesgo"}],
    technology:[{symbol:"^IXIC",label:"Nasdaq",reason:"Sector tecnológico"}],
    resources:[{symbol:"HG=F",label:"Cobre",reason:"Materias primas"},{symbol:"CL=F",label:"Petróleo WTI",reason:"Energía"}],
    health:[{symbol:"^GSPC",label:"S&P 500",reason:"Entorno económico"}],
    infrastructure:[{symbol:"HG=F",label:"Cobre",reason:"Infraestructura"},{symbol:"CL=F",label:"Petróleo WTI",reason:"Transporte"}]
  };
  const links = newsMarketLinks[item.id] || categoryMarketLinks[item.category] || [];
  container.innerHTML = links.map((link) => {
    const quote = marketSnapshot.get(link.symbol);
    const change = Number(quote?.changePercent);
    const available = Number.isFinite(change);
    const tone = !available ? "unavailable" : change > 0.08 ? "gain" : change < -0.08 ? "loss" : "flat";
    const value = available ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "Sin dato";
    return `<a class="news-market-indicator ${tone}" href="https://finance.yahoo.com/quote/${encodeURIComponent(link.symbol)}" target="_blank" rel="noreferrer">
      <span><b>${link.label}</b><small>${link.reason}</small></span>
      <strong>${value}</strong>
    </a>`;
  }).join("");
  const stamp = byId("newsMarketTimestamp");
  if (stamp) stamp.textContent = marketSnapshotUpdatedAt
    ? `Última sesión · ${new Date(marketSnapshotUpdatedAt).toLocaleString("es-CL")}`
    : "Datos indicativos · proveedor pendiente";
}

let newsLocation = null;
let newsFilter = "all";
let newsNearbyOnly = false;
let newsLocationRequested = false;
let currentNewsItems = [];
let currentNewsId = null;
const newsPreferences = JSON.parse(localStorage.getItem("atlas-news-preferences") || "{}");
const knownNewsPlaces = [
  { name:"Maipú, Región Metropolitana", lat:-33.51, lon:-70.76 },
  { name:"Santiago, Región Metropolitana", lat:-33.45, lon:-70.67 },
  { name:"Valparaíso, Chile", lat:-33.05, lon:-71.62 },
  { name:"Concepción, Chile", lat:-36.82, lon:-73.05 },
  { name:"Kyiv, Ucrania", lat:50.45, lon:30.52 }
];

function nearestNewsPlace(location) {
  return knownNewsPlaces.map((place) => ({ ...place, distance:distanceKm(location, place) })).sort((a,b) => a.distance-b.distance)[0];
}

function distanceKm(a, b) {
  const radius = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function escapeNewsText(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
}

function newsSourceUrl(value = "") {
  try {
    const url = new URL(value, location.origin);
    return ["http:","https:"].includes(url.protocol) ? url.href : "#";
  } catch { return "#"; }
}

function renderNews() {
  const feed = byId("newsFeed");
  if (!feed) return;
  const sort = byId("newsSort")?.value || "distance";
  let items = atlasNews.map((item) => ({ ...item, distance: newsLocation ? distanceKm(newsLocation, item) : null }));
  if (newsFilter !== "all") items = items.filter((item) => item.category === newsFilter);
  if (newsNearbyOnly) items = items.filter((item) => item.distance !== null && item.distance <= 500);
  items.sort((a,b) => sort === "recent" ? a.age-b.age : sort === "relevance" ? b.relevance-a.relevance : newsLocation ? a.distance-b.distance : b.relevance-a.relevance);
  currentNewsItems = items;
  feed.innerHTML = items.length ? items.map((item, index) => `
    <article class="news-card" data-news-id="${escapeNewsText(item.id)}" tabindex="0">
      <div class="news-rank">${String(index + 1).padStart(2,"0")}</div>
      <div class="news-card-body">
        <div class="news-meta"><span class="news-type ${escapeNewsText(item.type.toLowerCase())}">${escapeNewsText(item.type)}</span><span class="news-section-tag">${escapeNewsText(newsCategoryLabels[item.category] || item.category)}</span><span>${escapeNewsText(item.place)}</span><span>hace ${item.age} h</span></div>
        <h2>${escapeNewsText(item.title)}</h2>
        <div class="news-editorial-tags">${Object.values(newsEditorialMeta[item.id] || {scope:item.live ? "Actualidad" : "Regional",urgency:item.age <= 6 ? "Última hora" : "Seguimiento",format:item.live ? "Noticia" : "Análisis"}).map((value) => `<span>${escapeNewsText(value)}</span>`).join("")}</div>
        <p class="news-card-excerpt">${escapeNewsText(item.summary.length > 280 ? item.summary.slice(0, 277).trimEnd() + "…" : item.summary)}</p>
        <div class="news-hashtags">${item.hashtags.map((tag) => `<span>${escapeNewsText(tag)}</span>`).join("")}</div>
        <div class="news-source"><a href="${newsSourceUrl(item.sourceUrl)}" target="_blank" rel="noreferrer" aria-label="Profundizar en ${escapeNewsText(item.source)}">Profundizar en ${escapeNewsText(item.source)} ↗</a><b>${item.distance === null ? "Orden global" : item.distance < 1 ? "En tu zona" : Math.round(item.distance).toLocaleString("es-CL") + " km"}</b></div>
        <small class="news-open-hint">Doble clic para abrir la ficha completa</small>
      </div>
    </article>`).join("") : '<div class="news-empty">No hay noticias dentro de este filtro territorial.</div>';
}

function setAtlasSection(name) {
  document.querySelectorAll("[data-atlas-section]").forEach((button) => {
    const active = button.dataset.atlasSection === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".atlas-section").forEach((section) => {
    const visible = section.classList.contains(`atlas-${name}-section`);
    section.hidden = !visible;
  });
  if (name === "news") {
    renderNews();
    if (!newsLocationRequested) requestNewsLocation();
  }
  if (name === "map") setTimeout(() => { leafletMap?.invalidateSize(); atlasMap?.resize(); }, 40);
  if (!atlasAuthCallbackPending) {
    history.replaceState(null, "", name === "map" ? "#map" : name === "news" ? "#newsroom" : "#markets");
  }
}

function requestNewsLocation() {
  newsLocationRequested = true;
  if (atlasContext) {
    newsLocation = { lat:atlasContext.lat, lon:atlasContext.lon };
    byId("locationConsent").hidden = true;
    byId("newsLocationState").innerHTML = `<span class="location-pulse active"></span><div><strong>${atlasContext.name.toUpperCase()}</strong><small>Contexto territorial global</small></div>`;
    renderNews();
    return;
  }
  if (!navigator.geolocation) {
    byId("newsLocationState").innerHTML = "<div><strong>UBICACIÓN NO DISPONIBLE</strong><small>Orden global activo</small></div>";
    return;
  }
  byId("newsLocationState").innerHTML = '<span class="location-pulse searching"></span><div><strong>LOCALIZANDO…</strong><small>Esperando permiso del navegador</small></div>';
  navigator.geolocation.getCurrentPosition((position) => {
    newsLocation = {
      lat: Math.round(position.coords.latitude * 100) / 100,
      lon: Math.round(position.coords.longitude * 100) / 100
    };
    const nearest = nearestNewsPlace(newsLocation);
    byId("locationConsent").hidden = true;
    byId("newsLocationState").innerHTML = `<span class="location-pulse active"></span><div><strong>${nearest.name.toUpperCase()}</strong><small>Ubicación aproximada · ±${Math.max(1, Math.round(position.coords.accuracy / 1000))} km</small></div>`;
    renderNews();
  }, () => {
    byId("locationConsent").hidden = true;
    byId("newsLocationState").innerHTML = '<div><strong>UBICACIÓN NO COMPARTIDA</strong><small>Orden global activo</small></div>';
    renderNews();
  }, { enableHighAccuracy:false, timeout:8000, maximumAge:900000 });
}

document.querySelectorAll("[data-atlas-section]").forEach((button) => button.addEventListener("click", () => setAtlasSection(button.dataset.atlasSection)));
document.querySelector(".market-nav-button")?.addEventListener("click", (event) => {
  event.preventDefault();
  setAtlasSection("markets");
});
document.querySelectorAll("[data-news-filter]").forEach((button) => button.addEventListener("click", () => {
  newsFilter = button.dataset.newsFilter;
  document.querySelectorAll("[data-news-filter]").forEach((item) => item.classList.toggle("active", item === button));
  byId("newsroom")?.querySelector(".news-more-sections")?.classList.toggle("has-active-filter", button.closest(".news-more-sections") !== null);
  const details = button.closest(".news-more-sections");
  if (details) details.open = false;
  renderNews();
}));
byId("newsNearbyToggle")?.addEventListener("click", (event) => {
  newsNearbyOnly = !newsNearbyOnly;
  event.currentTarget.classList.toggle("active", newsNearbyOnly);
  event.currentTarget.setAttribute("aria-pressed", String(newsNearbyOnly));
  renderNews();
});
byId("newsSort")?.addEventListener("change", renderNews);
byId("allowLocation")?.addEventListener("click", requestNewsLocation);
byId("skipLocation")?.addEventListener("click", () => {
  byId("locationConsent").hidden = true;
  byId("newsLocationState").innerHTML = '<div><strong>UBICACIÓN NO COMPARTIDA</strong><small>Orden global activo</small></div>';
  renderNews();
});

const initialAtlasSection = location.hash === "#newsroom" ? "news" : location.hash === "#markets" ? "markets" : "map";
setAtlasSection(initialAtlasSection);

let newsWorldPromise = null;

function loadNewsWorld() {
  if (!newsWorldPromise) {
    newsWorldPromise = d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((world) => topojson.feature(world, world.objects.countries).features)
      .catch(() => []);
  }
  return newsWorldPromise;
}

async function renderNewsContextMap(item) {
  const container = byId("newsContextMap");
  if (!container || !window.d3 || !window.topojson || !Number.isFinite(item.lat) || !Number.isFinite(item.lon)) {
    if (container) container.innerHTML = '<div class="news-context-map__empty">Ubicación cartográfica no disponible</div>';
    return;
  }

  container.innerHTML = '<div class="news-context-map__loading">Construyendo contexto territorial…</div>';
  const width = Math.max(container.clientWidth || 620, 320);
  const height = Math.max(container.clientHeight || 270, 220);
  const clipId = `news-map-clip-${item.id.replace(/[^a-z0-9]/gi, "")}`;
  const projection = d3.geoMercator()
    .center([item.lon, item.lat])
    .scale(width * 3.15)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath(projection);
  const countries = await loadNewsWorld();
  if (!container.isConnected) return;

  const svg = d3.select(container).html("").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid slice");
  svg.append("defs").append("clipPath").attr("id", clipId)
    .append("rect").attr("width", width).attr("height", height).attr("rx", 8);
  const map = svg.append("g").attr("clip-path", `url(#${clipId})`);
  map.append("rect").attr("class", "news-map-ocean").attr("width", width).attr("height", height);
  map.append("path").datum(d3.geoGraticule().step([5, 5])()).attr("class", "news-map-graticule").attr("d", path);
  map.append("g").selectAll("path").data(countries).join("path").attr("class", "news-map-country").attr("d", path);

  const localTerrain = terrainBands.filter((band) => {
    const points = band.coordinates.flat(2);
    return points.some((value, index) => index % 2 === 0 && Math.abs(value - item.lon) < 18);
  });
  map.append("g").selectAll("path").data(localTerrain).join("path")
    .attr("class", (band) => `news-map-terrain ${band.level}`)
    .attr("d", (band) => path({ type:"Polygon", coordinates:normalizedPolygon(band.coordinates) }));

  map.append("g").selectAll("path").data(waterways).join("path")
    .attr("class", "news-map-water")
    .attr("d", (river) => path({ type:"LineString", coordinates:river.coordinates }));
  map.append("g").selectAll("path").data(administrativeLines).join("path")
    .attr("class", "news-map-admin")
    .attr("d", (line) => path({ type:"LineString", coordinates:line }));

  const context = newsMapContexts[item.id];
  if (context) {
    const layer = map.append("g").attr("class", "news-map-context-layer");
    layer.selectAll("path.news-map-context-route").data(context.lines || []).join("path")
      .attr("class", (route, index) => `news-map-context-route route-${index}`)
      .attr("d", (route) => path({ type:"LineString", coordinates:route.coordinates }));
    const nodes = layer.selectAll("g.news-map-context-node").data(context.points || []).join("g")
      .attr("class", "news-map-context-node")
      .attr("transform", (node) => {
        const coords = projection([node.lon,node.lat]);
        return coords ? `translate(${coords[0]},${coords[1]})` : "translate(-999,-999)";
      });
    nodes.append("circle").attr("r", 4);
    nodes.append("text").attr("x", 7).attr("y", -6).text((node) => node.name);
    nodes.append("text").attr("class", "news-map-context-role").attr("x", 7).attr("y", 5).text((node) => node.role);
  }

  const point = projection([item.lon, item.lat]);
  if (point) {
    const marker = map.append("g").attr("class", "news-map-marker").attr("transform", `translate(${point[0]},${point[1]})`);
    marker.append("circle").attr("class", "news-map-range range-outer").attr("r", 62);
    marker.append("circle").attr("class", "news-map-range range-inner").attr("r", 31);
    marker.append("circle").attr("class", "news-map-pulse").attr("r", 12);
    marker.append("circle").attr("class", "news-map-core").attr("r", 4.5);
  }
  svg.append("text").attr("class", "news-map-north").attr("x", width - 22).attr("y", 25).text("N");
  byId("newsMapPlace").textContent = item.place;
  byId("newsMapScale").textContent = context?.layer || "Vista regional";
  const insight = byId("newsMapInsight");
  if (insight) insight.textContent = context?.insight || "La ubicación aporta contexto territorial a la noticia.";
}

function updateNewsPreferenceControls(item) {
  const preference = newsPreferences[item.id] || "";
  [["newsInterested","interested"],["newsNotInterested","not-interested"]].forEach(([id, value]) => {
    const button = byId(id);
    const active = preference === value;
    button?.classList.toggle("active", active);
    button?.setAttribute("aria-pressed", String(active));
  });
}

function setNewsPreference(value) {
  if (!currentNewsId) return;
  newsPreferences[currentNewsId] = newsPreferences[currentNewsId] === value ? "" : value;
  localStorage.setItem("atlas-news-preferences", JSON.stringify(newsPreferences));
  const item = atlasNews.find((news) => news.id === currentNewsId);
  if (item) updateNewsPreferenceControls(item);
}

function navigateNews(direction) {
  const items = currentNewsItems.length ? currentNewsItems : atlasNews;
  const index = items.findIndex((item) => item.id === currentNewsId);
  if (index < 0) return;
  openNewsDialog(items[(index + direction + items.length) % items.length], true);
}

function openNewsDialog(item, alreadyOpen = false) {
  const dialog = byId("newsDialog");
  if (!dialog || !item) return;
  currentNewsId = item.id;
  byId("newsDialogType").textContent = item.type;
  byId("newsDialogTitle").textContent = item.title;
  byId("newsDialogMeta").textContent = `${item.place} · hace ${item.age} h · relevancia OSINT ${item.relevance}/100`;
  byId("newsDialogSummary").textContent = item.summary;
  byId("newsDialogHashtags").innerHTML = item.hashtags.map((tag) => `<span>${tag}</span>`).join("");
  byId("newsDialogAnalysis").textContent = item.analysis || "Contexto editorial pendiente.";
  byId("newsDialogSource").textContent = `Profundizar en ${item.source} ↗`;
  byId("newsDialogSource").href = newsSourceUrl(item.sourceUrl);
  renderNewsMarketIndicators(item);
  updateNewsPreferenceControls(item);
  const available = (currentNewsItems.length ? currentNewsItems : atlasNews).length > 1;
  byId("newsPrevious").disabled = !available;
  byId("newsNext").disabled = !available;
  if (!alreadyOpen && !dialog.open) dialog.showModal();
  requestAnimationFrame(() => renderNewsContextMap(item));
}

byId("newsFeed")?.addEventListener("dblclick", (event) => {
  const card = event.target.closest("[data-news-id]");
  if (!card) return;
  openNewsDialog(atlasNews.find((item) => item.id === card.dataset.newsId));
});
byId("newsFeed")?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-news-id]");
  if (!card) return;
  event.preventDefault();
  openNewsDialog(atlasNews.find((item) => item.id === card.dataset.newsId));
});
byId("newsDialogClose")?.addEventListener("click", () => byId("newsDialog").close());
byId("newsInterested")?.addEventListener("click", () => setNewsPreference("interested"));
byId("newsNotInterested")?.addEventListener("click", () => setNewsPreference("not-interested"));
byId("newsPrevious")?.addEventListener("click", () => navigateNews(-1));
byId("newsNext")?.addEventListener("click", () => navigateNews(1));
byId("newsDialog")?.addEventListener("click", (event) => {
  if (event.target === byId("newsDialog")) byId("newsDialog").close();
});


function authInitial(email) {
  return (email || "A").trim().charAt(0).toUpperCase();
}

function renderAtlasAuth(session) {
  const user = session?.user || null;
  const signedOut = byId("authSignedOut");
  const signedIn = byId("authSignedIn");
  if (signedOut) signedOut.hidden = Boolean(user);
  if (signedIn) signedIn.hidden = !user;
  if (user) {
    const initial = authInitial(user.email);
    byId("authAvatar").textContent = initial;
    byId("authDialogAvatar").textContent = initial;
    byId("authButtonLabel").textContent = user.email?.split("@")[0] || "Mi cuenta";
    byId("authUserEmail").textContent = user.email || "Usuario autenticado";
    byId("authButton").classList.add("signed-in");
  } else {
    byId("authAvatar").textContent = "◎";
    byId("authButtonLabel").textContent = "Ingresar";
    byId("authButton").classList.remove("signed-in");
  }
}

async function initAtlasAuth() {
  if (!atlasSupabase) {
    byId("authStatus").textContent = "El servicio de identidad no está disponible.";
    return;
  }
  const { data, error } = await atlasSupabase.auth.getSession();
  renderAtlasAuth(data.session);
  if (atlasAuthCallbackPending) {
    atlasAuthCallbackPending = false;
    history.replaceState(null, "", "#map");
    if (error || !data.session) {
      const status = byId("authStatus");
      status.textContent = error
        ? `No se pudo completar el acceso: ${error.message}`
        : "El enlace no produjo una sesión válida. Solicita uno nuevo.";
      status.className = "auth-status error";
      byId("authDialog")?.showModal();
    }
  }
  atlasSupabase.auth.onAuthStateChange((event, session) => {
    renderAtlasAuth(session);
    if (event === "SIGNED_IN") {
      atlasAuthCallbackPending = false;
      history.replaceState(null, "", "#map");
      if (byId("authDialog")?.open) {
        byId("authStatus").textContent = "Sesión iniciada correctamente.";
        byId("authStatus").className = "auth-status success";
      }
    }
  });
}

byId("authButton")?.addEventListener("click", () => byId("authDialog")?.showModal());
byId("authDialogClose")?.addEventListener("click", () => byId("authDialog")?.close());
byId("authDialog")?.addEventListener("click", (event) => {
  if (event.target === byId("authDialog")) byId("authDialog").close();
});
byId("magicLinkForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!atlasSupabase) return;
  const email = byId("authEmail").value.trim();
  const submit = byId("magicLinkSubmit");
  const status = byId("authStatus");
  submit.disabled = true;
  submit.textContent = "Enviando…";
  status.textContent = "";
  const redirectTo = `${location.origin}${location.pathname}`;
  const { error } = await atlasSupabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
  });
  if (error) {
    status.textContent = `No se pudo enviar el enlace: ${error.message}`;
    status.className = "auth-status error";
  } else {
    status.textContent = "Enlace enviado. Revisa tu bandeja de entrada y spam.";
    status.className = "auth-status success";
  }
  submit.disabled = false;
  submit.textContent = "Enviar Magic Link";
});
byId("authSignOut")?.addEventListener("click", async () => {
  if (!atlasSupabase) return;
  const button = byId("authSignOut");
  button.disabled = true;
  button.textContent = "Cerrando…";
  const { error } = await atlasSupabase.auth.signOut({ scope:"global" });
  button.disabled = false;
  button.textContent = "Cerrar sesión";
  if (!error) {
    renderAtlasAuth(null);
    byId("authDialog")?.close();
  }
});
initAtlasAuth();

byId("atlasLocationForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = byId("atlasLocationInput");
  const status = byId("atlasLocationStatus");
  const query = input?.value.trim();
  if (!query) return;
  if (status) status.textContent = "Buscando ubicación…";
  try {
    const context = await resolveAtlasLocation(query);
    applyAtlasContext(context);
  } catch (error) {
    if (status) status.textContent = "No encontramos esa ubicación. Prueba con ciudad y país.";
  }
});
byId("detectAtlasLocation")?.addEventListener("click", detectAtlasLocation);

if (atlasContext) {
  applyAtlasContext(atlasContext, { suggestLanguage:false });
} else {
  const browserLanguage = navigator.language.split("-")[0];
  if ([...byId("languageSelect").options].some((option) => option.value === browserLanguage)) {
    state.language = browserLanguage;
    localStorage.setItem("atlas-language", state.language);
  }
  detectAtlasLocation();
}
