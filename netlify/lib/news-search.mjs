import {parse,mergeArticles,headlines} from './headlines.mjs';
const cache=new Map();
export function searchQuery(raw){const q=String(raw||'').replace(/\s+/g,' ').trim();if(q.length<2||q.length>160||/[\x00-\x1f]/.test(q))throw Error('Invalid query');return q;}
export async function searchNews(raw,fetcher=fetch){
 const query=searchQuery(raw),old=cache.get(query);if(fetcher===fetch&&old&&Date.now()-old.time<300000)return old.promise;
 const run=async()=>{const endpoint='https://news.google.com/rss/search?'+new URLSearchParams({q:query,hl:'es-419',gl:'CL',ceid:'CL:es-419'});const r=await fetcher(endpoint,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Search unavailable');const xml=await r.text();if(xml.length>2500000||!/<rss\b/i.test(xml))throw Error('Invalid search response');return {query,updatedAt:new Date().toISOString(),articles:mergeArticles([parse(xml,'busqueda')]).filter(a=>Date.parse(a.publishedAt)<=Date.now()+300000).slice(0,50).map(a=>({...a,searchQuery:query})),provider:'Google News RSS',limit:50};};
 const promise=run();if(fetcher===fetch){if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(query,{time:Date.now(),promise});promise.catch(()=>{if(cache.get(query)?.promise===promise)cache.delete(query);});}return promise;
}
export async function articleFromRequest(id,query,{search=searchNews,feed=headlines}={}){const data=query?await search(query):await feed();return data.articles.find(a=>a.id===id);}
