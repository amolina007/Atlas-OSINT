import { createHash } from 'node:crypto';
export const topics = [
 ['politica','Política','elecciones OR gobierno OR congreso OR diplomacia'],
 ['deportes','Deportes','fútbol OR tenis OR deportes OR juegos olímpicos'],
 ['conflictos','Guerras y conflictos','guerra OR conflicto armado OR Ucrania OR Gaza'],
 ['economia','Economía','economía OR inflación OR comercio OR empleo'],
 ['ciencia','Ciencia y ambiente','ciencia OR astronomía OR cambio climático OR biodiversidad'],
 ['tecnologia','Tecnología','tecnología OR inteligencia artificial OR ciberseguridad'],
 ['salud','Salud y sociedad','salud pública OR educación OR sociedad'],
 ['cultura','Cultura','cultura OR cine OR música OR literatura']
];
export const clean = s => String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]*>/g,' ').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>{ const c=Number(n);return c>0 && c<=0x10ffff?String.fromCodePoint(c):''; }).replace(/\s+/g,' ').trim();
const tag = (s,name) => clean(s.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]);
export function articleKey(raw) { const u=new URL(raw); u.hash=''; for(const k of [...u.searchParams.keys()]) if(k.startsWith('utm_')||['oc','fbclid','gclid'].includes(k))u.searchParams.delete(k);return createHash('sha256').update(u.href).digest('hex'); }
export function parse(xml,topic) { return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(([,item])=>{const title=tag(item,'title'), source=tag(item,'source')||'Medio no identificado', url=tag(item,'link'), publishedAt=tag(item,'pubDate');if(!title||!url.startsWith('https://')||!Number.isFinite(Date.parse(publishedAt)))return null; return {id:articleKey(url),title:title.endsWith(' - '+source)?title.slice(0,-source.length-3):title,url,source,publishedAt:new Date(publishedAt).toISOString(),sourceUrl:(item.match(/<source[^>]*url=["'](https:\/\/[^"']+)["']/i)?.[1]||null),topics:[topic],via:'Google News RSS'};}).filter(Boolean); }
export function mergeArticles(groups) { const m=new Map(); for(const a of groups.flat()){const old=m.get(a.id);if(old)old.topics=[...new Set([...old.topics,...a.topics])];else m.set(a.id,{...a,topics:[...a.topics]});}return [...m.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)); }
let cache;
export async function headlines(fetcher=fetch) { if(fetcher===fetch && cache && Date.now()-cache.time<300000)return cache.data; const results=await Promise.all(topics.map(async([id,label,q])=>{const endpoint='https://news.google.com/rss/search?'+new URLSearchParams({q:`(${q}) when:3d`,hl:'es-419',gl:'CL',ceid:'CL:es-419'}); try {const r=await fetcher(endpoint,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const xml=await r.text();if(!/<rss\b/i.test(xml))throw Error();const articles=parse(xml,id).filter(a=>Date.parse(a.publishedAt)<=Date.now()+300000).slice(0,25);return {id,label,status:'ok',count:articles.length,articles};}catch{return {id,label,status:'error',count:0,articles:[]};}})); const data={updatedAt:new Date().toISOString(),articles:mergeArticles(results.map(r=>r.articles)),sources:results.map(({articles,...r})=>r),topics:topics.map(([id,label])=>({id,label}))};if(fetcher===fetch)cache={time:Date.now(),data};return data; }
