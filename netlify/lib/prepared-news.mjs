import {hasCompleteReading} from '../../dist/observatorio-reading-quality.mjs';
import {canonicalStoryURL,normalizeStoryText} from '../../dist/observatorio-story-updates.mjs';
export function readyNews(articles,now=Date.now()){
 const ids=new Set(),urls=new Set(),titles=new Set();return articles.filter(a=>{
  if(!a||!hasCompleteReading(a.reading)||Date.parse(a.publishedAt)<now-72*3600000||Date.parse(a.publishedAt)>now+300000)return false;
  const url=canonicalStoryURL(a.url),title=normalizeStoryText(a.title);if(ids.has(a.id)||(url&&urls.has(url))||titles.has(title))return false;
  ids.add(a.id);if(url)urls.add(url);titles.add(title);return true;
 }).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
export async function prepareNews({articles,previous=[],summarize,publish,now=Date.now,target=72,budget=11*60000}){
 const start=now();let ready=readyNews(previous,start),attempted=0;
 const known=new Set(ready.map(a=>a.id));const queue=articles.filter(a=>!known.has(a.id));
 for(let i=0;i<queue.length&&(ready.length<target||attempted<24)&&now()-start<budget;i+=3){
  const batch=await Promise.all(queue.slice(i,i+3).map(async a=>{attempted++;try{const {data}=await summarize(a.id,a.searchQuery);return {...a,reading:data};}catch{return null;}}));
  ready=readyNews([...batch.filter(Boolean),...ready],now()).slice(0,target);
  if(ready.length)await publish({articles:ready,updatedAt:new Date(now()).toISOString(),attempted});
 }
 return {count:ready.length,attempted};
}
