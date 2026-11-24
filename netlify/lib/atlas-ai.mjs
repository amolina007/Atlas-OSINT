import {logUsage,tokenCost} from './atlas-ai-usage.mjs';
import {reserveAIRequest} from './atlas-ai-budget.mjs';
import OpenAI from 'openai';
// Never use gateway-injected credentials or URLs: billing belongs to this key's project.
export function createAtlasAI({env=process.env,Client=OpenAI,timeout=14000}={}){
 const apiKey=env.ATLAS_OPENAI_API_KEY?.trim();
 if(!apiKey)throw Object.assign(new Error('Atlas direct OpenAI key is not configured'),{code:'atlas_ai_not_configured'});
 if(env.ATLAS_AI_ENABLED==='false')throw Object.assign(new Error('Atlas AI is paused'),{code:'atlas_ai_paused'});
 const client=new Client({apiKey,baseURL:'https://api.openai.com/v1',timeout,maxRetries:0});
 if(client.chat?.completions?.create){const create=client.chat.completions.create.bind(client.chat.completions);client.chat.completions.create=async input=>{await reserveAIRequest({env});const bounded={...input,max_tokens:Math.min(input.max_tokens||2000,6500)};if(JSON.stringify(bounded.messages).length>100000)throw Error('atlas_ai_input_limit');const started=Date.now();try{const result=await create(bounded);await logUsage({kind:'ai',status:'ok',model:result.model||input.model,inputTokens:result.usage?.prompt_tokens??null,outputTokens:result.usage?.completion_tokens??null,cachedTokens:result.usage?.prompt_tokens_details?.cached_tokens??0,estimatedUSD:tokenCost(result.model||input.model,result.usage),rateDate:'2026-11-24',durationMs:Date.now()-started});return result;}catch(error){await logUsage({kind:'ai',status:'error',model:input.model,code:error.status||error.code||'unknown',estimatedUSD:null});throw error;}};}
 return client;
}
