import {processStoryUpdate} from '../lib/story-update-engine.mjs';
// Public API key only; every database operation uses the caller's JWT and existing owner RLS.
const API='https://utilbunuziotzumuiayu.supabase.co';
const KEY='sb_publishable_yF7fkqR5YlWrwnGfyRP2gA_i2k5YiZh';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default async function(req){
 if(req.method!=='POST')return reply({},405);
 const auth=req.headers.get('authorization');if(!/^Bearer [A-Za-z0-9._-]+$/.test(auth||''))return reply({},401);
 const raw=await req.text();if(raw.length>2000)return reply({},413);
 let input;try{input=JSON.parse(raw);}catch{return reply({},400);}
 if(!input||typeof input!=='object'||Array.isArray(input)||!/^[a-f0-9-]{36}$/.test(input.id||'')||!['discover','assess','complete'].includes(input.mode))return reply({},400);
 const headers={apikey:KEY,Authorization:auth,'Content-Type':'application/json'};
 const rest=async(path,options={})=>{const r=await fetch(API+'/rest/v1/atlas_dev_research'+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error(r.status===401||r.status===403?'auth':'database');return r.json();};
 const read=async()=> (await rest('?id=eq.'+input.id+'&select=id,body,version,archived&limit=1'))[0];
 const write=async(row,body)=>(await rest('?id=eq.'+row.id+'&version=eq.'+row.version+'&archived=eq.false',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({body})})).length>0;
 return processStoryUpdate(input,read,write);
}
export const config={rateLimit:{windowLimit:8,windowSize:60,aggregateBy:['ip','domain']}};
