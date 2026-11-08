import {processStoryUpdate} from '../lib/story-update-engine.mjs';
const API='https://utilbunuziotzumuiayu.supabase.co/rest/v1/rpc/atlas_dev_story_job';
const KEY='sb_publishable_yF7fkqR5YlWrwnGfyRP2gA_i2k5YiZh';
export async function runStoryJob(rpc,process=processStoryUpdate){
 const claimed=await rpc('claim');if(!claimed)return {claimed:false};
 const read=()=>rpc('read');
 const write=async(row,body)=>{const event=body.events.find(e=>!row.body.events.some(old=>old.id===e.id));return event?rpc('append',{p_version:row.version,p_event:event}):true;};
 const call=async input=>{const response=await process({...input,id:claimed.id},read,write);if(!response.ok)throw Error('update_failed');return response.json();};
 try{
  const found=await call({mode:'discover'});
  for(const article of (found.articles||[]).slice(0,3))await call({mode:'assess',articleId:article.id,query:found.query});
  await rpc('finish',{p_success:true});return {claimed:true,complete:true};
 }catch{await rpc('finish',{p_success:false});return {claimed:true,complete:false};}
}
export default async function(req){
 if(Netlify.env.get('CONTEXT')==='production'||new URL(req.url).hostname!=='dev.atlas.convergenciaaura.cl'||req.method!=='POST')return;
 const text=await req.text();if(text.length>200)return;
 let token;try{({token}=JSON.parse(text));}catch{return;}
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return;
 const rpc=async(action,extra={})=>{const r=await fetch(API,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_token:token,p_action:action,...extra}),signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('job_database');return r.json();};
 try{const result=await runStoryJob(rpc);if(result.claimed)console.info('Atlas background story review',result.complete?'complete':'failed');}catch{console.warn('Atlas background story review failed');}
}
export const config={background:true};
