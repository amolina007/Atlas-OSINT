import { headlines } from '../lib/headlines.mjs';
import {getStore} from '@netlify/blobs';
import {readyNews} from '../lib/prepared-news.mjs';
export default async function(req) {
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const data=structuredClone(await headlines());
 if(Netlify.env.get('CONTEXT')!=='production')try{
  const snapshot=await getStore({name:'atlas-dev-prepared-news',consistency:'strong'}).get('current',{type:'json'});
  const ready=readyNews(snapshot?.articles||[]),merged=new Map(data.articles.map(a=>[a.id,a]));
  for(const a of ready)merged.set(a.id,{...merged.get(a.id),...a});
  data.articles=[...merged.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));data.preparedCount=ready.length;data.preparedAt=snapshot?.updatedAt||null;
 }catch{console.warn('Atlas prepared feed temporarily unavailable');}
 const ok=data.sources.some(s=>s.status==='ok')||data.preparedCount>0;
 return Response.json(data,{status:ok?200:502,headers:{'Cache-Control':ok?'public, max-age=30, stale-while-revalidate=60':'no-store'}});
}
