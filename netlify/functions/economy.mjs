import {getStore} from '@netlify/blobs';
import {indicators} from '../../dist/observatorio-economy-data.mjs';
import {normalizeEconomy,retainedSeries} from '../lib/economy.mjs';
const memory=new Map(),pending=new Map();
export default async function(req){
 const headers={'Cache-Control':'public, max-age=60','Netlify-Vary':'query=indicator','X-Content-Type-Options':'nosniff'};
 if(req.method!=='GET')return new Response('Method not allowed',{status:405,headers:{Allow:'GET'}});
 const id=new URL(req.url).searchParams.get('indicator');
 if(!Object.hasOwn(indicators,id))return Response.json({error:'invalid_indicator'},{status:400,headers:{...headers,'Cache-Control':'no-store'}});
 try{
 if(!pending.has(id))pending.set(id,(async()=>{
 let store,old=memory.get(id);try{store=getStore({name:'atlas-dev-economy-v1',consistency:'strong'});old=await store.get(id,{type:'json'})||old;}catch{}
 const data=await retainedSeries({old,load:async()=>{const path=['uf','dolar'].includes(id)?`historico/${id}`:id;
 const r=await fetch(`https://indicadores.cl/api/v1/${path}.json`,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('provider');let raw=await r.json();
 // Historical files do not always contain the headline; retrieve its dated current resource.
 if(['uf','dolar'].includes(id)){const current=await fetch(`https://indicadores.cl/api/v1/${id}.json`,{signal:AbortSignal.timeout(15000)});if(!current.ok)throw Error('provider');raw={...await current.json(),serie:raw.serie};}
 return normalizeEconomy(id,raw);}});
 if(!data.stale&&data.retrievedAt!==old?.retrievedAt){memory.set(id,data);try{await store?.setJSON(id,data);}catch{}}
 return data;
 })().finally(()=>pending.delete(id)));
 const data=await pending.get(id);return Response.json(data,{headers:{...headers,'Netlify-CDN-Cache-Control':data.stale?'no-store':'public, durable, max-age=3600','Cache-Control':data.stale?'no-store':'public, max-age=60'}});
 }catch{return Response.json({error:'economy_unavailable'},{status:502,headers:{...headers,'Cache-Control':'no-store'}});}
}
export const config={rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain']}};
