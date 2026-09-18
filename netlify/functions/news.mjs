const categoryRules = [
  ["security", /seguridad|polic[ií]a|delito|crimen|emergencia|incendio|terremoto|ataque|guerra|militar|defensa|víctima|victima/i],
  ["economy", /econom[ií]a|mercado|bolsa|d[oó]lar|inflaci[oó]n|banco|empresa|empleo|precio|inversi[oó]n|cobre|petr[oó]leo/i],
  ["technology", /tecnolog[ií]a|inteligencia artificial|\bIA\b|ciber|software|internet|datos|chip|robot|telecom/i],
  ["resources", /clima|energ[ií]a|agua|miner[ií]a|minero|sequ[ií]a|lluvia|ambiente|agricultura|recurso/i],
  ["health", /salud|hospital|enfermedad|virus|vacuna|medicina|educaci[oó]n|sociedad|vivienda/i],
  ["infrastructure", /puerto|carretera|metro|tren|aeropuerto|transporte|infraestructura|log[ií]stica|obra/i],
  ["geopolitics", /ucrania|rusia|china|estados unidos|israel|gaza|ir[aá]n|otan|onu|diplomacia|sanci[oó]n/i]
];

const decodeXml = (value = "") => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const clean = (value = "") => decodeXml(decodeXml(value))
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const tag = (xml, name) => {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return clean(match?.[1] || "");
};

const sourceTag = (xml) => {
  const match = xml.match(/<source(?:\s+url="([^"]*)")?>([\s\S]*?)<\/source>/i);
  return { url:decodeXml(match?.[1] || ""), name:clean(match?.[2] || "Fuente periodística") };
};

const classify = (text) => categoryRules.find(([, pattern]) => pattern.test(text))?.[0] || "territory";
const nonNewsPattern = /\b(trainee|oferta(?:s)? de empleo|bolsa de trabajo|vacante|postula|postulaci[oó]n|descuento|cup[oó]n|promoci[oó]n comercial|hor[oó]scopo|revisi[oó]n profesional prioritaria|recomendaci[oó]n autom[aá]tica|herramienta en desarrollo|consultar con tu profesional)\b/i;
const cleanTitle = (title, source) => title.replace(new RegExp(`\\s+-\\s+${source.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*$`,"i"),"").trim();
const genericMetaPattern = /google news|javascript|cookies|navegador|browser|sign in|iniciar sesi[oó]n|página no disponible/i;

const tweetLength = (text, limit = 280) => {
  const normalized = clean(text).replace(/\s+([,.;:!?])/g,"$1");
  if (normalized.length <= limit) return normalized;
  const sentence = normalized.slice(0,limit + 1).match(/^(.{120,279}[.!?])(?:\s|$)/)?.[1];
  if (sentence) return sentence;
  const clipped = normalized.slice(0,limit - 1);
  return `${clipped.slice(0,Math.max(clipped.lastIndexOf(" "),180)).trimEnd()}…`;
};

const informativeSummary = ({ extracted, rssText, title, source, publishedAt }) => {
  const headlineKey = clean(title).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,"");
  const candidates = [extracted,rssText]
    .map(clean)
    .filter((text) => text && !genericMetaPattern.test(text) && text.toLocaleLowerCase() !== title.toLocaleLowerCase())
    .filter((text) => {
      const withoutAttribution = text.replace(title,"").replace(source,"").replace(/[^\p{L}\p{N}]+/gu,"");
      const textKey = text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,"");
      return withoutAttribution.length >= 55 && textKey !== headlineKey;
    })
    .filter((text) => text.length >= Math.min(90,title.length + 25));
  if (candidates[0]) return tweetLength(candidates[0]);
  const date = Number.isFinite(Date.parse(publishedAt))
    ? new Intl.DateTimeFormat("es",{ day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"UTC" }).format(new Date(publishedAt)) + " UTC"
    : "hoy";
  return tweetLength(`Según ${source}, ${title.replace(/[.!?]+$/g,"")}. La información fue publicada ${date}; abre el enlace del medio para consultar sus antecedentes y actualizaciones.`);
};

const extractMeta = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(url, { signal:controller.signal, headers:{ "User-Agent":"AtlasOSINT/1.0" } });
    if (!response.ok) return "";
    const html = (await response.text()).slice(0, 250000);
    const candidates = [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
    ];
    return clean(candidates.map((pattern) => html.match(pattern)?.[1] || "").find(Boolean) || "");
  } catch { return ""; } finally { clearTimeout(timer); }
};

const feedUrl = (query, language, country) => {
  const languageMap = { es:"es-419", pt:"pt-BR", zh:"zh-CN" };
  const hl = languageMap[language] || language || "en";
  const gl = /^[A-Z]{2}$/.test(country) ? country : "US";
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(hl)}&gl=${gl}&ceid=${gl}:${encodeURIComponent(hl)}`;
};

const parseFeed = (xml) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
  const item = match[1];
  return { title:tag(item,"title"), url:tag(item,"link"), publishedAt:tag(item,"pubDate"), rssDescription:tag(item,"description"), source:sourceTag(item) };
});

export default async (req) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status:405 });
  const url = new URL(req.url);
  const location = (url.searchParams.get("location") || "Chile").slice(0,100);
  const country = (url.searchParams.get("country") || "CL").toUpperCase().slice(0,2);
  const language = (url.searchParams.get("language") || "es").toLowerCase().slice(0,5);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const queries = [
    `"${location}" when:3d`,
    `"${location.split(",").pop()?.trim() || country}" (economía OR seguridad OR tecnología OR salud OR infraestructura) when:3d`,
    "(geopolitics OR economy OR technology OR climate OR security) when:1d"
  ];

  try {
    const feeds = await Promise.all(queries.map(async (query) => {
      const response = await fetch(feedUrl(query,language,country), { headers:{ Accept:"application/rss+xml" } });
      if (!response.ok) throw new Error(`Google News ${response.status}`);
      return parseFeed(await response.text());
    }));
    const unique = new Map();
    feeds.flat().forEach((article) => {
      const key = article.title.toLocaleLowerCase();
      if (article.title && article.url && !unique.has(key)) unique.set(key,article);
    });
    const base = [...unique.values()]
      .filter((article) => !nonNewsPattern.test(article.title))
      .slice(0,18);
    const descriptions = await Promise.all(base.slice(0,12).map((article) => extractMeta(article.url)));
    const now = Date.now();
    const articles = base.map((article,index) => {
      const published = Date.parse(article.publishedAt);
      const age = Number.isFinite(published) ? Math.max(0,Math.round((now-published)/3600000)) : 0;
      const title = cleanTitle(article.title, article.source.name);
      const extracted = clean(descriptions[index] || "");
      const rssText = clean(article.rssDescription || "");
      const summary = informativeSummary({ extracted, rssText, title, source:article.source.name, publishedAt:article.publishedAt });
      const category = classify(`${title} ${summary}`);
      return {
        id:`LIVE-${index}-${Math.abs([...title].reduce((hash,char) => ((hash<<5)-hash)+char.charCodeAt(0),0))}`,
        title,
        place:location,
        lat:Number.isFinite(lat) ? lat : 0,
        lon:Number.isFinite(lon) ? lon : 0,
        category, type:"NOTICIA", age, relevance:Math.max(55,94-index*2),
        summary,
        analysis:"Titular y descripción procedentes del medio enlazado. Atlas no sustituye la lectura de la publicación original ni confirma de manera independiente todas sus afirmaciones.",
        hashtags:[`#${category}`,`#${country}`,"#Actualidad"],
        source:article.source.name, sourceUrl:article.url, publishedAt:article.publishedAt, live:true
      };
    }).filter((article) => !nonNewsPattern.test(`${article.title} ${article.summary}`));
    return Response.json({ articles, updatedAt:new Date().toISOString(), location }, { headers:{ "Cache-Control":"public, max-age=300, stale-while-revalidate=900" } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "News feed unavailable" }, { status:502 });
  }
};

export const config = { path:"/api/news", method:["GET"] };
