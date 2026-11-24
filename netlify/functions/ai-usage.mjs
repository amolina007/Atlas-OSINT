import {usageStore,usageDay} from '../lib/atlas-ai-usage.mjs';
export default async function(req){
 const headers={'Cache-Control':'no-store','Vary':'Authorization'};
 if(req.method!=='GET')return new Response('Method not allowed',{status:405,headers});
 const token=req.headers.get('authorization');if(!/^Bearer \S{20,}$/.test(token||''))return new Response('Unauthorized',{status:401,headers});
 const auth=await fetch('https://utilbunuziotzumuiayu.supabase.co/rest/v1/rpc/atlas_dev_poll_admin',{method:'POST',headers:{Authorization:token,apikey:'sb_publishable_yF7fkqR5YlWrwnGfyRP2gA_i2k5YiZh','Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(10000)});
 if(!auth.ok||await auth.json()!==true)return new Response('Forbidden',{status:403,headers});
 const day=new URL(req.url).searchParams.get('day')||usageDay();if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return new Response('Invalid date',{status:400,headers});
 const store=usageStore(),events=[];let truncated=false;
 for await(const page of store.list({prefix:day+'/',paginate:true})){for(const blob of page.blobs){if(events.length>=2000){truncated=true;break;}const event=await store.get(blob.key,{type:'json'});if(event)events.push(event);}if(truncated)break;}
 const calls=events.filter(e=>e.kind==='ai'),ok=calls.filter(e=>e.status==='ok'),priced=ok.filter(e=>Number.isFinite(e.estimatedUSD)),hits=events.filter(e=>e.kind==='cache').length,generated=events.filter(e=>e.kind==='generation').length;
 return Response.json({day,calls:calls.length,success:ok.length,errors:calls.length-ok.length,inputTokens:ok.reduce((n,e)=>n+(e.inputTokens||0),0),outputTokens:ok.reduce((n,e)=>n+(e.outputTokens||0),0),cachedTokens:ok.reduce((n,e)=>n+(e.cachedTokens||0),0),missingUsage:ok.filter(e=>e.inputTokens===null).length,estimatedUSD:priced.reduce((n,e)=>n+e.estimatedUSD,0),unpriced:calls.length-priced.length,cacheHits:hits,generations:generated,cacheRate:hits+generated?hits/(hits+generated):null,truncated,events:events.length,rateDate:'2026-11-24'}, {headers});
}
