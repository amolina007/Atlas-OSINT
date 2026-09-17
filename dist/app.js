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

let events = demoEvents;

const state = {
  kind: "all",
  selected: events[0].id,
  view: "theater",
  fog: true,
  conflict: "russia-ukraine",
  perspective: localStorage.getItem("atlas-perspective") || "neutral",
  language: localStorage.getItem("atlas-language") || "es",
  layers: new Set(["control", "movements", "routes", "rail", "admin", "water", "terrain", "maritime", "aviation"])
};
const byId = (id) => document.getElementById(id);
let atlasMap = null;
let fallbackSvg = null;
let fallbackZoom = null;

const strategicRoutes = [
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

const controlZones = [
  { actor: "ru", label: "Control ruso reportado · este", coordinates: [[[37.0, 51.1], [40.1, 50.9], [40.3, 46.9], [37.2, 46.8], [36.3, 47.5], [37.0, 49.0], [37.0, 51.1]]] },
  { actor: "ru", label: "Control ruso reportado · sur", coordinates: [[[32.4, 46.2], [36.8, 46.3], [37.3, 47.4], [35.8, 47.6], [33.4, 47.1], [32.4, 46.2]]] },
  { actor: "ru", label: "Crimea ocupada", coordinates: [[[32.4, 46.2], [33.1, 45.2], [35.2, 44.4], [36.7, 45.0], [36.1, 45.8], [34.4, 46.2], [32.4, 46.2]]] }
];

const frontLine = [[36.8, 51.0], [37.1, 50.2], [37.7, 49.4], [37.7, 48.4], [36.9, 47.7], [35.8, 47.4], [34.4, 47.1], [33.2, 46.8]];

const movementArrows = [
  { actor: "ru", phase: "2022 · eje norte", coordinates: [[31.0, 53.0], [30.7, 51.8], [30.5, 50.7]] },
  { actor: "ru", phase: "2022–26 · presión oriental", coordinates: [[40.0, 49.8], [38.7, 49.5], [37.7, 49.2]] },
  { actor: "ru", phase: "2022 · eje meridional", coordinates: [[34.4, 45.3], [34.7, 46.4], [35.4, 47.1]] },
  { actor: "ua", phase: "2022 · recuperación noreste", coordinates: [[35.8, 49.4], [37.0, 49.8], [37.7, 50.2]] },
  { actor: "ua", phase: "2022 · recuperación oeste del Dnipró", coordinates: [[32.6, 47.1], [32.1, 46.8], [31.6, 46.7]] }
];

const waterways = [
  { label: "Dnipró", coordinates: [[32.6, 52.3], [30.5, 50.4], [32.0, 49.0], [34.6, 48.5], [35.2, 47.8], [33.4, 46.6]] },
  { label: "Dniéster", coordinates: [[24.0, 49.5], [26.1, 48.7], [28.8, 47.0], [30.2, 46.3]] },
  { label: "Bug Meridional", coordinates: [[27.0, 49.5], [29.3, 48.2], [31.9, 46.9]] },
  { label: "Donets", coordinates: [[36.0, 50.2], [37.5, 49.3], [39.4, 48.6]] }
];

const administrativeLines = [
  [[24.8, 51.4], [25.6, 48.9], [26.0, 47.8]], [[27.7, 52.0], [28.4, 49.8], [28.7, 47.4]],
  [[31.0, 52.2], [31.4, 49.4], [31.8, 46.7]], [[34.2, 51.3], [34.4, 49.0], [34.8, 46.6]],
  [[37.0, 50.8], [36.7, 48.5], [36.2, 46.7]], [[23.0, 49.2], [38.8, 49.1]],
  [[24.0, 50.6], [37.8, 50.5]], [[25.0, 47.8], [37.0, 47.8]]
];

const terrainBands = [
  { level: "high", label: "Cárpatos", coordinates: [[[22.2, 47.7], [24.8, 47.9], [26.0, 49.2], [24.3, 50.0], [22.2, 49.2], [22.2, 47.7]]] },
  { level: "mid", label: "Altiplano central", coordinates: [[[27.0, 48.0], [33.5, 48.0], [34.5, 50.0], [30.0, 51.2], [27.0, 50.0], [27.0, 48.0]]] },
  { level: "mid", label: "Altos del Donets", coordinates: [[[35.2, 47.3], [39.2, 47.3], [39.6, 49.8], [36.7, 50.1], [35.2, 47.3]]] }
];

const maritimeCorridors = [
  { label: "Corredor civil del mar Negro", coordinates: [[30.7, 46.5], [29.9, 44.8], [28.9, 43.2], [29.0, 41.2]] },
  { label: "Constanța–Bósforo", coordinates: [[28.7, 44.2], [29.1, 42.8], [29.0, 41.2]] },
  { label: "Ruta caucásica", coordinates: [[29.0, 41.2], [33.5, 42.0], [38.7, 43.0]] }
];

const aviationCorridors = [
  { label: "Corredor civil norte", coordinates: [[20.9, 52.2], [23.0, 51.8], [26.1, 50.9], [28.8, 47.0]] },
  { label: "Corredor civil occidental", coordinates: [[20.9, 52.2], [21.3, 49.9], [26.1, 47.0], [29.0, 41.2]] },
  { label: "Corredor civil mar Negro", coordinates: [[28.8, 47.0], [28.7, 44.2], [29.0, 41.2]] }
];

const knownCapabilitySectors = [
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

const infrastructureZones = [
  { type: "energy", coordinates: [24.8, 49.6] }, { type: "energy", coordinates: [30.4, 50.1] },
  { type: "energy", coordinates: [34.8, 48.5] }, { type: "energy", coordinates: [31.5, 47.1] },
  { type: "civic", coordinates: [24.1, 49.8] }, { type: "civic", coordinates: [30.5, 50.4] },
  { type: "civic", coordinates: [35.0, 48.5] }, { type: "civic", coordinates: [36.2, 50.0] },
  { type: "communications", coordinates: [25.8, 50.3] }, { type: "communications", coordinates: [30.7, 49.0] },
  { type: "communications", coordinates: [34.3, 49.5] }, { type: "communications", coordinates: [32.0, 47.0] }
];

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

function hasActorSource(event, actor) {
  const terms = actor === "russian" ? /rusi|mosc|kremlin|russian/i : /ucrani|kyiv|ukrain/i;
  return event.sources.some(([name]) => terms.test(name));
}

function applyAnalysisContext() {
  const copy = interfaceCopy[state.language] || interfaceCopy.es;
  const lens = perspectiveCopy[state.language] || perspectiveCopy.es;
  const currentLens = lens[state.perspective] || lens.neutral;
  document.documentElement.lang = state.language;
  byId("languageSelect").value = state.language;
  byId("conflictLabel").textContent = copy.conflict;
  byId("conflictHelp").textContent = copy.conflictHelp;
  byId("conflictSelect").options[0].textContent = copy.conflictName;
  byId("conflictSelect").options[1].textContent = copy.future;
  byId("perspectiveLabel").textContent = copy.perspective;
  byId("perspectiveHelp").textContent = copy.perspectiveHelp;
  byId("languageLabel").textContent = copy.language;
  byId("languageHelp").textContent = copy.languageHelp;
  const perspectiveButtons = [...document.querySelectorAll("[data-perspective]")];
  perspectiveButtons[0].textContent = copy.neutralButton;
  perspectiveButtons[1].textContent = copy.russianButton;
  perspectiveButtons[2].textContent = copy.ukrainianButton;
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
  byId("theaterLabel").textContent = copy.theater;
  byId("briefing-title").textContent = copy.title;
  byId("briefingLede").textContent = copy.lede;
  document.title = `${copy.title} · ATLAS OSINT`;
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
  const actorPattern = state.perspective === "russian" ? /rusi|mosc|kremlin|russian/i : /ucrani|kyiv|ukrain/i;
  const sortedSources = state.perspective === "neutral" ? [...event.sources] : [...event.sources].sort((a, b) => Number(actorPattern.test(b[0])) - Number(actorPattern.test(a[0])));
  const missingActorSource = state.perspective !== "neutral" && !hasActorSource(event, state.perspective);
  const languageCopy = interfaceCopy[state.language] || interfaceCopy.es;
  byId("sourceCount").textContent = `${event.sources.length} fuentes`;
  byId("sourceList").innerHTML = sortedSources.map(([name, type, label], index) => `<div class="source-item"><span class="source-num">${String(index + 1).padStart(2, "0")}</span><div><strong>${name}</strong><small>${type}</small></div><em>${label}</em></div>`).join("")
    + (missingActorSource ? `<div class="source-item source-gap"><span class="source-num">!</span><div><strong>${state.perspective === "russian" ? "RU" : "UA"}</strong><small>${state.perspective === "russian" ? languageCopy.sourceGapRussian : languageCopy.sourceGapUkrainian}</small></div><em>GAP</em></div>` : "");
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
    updateVectorDetail(event.transform.k);
    updateVectorTextScale(event.transform.k);
  });
  svg.call(fallbackZoom).on("dblclick.zoom", null);
  const projection = state.view === "theater"
    ? d3.geoMercator().center([35, 51]).scale(width * 2.25).translate([width / 2, height / 2])
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
  };
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world) => {
    const countries = topojson.feature(world, world.objects.countries).features;
    viewport.insert("g", ":first-child").selectAll("path").data(countries).join("path")
      .attr("class", (country) => `country${String(country.id) === "804" ? " focus-ua" : ""}${String(country.id) === "643" ? " focus-ru" : ""}`).attr("d", path);
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
  group.append("path").datum({ type: "LineString", coordinates: frontLine }).attr("class", "front-buffer").attr("d", path);
  group.append("path").datum({ type: "LineString", coordinates: frontLine }).attr("class", "front-line").attr("d", path);
  const uaLabel = projection([29.0, 50.4]);
  const ruLabel = projection([39.0, 48.0]);
  if (uaLabel) group.append("text").attr("class", "control-label ua").attr("x", uaLabel[0]).attr("y", uaLabel[1]).text("CONTROL UCRANIANO");
  if (ruLabel) group.append("text").attr("class", "control-label ru").attr("x", ruLabel[0]).attr("y", ruLabel[1]).text("CONTROL RUSO · APROX.");
}

function drawVectorAdministrative(svg, projection) {
  const path = d3.geoPath(projection);
  const group = svg.append("g").attr("class", "map-layer layer-admin");
  group.append("g").attr("class", "admin-schematic").selectAll("path").data(administrativeLines).join("path")
    .attr("class", "admin-line admin-line-schematic").attr("d", (coordinates) => path({ type: "LineString", coordinates }));

  Promise.all([
    d3.json("./data/ukraine-oblasts.geojson"),
    d3.json("./data/ukraine-districts.geojson")
  ]).then(([oblasts, districts]) => {
    group.select(".admin-schematic").remove();
    group.append("g").attr("class", "admin-oblasts zoom-regional").selectAll("path")
      .data(oblasts.features).join("path")
      .attr("class", "admin-line admin-line-oblast")
      .attr("d", path);
    group.append("g").attr("class", "admin-districts zoom-detail").selectAll("path")
      .data(districts.features).join("path")
      .attr("class", "admin-line admin-line-district")
      .attr("d", path);
    group.append("g").attr("class", "admin-labels zoom-regional").selectAll("text")
      .data(oblasts.features).join("text")
      .attr("class", "admin-label")
      .attr("x", (feature) => path.centroid(feature)[0])
      .attr("y", (feature) => path.centroid(feature)[1])
      .text((feature) => feature.properties.shapeName.replace(/ Oblast$/i, ""));
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
  });
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
  document.querySelectorAll(".zoom-regional").forEach((node) => node.classList.toggle("zoom-visible", regional));
  document.querySelectorAll(".zoom-detail").forEach((node) => node.classList.toggle("zoom-visible", detailed));
  const status = byId("zoomDetailState");
  if (status) status.textContent = detailed ? "DETALLE · RAIONES" : regional ? "DETALLE · ÓBLASTS" : "DETALLE · TEATRO";
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
  [[27,54,60],[43,48,80],[45,56,68],[25,47,50]].forEach(([lon, lat, radius]) => {
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
  if (atlasMap) atlasMap.easeTo({ center: state.view === "theater" ? [31.5, 49.1] : [20, 30], zoom: state.view === "theater" ? 4.65 : 1.15, bearing: 0, pitch: 0, duration: 300 });
  else if (fallbackSvg && fallbackZoom) fallbackSvg.transition().duration(260).call(fallbackZoom.transform, d3.zoomIdentity);
}

function addFogLayer() {
  atlasMap.addSource("atlas-fog", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [[27,54],[43,48],[45,56],[25,47]].map((coordinates) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates } })) }
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

applyAnalysisContext();
renderTimeline();
renderIntel(events[0]);
createMap();
loadPublishedEvents();
window.addEventListener("resize", () => { clearTimeout(window.mapResizeTimer); window.mapResizeTimer = setTimeout(() => atlasMap?.resize(), 180); });
