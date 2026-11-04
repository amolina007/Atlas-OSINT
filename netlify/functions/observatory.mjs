export const sources = [
  { id: 'usgs', name: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson', docs: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php', scope: 'Sismos de magnitud ≥ 2,5 · últimos 7 días' },
  { id: 'nasa', name: 'NASA EONET', url: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=all&days=30&limit=100', docs: 'https://eonet.gsfc.nasa.gov/docs/v3', scope: 'Eventos naturales · últimos 30 días · hasta 100 eventos' }
];
export const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
export function normalize(id, data) {
  if (!(id === 'usgs' ? Array.isArray(data.features) : Array.isArray(data.events))) throw Error('Formato de fuente no válido');
  const rows = id === 'usgs' ? data.features.map(f => ({ id: `usgs:${f.id}`, title: f.properties?.title, date: f.properties?.time, coordinates: f.geometry?.coordinates, url: safeUrl(f.properties?.url), source: 'USGS', provider: id, category: 'Sismos', detail: `Magnitud ${f.properties?.mag ?? 'no disponible'} · Profundidad ${f.geometry?.coordinates?.[2] ?? 'no disponible'} km. Estado del registro: ${f.properties?.status || 'no informado'}.`, links: [] })) : data.events.map(e => {
    const g = [...(e.geometry || [])].filter(x => x.type === 'Point').sort((a,b) => Date.parse(b.date)-Date.parse(a.date))[0];
    return { id: `nasa:${e.id}`, title: e.title, date: g?.date, coordinates: g?.coordinates, url: safeUrl(e.link), source: 'NASA EONET', provider: id, category: e.categories?.[0]?.title || 'Evento natural', detail: `${e.description || 'Metadatos de un evento natural catalogado por EONET.'} Se muestra la última posición puntual disponible; no representa el área afectada.`, links: (e.sources || []).map(s => ({ name: s.id, url: safeUrl(s.url) })).filter(s => s.url) };
  });
  return rows.filter(r => r.id && r.title && r.url && Number.isFinite(new Date(r.date).getTime()) && Array.isArray(r.coordinates) && Number.isFinite(r.coordinates[0]) && Number.isFinite(r.coordinates[1]) && Math.abs(r.coordinates[0])<=180 && Math.abs(r.coordinates[1])<=90).map(r => ({ ...r, date: new Date(r.date).toISOString(), coordinates: r.coordinates.slice(0,2) }));
}
let cache;
export async function collect(fetcher = fetch) {
  const results = await Promise.all(sources.map(async s => {
    const checkedAt = new Date().toISOString();
    try {
      const res = await fetcher(s.url, { signal: AbortSignal.timeout(12000), headers: { Accept: 'application/json' } });
      if (!res.ok) throw Error(`HTTP ${res.status}`);
      const events = normalize(s.id, await res.json());
      return { ...s, checkedAt, status: 'ok', count: events.length, events };
    } catch (e) { return { ...s, checkedAt, status: 'error', error: e.name === 'TimeoutError' ? 'Tiempo de espera agotado' : 'Fuente temporalmente no disponible', count: 0, events: [] }; }
  }));
  return { fetchedAt: new Date().toISOString(), events: results.flatMap(s => s.events).sort((a,b) => b.date.localeCompare(a.date)), sources: results.map(({ events, ...s }) => s) };
}
export async function handler() {
  if (!cache || Date.now()-cache.time > 300000) cache = { time: Date.now(), data: await collect() };
  return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }, body: JSON.stringify(cache.data) };
}
