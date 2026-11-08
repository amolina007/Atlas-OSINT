import {createReadingCache} from './observatorio-reading-cache.mjs';
export function createReadingLoader({storage,fetcher=fetch,now=Date.now,onReady=()=>{},onSettled=()=>{}}={}){
 const cache=createReadingCache(storage),pending=new Map(),attempted=new Set();let queue=[],active=0,starts=[];
 function load(article,background=false){
  const saved=article.reading?.status==='ready'?article.reading:cache.get(article.id);if(saved)return Promise.resolve(saved);
  if(pending.has(article.id))return pending.get(article.id);
  const task=(async()=>{const r=await fetcher('/.netlify/functions/news-summary?id='+article.id+(article.searchQuery?'&q='+encodeURIComponent(article.searchQuery):''),{signal:AbortSignal.timeout(55000),priority:background?'low':'high'});if(!r.ok)throw Error(r.status===429?'rate':'request');const data=await r.json();cache.set(article.id,data);if(data.status==='ready')onReady(article.id);return data;})();
  pending.set(article.id,task);task.finally(()=>{pending.delete(article.id);onSettled(article.id);}).catch(()=>{});return task;
 }
 return {isPending:article=>!cache.get(article.id)&&(!attempted.has(article.id)||pending.has(article.id)),get:article=>article.reading?.status==='ready'?article.reading:cache.get(article.id),load,
  update(articles){queue=articles.filter(a=>a.reading?.status!=='ready'&&!cache.get(a.id)&&!attempted.has(a.id)&&!pending.has(a.id));},
  prioritize(ids){const rank=new Map(ids.map((id,i)=>[id,i]));queue.sort((a,b)=>(rank.get(a.id)??999)-(rank.get(b.id)??999));},
  tick(){starts=starts.filter(t=>now()-t<60000);if(active>=2||starts.length>=4)return;const article=queue.shift();if(!article)return;
   if(cache.get(article.id)||pending.has(article.id)||attempted.has(article.id))return;
   attempted.add(article.id);starts.push(now());active++;load(article,true).catch(()=>{}).finally(()=>active--);
  }
 };
}
export function observeReadingPreparation(loader){
 let observer;const visible=new Set();
 setInterval(()=>{
  if(document.visibilityState!=='visible'||(location.hash&&location.hash!=='#feed')||document.querySelector('dialog[open]')||navigator.connection?.saveData)return;
  loader.prioritize([...visible]);loader.tick();
 },1500);
 return (root,articles)=>{
  loader.update(articles);visible.clear();observer?.disconnect();
  if(typeof IntersectionObserver!=='function')return;
  observer=new IntersectionObserver(entries=>{for(const e of entries){const id=e.target.dataset.photoId;if(e.isIntersecting)visible.add(id);else visible.delete(id);}},{rootMargin:'150px'});
  root.querySelectorAll('[data-photo-id]').forEach(el=>observer.observe(el));
 };
}
