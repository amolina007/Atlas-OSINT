export const economyQueries={
 dolar:'dólar Chile peso sube baja when:30d',uf:'"unidad de fomento" OR "UF" Chile inflación when:30d',ipc:'Chile IPC inflación INE when:30d',tpm:'Chile "Banco Central" tasa TPM when:30d',cobre:'cobre precio demanda oferta when:30d',imacec:'Chile Imacec actividad economía when:30d'
};
const patterns={dolar:/d[oó]lar|peso chileno/i,uf:/\buf\b|unidad de fomento/i,ipc:/\bipc\b|inflaci[oó]n/i,tpm:/\btpm\b|tasa.*(?:inter[eé]s|pol[ií]tica)|banco central/i,cobre:/cobre/i,imacec:/imacec/i};
const foreign=/argentina|argentino|colombia|colombiano|m[eé]xico|mexicano|per[uú]|peruano|espa[nñ]a|espa[nñ]ol/i;
const safe=url=>{try{return new URL(url).protocol==='https:';}catch{return false;}};
export function selectEconomyNews(id,articles,now=Date.now()){
 const seen=new Set();return articles.filter(a=>{const time=Date.parse(a.publishedAt),title=String(a.title||''),key=title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\W/g,'');if(!patterns[id]?.test(title)||!Number.isFinite(time)||time>now||time<now-30*86400000||!safe(a.url)||!a.source||a.source==='Medio no identificado'||seen.has(key))return false;if(id==='dolar'&&/euro\s*[\/–-]\s*d[oó]lar|d[oó]lar\s*[\/–-]\s*euro|eurod[oó]lar|d[oó]lar blue/i.test(title)&&!/chile|chileno/i.test(title))return false;if(id!=='cobre'&&foreign.test(title)&&!(/chile|chileno/i.test(title)))return false;seen.add(key);return true;}).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,6).map(a=>({title:a.title,url:a.url,source:a.source,publishedAt:a.publishedAt}));
}
