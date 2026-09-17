const REGION = { lamin: 40, lomin: 15, lamax: 59, lomax: 46 };
const CACHE_SECONDS = 300;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=0, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=600`,
      "access-control-allow-origin": "*"
    },
    body: JSON.stringify(body)
  };
}

function quantize(value, step) {
  return Math.round(value / step) * step;
}

function aggregateAircraft(states = []) {
  const cells = new Map();
  states.forEach((state) => {
    const lon = Number(state?.[5]);
    const lat = Number(state?.[6]);
    const heading = Number(state?.[10]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || state?.[8] === true) return;

    // Deliberadamente impreciso: una celda cubre aproximadamente 100–150 km.
    const cellLon = quantize(lon, 1.5);
    const cellLat = quantize(lat, 1.25);
    const key = `${cellLon}:${cellLat}`;
    const cell = cells.get(key) || { lon: cellLon, lat: cellLat, count: 0, headings: [] };
    cell.count += 1;
    if (Number.isFinite(heading)) cell.headings.push(heading);
    cells.set(key, cell);
  });

  return [...cells.values()].slice(0, 80).map((cell) => ({
    ...cell,
    heading: cell.headings.length
      ? quantize(cell.headings.reduce((sum, value) => sum + value, 0) / cell.headings.length, 30)
      : 0,
    headings: undefined
  }));
}

async function openskyToken() {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const response = await fetch("https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret })
  });
  if (!response.ok) throw new Error(`OpenSky OAuth ${response.status}`);
  return (await response.json()).access_token;
}

async function loadAircraft() {
  const token = await openskyToken();
  if (!token) return { configured: false, contacts: [] };
  const query = new URLSearchParams(Object.fromEntries(Object.entries(REGION).map(([key, value]) => [key, String(value)])));
  const response = await fetch(`https://opensky-network.org/api/states/all?${query}`, {
    headers: { authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`OpenSky states ${response.status}`);
  const data = await response.json();
  return {
    configured: true,
    observedAt: data.time ? new Date(data.time * 1000).toISOString() : new Date().toISOString(),
    contacts: aggregateAircraft(data.states)
  };
}

export const handler = async () => {
  try {
    const aviation = await loadAircraft();
    return json(200, {
      mode: aviation.configured ? "aggregated-live" : "not-configured",
      precision: "regional-grid",
      refreshSeconds: CACHE_SECONDS,
      aviation,
      maritime: { configured: false, contacts: [], minimumDelayHours: 96 }
    });
  } catch (error) {
    console.error("ATLAS traffic feed:", error.message);
    return json(200, {
      mode: "temporarily-unavailable",
      precision: "regional-grid",
      refreshSeconds: CACHE_SECONDS,
      aviation: { configured: true, contacts: [] },
      maritime: { configured: false, contacts: [], minimumDelayHours: 96 }
    });
  }
};
