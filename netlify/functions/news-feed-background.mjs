import {getStore} from '@netlify/blobs';
import {headlines} from '../lib/headlines.mjs';
import {cachedSummary} from './news-summary.mjs';
import {prepareNews} from '../lib/prepared-news.mjs';
export default async function(req){
 if(Netlify.env.get('CONTEXT')==='production'||new URL(req.url).hostname!=='dev.atlas.convergenciaaura.cl'||req.method!=='POST')return;
 const raw=await req.text();if(raw.length>200)return;let token;try{({token}=JSON.parse(raw));}catch{return;}
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return;
 const rpc=async(action,success=false)=>{const response=await fetch('https://utilbunuziotzumuiayu.supabase.co/rest/v1/rpc/atlas_dev_feed_job',{method:'POST',headers:{apikey:'sb_publishable_yF7fkqR5YlWrwnGfyRP2gA_i2k5YiZh','Content-Type':'application/json'},body:JSON.stringify({p_token:token,p_action:action,p_success:success}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('job_database');return response.json();};
 if(!await rpc('claim'))return;
 try{
  const store=getStore({name:'atlas-dev-prepared-news',consistency:'strong'}),previous=await store.get('current',{type:'json'}),data=await headlines();
  const result=await prepareNews({articles:data.articles,previous:previous?.articles||[],summarize:cachedSummary,publish:snapshot=>store.setJSON('current',snapshot)});
  await rpc('finish',result.count>=24);console.info('Atlas prepared feed',result);
 }catch{await rpc('finish',false);console.warn('Atlas prepared feed failed');}
}
export const config={background:true};
