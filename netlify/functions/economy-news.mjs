import {getStore} from '@netlify/blobs';
import {searchNews} from '../lib/news-search.mjs';
import {economyQueries,selectEconomyNews} from '../lib/economy-news.mjs';
const pending=new Map(),memory=new Map();
export default async function(req){
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const id=new URL(req.url).searchParams.get('indicator');if(!Object.hasOwn(economyQueries,id))return Response.json({error:'invalid_indicator'},{status:400});
 try{if(!pending.has(id))pending.set(id,(async()=>{let store,old=memory.get(id);try{store=getStore({name:'atlas-dev-economy-news-v1',consistency:'strong'});old=await store.get(id,{type:'json'})||old;}catch{}
 if(old&&Date.now()-Date.parse(old.retrievedAt)<1800000)return {...old,articles:selectEconomyNews(id,old.articles),stale:false};
 try{const found=await searchNews(economyQueries[id]),data={id,articles:selectEconomyNews(id,found.articles),retrievedAt:new Date().toISOString(),provider:'Google News RSS',windowDays:30,stale:false};memory.set(id,data);try{await store?.setJSON(id,data);}catch{}return data;}catch(error){if(old)return {...old,articles:selectEconomyNews(id,old.articles),stale:true};throw error;}
 })().finally(()=>pending.delete(id)));
 const result=await pending.get(id);return Response.json(result,{headers:{'Cache-Control':result.stale?'no-store':'public, max-age=120','Netlify-CDN-Cache-Control':result.stale?'no-store':'public, durable, max-age=1800','Netlify-Vary':'query=indicator','X-Content-Type-Options':'nosniff'}});
 }catch{return Response.json({error:'news_unavailable'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
export const config={rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
