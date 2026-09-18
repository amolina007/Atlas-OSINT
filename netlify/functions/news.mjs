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
const genericSentencePattern = /haz clic|revisa ac[aá]|conoce aqu[ií]|mantente informado|abre el enlace|consulta (?:el|la|los)|en esta nota/i;

const tweetLength = (text, limit = 280) => {
  const normalized = clean(text).replace(/\s+([,.;:!?])/g,"$1");
  if (normalized.length <= limit) return normalized;
  const sentence = normalized.slice(0,limit + 1).match(/^(.{120,279}[.!?])(?:\s|$)/)?.[1];
  if (sentence) return sentence;
  const clipped = normalized.slice(0,limit - 1);
  return `${clipped.slice(0,Math.max(clipped.lastIndexOf(" "),180)).trimEnd()}…`;
};

const articleSentences = (text) => clean(text)
  .replace(/-?\s*Revisa los movimientos del marcador:\s*/gi,"")
  .replace(/(\d)\.(\d)/g,"$1§DECIMAL§$2")
  .match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.replace(/§DECIMAL§/g,".").trim()) || [];

const informativeSummary = ({ body, extracted, title }) => {
  const titleWords = new Set(clean(title).toLocaleLowerCase().match(/[\p{L}\p{N}]{4,}/gu) || []);
  const sentences = articleSentences(body || extracted)
    .filter((sentence) => sentence.length >= 35 && sentence.length <= 360 && !genericSentencePattern.test(sentence));
  const ranked = sentences.map((sentence,index) => {
    const words = sentence.toLocaleLowerCase().match(/[\p{L}\p{N}]{4,}/gu) || [];
    const overlap = words.filter((word) => titleWords.has(word)).length;
    const facts = (sentence.match(/\b\d+(?:[.,]\d+)?\b/g) || []).length;
    const entities = (sentence.match(/\b[A-ZÁÉÍÓÚÑ][\p{L}ÁÉÍÓÚÑáéíóúñ-]+/gu) || []).length;
    return { sentence, index, score:overlap * 2 + Math.min(facts,3) * 2 + Math.min(entities,3) - index * .08 };
  }).sort((a,b) => b.score-a.score);
  if (!ranked.length) return "";
  const selected = [];
  for (const candidate of ranked) {
    const next = [...selected,candidate].sort((a,b) => a.index-b.index).map((item) => item.sentence).join(" ");
    if (next.length <= 280) selected.push(candidate);
    if (selected.length === 2) break;
  }
  return tweetLength(selected.sort((a,b) => a.index-b.index).map((item) => item.sentence).join(" ") || ranked[0].sentence);
};

const fetchText = async (url, options = {}, timeout = 7000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(),timeout);
  try {
    const response = await fetch(url,{ ...options, signal:controller.signal });
    if (!response.ok) return "";
    return await response.text();
  } catch { return ""; } finally { clearTimeout(timer); }
};

const decodeGoogleNewsUrl = async (sourceUrl) => {
  try {
    const parsed = new URL(sourceUrl);
    const id = parsed.pathname.split("/").filter(Boolean).pop();
    if (parsed.hostname !== "news.google.com" || !id) return sourceUrl;
    const html = await fetchText(`https://news.google.com/rss/articles/${id}`,{ headers:{ "User-Agent":"Mozilla/5.0", Accept:"text/html" } },9000);
    const attrs = html.match(/data-n-a-ts="([^"]+)"[^>]+data-n-a-sg="([^"]+)"/)
      || html.match(/data-n-a-sg="([^"]+)"[^>]+data-n-a-ts="([^"]+)"/);
    if (!attrs) return sourceUrl;
    const timestamp = attrs[0].includes("data-n-a-ts") && attrs[0].indexOf("data-n-a-ts") < attrs[0].indexOf("data-n-a-sg") ? attrs[1] : attrs[2];
    const signature = timestamp === attrs[1] ? attrs[2] : attrs[1];
    const payload = ["Fbv4je",`[\"garturlreq\",[[\"X\",\"X\",[\"X\",\"X\"],null,null,1,1,\"US:en\",null,1,null,null,null,null,null,0,1],\"X\",\"X\",1,[1,1,1],1,1,null,0,0,null,0],\"${id}\",${timestamp},\"${signature}\"]`];
    const response = await fetchText("https://news.google.com/_/DotsSplashUi/data/batchexecute",{
      method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8", "User-Agent":"Mozilla/5.0", Origin:"https://news.google.com", Referer:"https://news.google.com/" },
      body:`f.req=${encodeURIComponent(JSON.stringify([[payload]]))}`
    },12000);
    const data = JSON.parse(response.split("\n\n")[1] || "[]");
    const batch = data.find((entry) => ["wrb.fr","w779db"].includes(entry[0]) && entry[1] === "Fbv4je");
    return batch ? JSON.parse(batch[2])[1] : sourceUrl;
  } catch { return sourceUrl; }
};

const extractArticle = async (googleUrl) => {
  const url = await decodeGoogleNewsUrl(googleUrl);
  if (url === googleUrl) return { url, description:"", body:"" };
  const html = await fetchText(url,{ headers:{ "User-Agent":"AtlasOSINT/1.0 (+https://atlas-osint.netlify.app)", Accept:"text/html" } },9000);
  const metaPatterns = [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i
  ];
  const encodedBody = html.match(/"articleBody"\s*:\s*"((?:\\.|[^"\\])*)"/i)?.[1] || "";
  let body = "";
  try { body = clean(JSON.parse(`"${encodedBody}"`)); } catch {}
  const description = clean(metaPatterns.map((pattern) => html.match(pattern)?.[1] || "").find(Boolean) || "");
  return { url, description, body };
};

const mapWithConcurrency = async (items, concurrency, mapper) => {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length:Math.min(concurrency,items.length) },async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index],index);
      await new Promise((resolve) => setTimeout(resolve,250));
    }
  });
  await Promise.all(workers);
  return results;
};

const contextualLimit = ({ category, title, summary, source }) => {
  const text = `${title} ${summary}`;
  if (/sismo|temblor|terremoto/i.test(text)) return "Contexto: registro sísmico sujeto a actualización del organismo técnico. Límite: una publicación no confirma por sí sola daños ni percepción en cada comuna.";
  if (/en vivo|marcador|segundo tiempo|minuto a minuto/i.test(text)) return "Contexto: competencia en desarrollo al momento de publicación. Límite: el marcador y las incidencias pueden haber cambiado después de esta actualización.";
  if (/partido|copa|juegos|medalla|golf|selecci[oó]n|capit[aá]n/i.test(text)) return "Contexto: información deportiva sobre resultados, preparación o participación. Límite: nóminas, horarios y resultados deben contrastarse con la organización oficial.";
  if (/clima|lluvia|temperatura|pron[oó]stico/i.test(text)) return "Contexto: pronóstico meteorológico. Límite: la previsión cambia por comuna y horizonte temporal; debe contrastarse con el servicio meteorológico oficial.";
  if (/ministro|presidente|diputad|senador|asever[oó]|declar[oó]|llam[oó]/i.test(text)) return "Contexto: declaración de una autoridad o actor político. Límite: una declaración atribuida expresa una posición y no demuestra por sí sola su cumplimiento o impacto.";
  if (/congreso|legislador|proyecto de ley|votaci[oó]n|desclasificar/i.test(text)) return "Contexto: iniciativa legislativa o institucional todavía sujeta a tramitación. Límite: apoyo anunciado no equivale a aprobación ni ejecución definitiva.";
  if (/\[video\]|video|redes sociales|se luci[oó]|celebr/i.test(text)) return "Contexto: pieza audiovisual o publicación social recogida por el medio. Límite: describe una escena puntual y no necesariamente un acontecimiento de relevancia pública sostenida.";
  if (category === "economy") return "Contexto: señal económica vinculada al territorio seleccionado. Límite: un movimiento aislado no demuestra causalidad ni constituye recomendación financiera.";
  if (category === "geopolitics" || category === "security") return "Contexto: información sensible a atribución y evolución rápida. Límite: deben separarse hechos corroborados, declaraciones de actores e inferencias.";
  return `Contexto: ${title.slice(0,120)}. Límite: síntesis de una publicación de ${source}; faltan corroboraciones adicionales para tratarla como un hecho verificado por Atlas.`;
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

const parseDirectFeed = (xml, sourceName) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
  const item = match[1];
  return {
    title:tag(item,"title"), url:tag(item,"link"), publishedAt:tag(item,"pubDate"),
    rssDescription:tag(item,"description"), source:{ name:sourceName, url:"" }, direct:true
  };
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
    const [feeds,localArticles] = await Promise.all([Promise.all(queries.map(async (query) => {
      const response = await fetch(feedUrl(query,language,country), { headers:{ Accept:"application/rss+xml" } });
      if (!response.ok) throw new Error(`Google News ${response.status}`);
      return parseFeed(await response.text());
    })),country === "CL" ? (async () => {
      const response = await fetch("https://www.cooperativa.cl/noticias/site/tax/port/all/rss____1.xml",{ headers:{ Accept:"application/rss+xml" } });
      return response.ok ? parseDirectFeed(await response.text(),"Cooperativa") : [];
    })() : Promise.resolve([])]);
    const unique = new Map();
    [...localArticles,...feeds.flat()].forEach((article) => {
      const key = article.title.toLocaleLowerCase();
      if (article.title && article.url && !unique.has(key)) unique.set(key,article);
    });
    const base = [...unique.values()]
      .filter((article) => !nonNewsPattern.test(article.title))
      .slice(0,18);
    const details = await mapWithConcurrency(base.slice(0,10),3,(article) => article.direct
      ? Promise.resolve({ url:article.url, description:article.rssDescription, body:article.rssDescription })
      : extractArticle(article.url));
    const now = Date.now();
    const articles = base.map((article,index) => {
      const published = Date.parse(article.publishedAt);
      const age = Number.isFinite(published) ? Math.max(0,Math.round((now-published)/3600000)) : 0;
      const title = cleanTitle(article.title, article.source.name);
      const detail = details[index] || { url:article.url, description:"", body:"" };
      const summary = informativeSummary({ body:detail.body, extracted:detail.description, title });
      const category = classify(`${title} ${summary}`);
      return {
        id:`LIVE-${index}-${Math.abs([...title].reduce((hash,char) => ((hash<<5)-hash)+char.charCodeAt(0),0))}`,
        title,
        place:location,
        lat:Number.isFinite(lat) ? lat : 0,
        lon:Number.isFinite(lon) ? lon : 0,
        category, type:"NOTICIA", age, relevance:Math.max(55,94-index*2),
        summary,
        analysis:contextualLimit({ category, title, summary, source:article.source.name }),
        hashtags:[`#${category}`,`#${country}`,"#Actualidad"],
        source:article.source.name, sourceUrl:detail.url, publishedAt:article.publishedAt, live:true
      };
    }).filter((article,index) => index < details.length && article.summary.length >= 55 && article.summary.toLocaleLowerCase() !== article.title.toLocaleLowerCase() && !nonNewsPattern.test(`${article.title} ${article.summary}`));
    return Response.json({ articles, updatedAt:new Date().toISOString(), location }, { headers:{ "Cache-Control":"public, max-age=300, stale-while-revalidate=900" } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "News feed unavailable" }, { status:502 });
  }
};

export const config = { path:"/api/news", method:["GET"] };
