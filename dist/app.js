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
  layers: new Set(["routes", "rail"])
};
const byId = (id) => document.getElementById(id);
let atlasMap = null;
let fallbackSvg = null;
let fallbackZoom = null;

const strategicRoutes = [
  { type: "routes", label: "Eje occidental", coordinates: [[22.7, 48.6], [24.0, 49.8], [26.3, 50.6], [30.5, 50.4]] },
  { type: "routes", label: "Eje central", coordinates: [[30.5, 50.4], [32.1, 49.4], [35.0, 48.5], [36.2, 50.0]] },
  { type: "routes", label: "Eje meridional", coordinates: [[30.5, 50.4], [30.7, 48.5], [30.7, 46.5]] },
  { type: "rail", label: "Red ferroviaria oeste–este", coordinates: [[23.2, 49.6], [24.0, 49.8], [28.5, 49.2], [30.5, 50.4], [34.6, 49.6], [36.2, 50.0]] },
  { type: "rail", label: "Red ferroviaria centro–sur", coordinates: [[30.5, 50.4], [32.0, 48.5], [35.1, 48.5], [35.2, 47.8], [32.0, 47.0]] }
];

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
  byId("sourceCount").textContent = `${event.sources.length} fuentes`;
  byId("sourceList").innerHTML = event.sources.map(([name, type, label], index) => `<div class="source-item"><span class="source-num">${String(index + 1).padStart(2, "0")}</span><div><strong>${name}</strong><small>${type}</small></div><em>${label}</em></div>`).join("");
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
  fallbackZoom = d3.zoom().scaleExtent([1, 8]).on("zoom", (event) => viewport.attr("transform", event.transform));
  svg.call(fallbackZoom).on("dblclick.zoom", null);
  const projection = state.view === "theater"
    ? d3.geoMercator().center([35, 51]).scale(width * 2.25).translate([width / 2, height / 2])
    : d3.geoNaturalEarth1().scale(width / 6.35).translate([width / 2, height / 2]);
  const path = d3.geoPath(projection);
  viewport.append("path").datum(d3.geoGraticule10()).attr("class", "graticule").attr("d", path);

  const finish = () => {
    drawVectorStrategicLayers(viewport, projection);
    drawVectorFog(viewport, projection);
    drawVectorEvents(viewport, projection);
    syncMapLayers();
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

function drawVectorStrategicLayers(svg, projection) {
  const path = d3.geoPath(projection);
  ["routes", "rail"].forEach((type) => {
    const routes = strategicRoutes.filter((route) => route.type === type);
    const group = svg.append("g").attr("class", `map-layer layer-${type}`);
    group.selectAll("path").data(routes).join("path").attr("class", `strategic-route ${type}`)
      .attr("d", (route) => path({ type: "LineString", coordinates: route.coordinates }));
    if (type === "routes") {
      group.selectAll("text").data(routes).join("text").attr("class", "route-label")
        .attr("x", (route) => projection(route.coordinates[Math.floor(route.coordinates.length / 2)])[0])
        .attr("y", (route) => projection(route.coordinates[Math.floor(route.coordinates.length / 2)])[1] - 7).text((route) => route.label);
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

document.querySelectorAll(".advisor").forEach((button) => button.addEventListener("click", () => {
  const content = advisorContent[button.dataset.advisor];
  if (!content) return;
  document.querySelectorAll(".advisor").forEach((item) => item.classList.toggle("active", item === button));
  byId("advisorKicker").textContent = content.kicker;
  byId("advisorTitle").textContent = content.title;
  byId("advisorCopy").textContent = content.copy;
  byId("advisorSignal").textContent = content.signal;
}));

const dialog = byId("infoDialog");
[byId("methodButton"), byId("aboutButton"), byId("traceButton")].forEach((button) => button.addEventListener("click", () => dialog.showModal()));
byId("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
byId("closeIntel").addEventListener("click", () => byId("intelPanel").classList.toggle("collapsed"));
byId("turnButton").addEventListener("click", () => document.querySelector(".timeline-section").scrollIntoView({ behavior: "smooth" }));

renderTimeline();
renderIntel(events[0]);
createMap();
loadPublishedEvents();
window.addEventListener("resize", () => { clearTimeout(window.mapResizeTimer); window.mapResizeTimer = setTimeout(() => atlasMap?.resize(), 180); });
