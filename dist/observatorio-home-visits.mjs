export function uniqueHomeArticles(articles){
 const ids=new Set(),urls=new Set(),titles=new Set();
 return articles.filter(a=>{if(!a?.id)return false;let url='';try{const u=new URL(a.url);for(const key of [...u.searchParams.keys()])if(key.startsWith('utm_')||['fbclid','gclid','oc'].includes(key))u.searchParams.delete(key);u.hash='';url=u.href.replace(/\/$/,'');}catch{}
 const title=String(a.title||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 if(ids.has(a.id)||(url&&urls.has(url))||(title&&titles.has(title)))return false;
 ids.add(a.id);if(url)urls.add(url);if(title)titles.add(title);return true;});
}
export function homeNovelties(articles,{previous,seen=[],current}={}){
 const start=Date.parse(previous),end=Date.parse(current);if(!Number.isFinite(start)||!Number.isFinite(end))return [];
 const known=new Set(seen);return uniqueHomeArticles(articles).filter(a=>!known.has(a.id)&&Date.parse(a.publishedAt)>start&&Date.parse(a.publishedAt)<=end);
}
