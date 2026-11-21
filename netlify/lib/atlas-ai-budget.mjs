import {getStore} from '@netlify/blobs';
// Immutable reservation slots: onlyIfNew prevents concurrent workers spending the same slot.
export async function reserveAIRequest({env=process.env,getBudgetStore=()=>getStore({name:'atlas-dev-ai-daily-budget',consistency:'strong'}),now=new Date()}={}){
 const limit=Math.min(1000,Math.max(0,Number(env.ATLAS_AI_DAILY_CALL_LIMIT??100)||0));
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const store=getBudgetStore();
 for(let slot=0;slot<limit;slot++){
  const {modified}=await store.setJSON(`${day}/${slot}`,{reservedAt:now.toISOString()},{onlyIfNew:true});
  if(modified)return;
 }
 throw Object.assign(new Error('Atlas daily AI request limit reached'),{code:'atlas_ai_daily_limit'});
}
