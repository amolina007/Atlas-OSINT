const instruments = ["^GSPC","^IXIC","^DJI","^STOXX50E","^FTSE","^GDAXI","^N225","000001.SS","^HSI","^IPSA","CL=F","GC=F","HG=F"];

async function quote(symbol) {
  const url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(symbol) + "?interval=1d&range=5d";
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 ATLAS-OSINT/1.0", Accept: "application/json" } });
  if (!response.ok) throw new Error("Quote request failed");
  const json = await response.json();
  const result = json?.chart?.result?.[0];
  const closes = (result?.indicators?.quote?.[0]?.close || []).filter(Number.isFinite);
  const current = Number(result?.meta?.regularMarketPrice ?? closes.at(-1));
  const previous = Number(result?.meta?.chartPreviousClose ?? closes.at(-2));
  return {
    symbol,
    price: Number.isFinite(current) ? current : null,
    changePercent: Number.isFinite(current) && Number.isFinite(previous) && previous !== 0
      ? ((current - previous) / previous) * 100
      : null
  };
}

exports.handler = async function () {
  const settled = await Promise.allSettled(instruments.map(quote));
  const items = settled.map((entry, index) => entry.status === "fulfilled"
    ? entry.value
    : { symbol: instruments[index], price: null, changePercent: null });
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=900",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({ items, updatedAt: new Date().toISOString(), source: "Yahoo Finance chart endpoint" })
  };
};
