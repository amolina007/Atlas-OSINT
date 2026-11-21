import {reserveAIRequest} from './atlas-ai-budget.mjs';
import OpenAI from 'openai';
// Never use gateway-injected credentials or URLs: billing belongs to this key's project.
export function createAtlasAI({env=process.env,Client=OpenAI,timeout=14000}={}){
 const apiKey=env.ATLAS_OPENAI_API_KEY?.trim();
 if(!apiKey)throw Object.assign(new Error('Atlas direct OpenAI key is not configured'),{code:'atlas_ai_not_configured'});
 if(env.ATLAS_AI_ENABLED==='false')throw Object.assign(new Error('Atlas AI is paused'),{code:'atlas_ai_paused'});
 const client=new Client({apiKey,baseURL:'https://api.openai.com/v1',timeout,maxRetries:0});
 if(client.chat?.completions?.create){const create=client.chat.completions.create.bind(client.chat.completions);client.chat.completions.create=async input=>{await reserveAIRequest({env});const bounded={...input,max_tokens:Math.min(input.max_tokens||2000,6500)};if(JSON.stringify(bounded.messages).length>100000)throw Error('atlas_ai_input_limit');return create(bounded);};}
 return client;
}
