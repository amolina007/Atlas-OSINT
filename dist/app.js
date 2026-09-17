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

const state = {
  kind: "all",
  selected: events[0].id,
  view: "theater",
  fog: true,
  conflict: ["russia-ukraine", "middle-east", "sudan"].includes(localStorage.getItem("atlas-conflict")) ? localStorage.getItem("atlas-conflict") : "russia-ukraine",
  perspective: localStorage.getItem("atlas-perspective") || "neutral",
  language: localStorage.getItem("atlas-language") || "es",
  layers: new Set(["control", "movements", "routes", "rail", "admin", "water", "terrain", "maritime", "aviation"])
};
const byId = (id) => document.getElementById(id);
let atlasMap = null;
let fallbackSvg = null;
let fallbackZoom = null;
let vectorZoomFrame = null;
let vectorDetailLevel = "";
let trafficProjection = null;
let trafficRefreshTimer = null;

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
  events = config.events;
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
  byId("conflictSelect").value = state.conflict;
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
  document.querySelector(".force-compare").hidden = state.conflict !== "russia-ukraine";
  byId("dataNotice").textContent = state.conflict === "russia-ukraine"
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
  byId("conflictLabel").textContent = copy.conflict;
  byId("conflictHelp").textContent = copy.conflictHelp;
  [...byId("conflictSelect").options].forEach((option) => {
    const optionConfig = theaterConfigs[option.value];
    if (optionConfig) option.textContent = localized(optionConfig.title);
  });
  byId("perspectiveLabel").textContent = copy.perspective;
  byId("perspectiveHelp").textContent = copy.perspectiveHelp;
  byId("languageLabel").textContent = copy.language;
  byId("languageHelp").textContent = copy.languageHelp;
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
  document.querySelectorAll(".event-marker, .timeline-card").forEach((node) => node.classList.toggle("selected", node.dataset.id === event.id));
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
  // MapLibre queda desactivado temporalmente: algunos navegadores mostraban
  // un lienzo WebGL negro aunque declararan compatibilidad. Priorizamos el
  // mapa vectorial probado hasta migrar la base OSM a un motor sin WebGL.
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
      maxZoom: 9,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
          }
        },
        layers: [
          { id: "atlas-background", type: "background", paint: { "background-color": "#07100d" } },
          {
            id: "osm-base",
            type: "raster",
            source: "osm",
            paint: {
              "raster-opacity": 0.42,
              "raster-saturation": -0.78,
              "raster-contrast": 0.22,
              "raster-brightness-max": 0.58
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
  const projection = state.view === "theater"
    ? d3.geoMercator().center(config.center).scale(width * config.scale).translate([width / 2, height / 2])
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
    drawVectorEvents(viewport, projection);
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
  group.selectAll("path").data(terrainBands).join("path")
    .attr("class", (band) => `terrain-band ${band.level}`)
    .attr("d", (band) => path({ type: "Polygon", coordinates: normalizedPolygon(band.coordinates) }));
  group.selectAll("text").data(terrainBands).join("text").attr("class", "terrain-label")
    .attr("x", (band) => projection(band.coordinates[0][Math.floor(band.coordinates[0].length / 2)])[0])
    .attr("y", (band) => projection(band.coordinates[0][Math.floor(band.coordinates[0].length / 2)])[1])
    .text((band) => band.label);
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
  group.selectAll("path").data(waterways).join("path").attr("class", "waterway")
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
  fallbackSvg.selectAll(".event-marker circle, .critical-zone circle, .capability-sector circle, .capability-sector path, .traffic-contact circle")
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
  document.querySelectorAll(".map-layer").forEach((layer) => {
    const name = [...layer.classList].find((className) => className.startsWith("layer-"))?.replace("layer-", "");
    layer.classList.toggle("hidden", !state.layers.has(name));
  });
  if (!atlasMap?.isStyleLoaded()) return;
  const ids = {
    routes: ["atlas-routes-line", "atlas-routes-label"], rail: ["atlas-rail-line"],
    energy: ["atlas-energy-halo", "atlas-energy-core"], civic: ["atlas-civic-halo", "atlas-civic-core"],
    communications: ["atlas-communications-halo", "atlas-communications-core"]
  };
  Object.entries(ids).forEach(([name, layerIds]) => {
    layerIds.forEach((id) => { if (atlasMap.getLayer(id)) atlasMap.setLayoutProperty(id, "visibility", state.layers.has(name) ? "visible" : "none"); });
  });
}

function changeMapZoom(direction) {
  if (atlasMap) direction > 0 ? atlasMap.zoomIn({ duration: 220 }) : atlasMap.zoomOut({ duration: 220 });
  else if (fallbackSvg && fallbackZoom) fallbackSvg.transition().duration(220).call(fallbackZoom.scaleBy, direction > 0 ? 1.5 : 1 / 1.5);
}

function resetMapZoom() {
  if (atlasMap) atlasMap.easeTo({ center: state.view === "theater" ? currentTheater().center : [20, 30], zoom: state.view === "theater" ? 4.65 : 1.15, bearing: 0, pitch: 0, duration: 300 });
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
  document.querySelectorAll(".event-marker").forEach((node) => node.classList.toggle("selected", node.dataset.id === state.selected));
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
    sources: []
  };
}

async function loadPublishedEvents() {
  if (!window.supabase?.createClient || !window.ATLAS_SUPABASE) return;

  const client = window.supabase.createClient(
    window.ATLAS_SUPABASE.url,
    window.ATLAS_SUPABASE.publishableKey,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
  const { data, error } = await client
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

  events = published;
  state.selected = events[0].id;
  byId("dataNotice").textContent = `Supabase conectado · ${events.length} eventos publicados · Posiciones aproximadas.`;
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
  loadPublishedEvents();
});
byId("languageSelect").addEventListener("change", (event) => {
  state.language = event.target.value;
  localStorage.setItem("atlas-language", state.language);
  applyAnalysisContext();
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
byId("turnButton").addEventListener("click", () => document.querySelector(".timeline-section").scrollIntoView({ behavior: "smooth" }));

applyTheaterData();
applyAnalysisContext();
renderTimeline();
renderIntel(events[0]);
createMap();
loadPublishedEvents();
window.addEventListener("resize", () => { clearTimeout(window.mapResizeTimer); window.mapResizeTimer = setTimeout(() => atlasMap?.resize(), 180); });
