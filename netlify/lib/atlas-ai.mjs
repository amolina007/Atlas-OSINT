import OpenAI from 'openai';
// Never use gateway-injected credentials or URLs: billing belongs to this key's project.
export function createAtlasAI({env=process.env,Client=OpenAI,timeout=14000}={}){
 const apiKey=env.ATLAS_OPENAI_API_KEY?.trim();
 if(!apiKey)throw Object.assign(new Error('Atlas direct OpenAI key is not configured'),{code:'atlas_ai_not_configured'});
 if(env.ATLAS_AI_ENABLED==='false')throw Object.assign(new Error('Atlas AI is paused'),{code:'atlas_ai_paused'});
 return new Client({apiKey,baseURL:'https://api.openai.com/v1',timeout,maxRetries:0});
}
