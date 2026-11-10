import test from 'node:test';
import assert from 'node:assert/strict';
import {createAtlasAI} from '../netlify/lib/atlas-ai.mjs';
test('direct AI refuses injected gateway credentials when own key is missing',()=>{
 assert.throws(()=>createAtlasAI({env:{OPENAI_API_KEY:'gateway',OPENAI_BASE_URL:'https://gateway.invalid'}}),{code:'atlas_ai_not_configured'});
});
test('direct AI uses only dedicated key and fixed OpenAI origin',()=>{
 const client=createAtlasAI({env:{ATLAS_OPENAI_API_KEY:'test-own-key',OPENAI_BASE_URL:'https://gateway.invalid'},Client:class{constructor(options){Object.assign(this,options);}}});
 assert.equal(client.apiKey,'test-own-key');assert.equal(client.baseURL,'https://api.openai.com/v1');assert.equal(client.maxRetries,0);
});
test('AI can be paused without invoking a provider',()=>{
 assert.throws(()=>createAtlasAI({env:{ATLAS_OPENAI_API_KEY:'test',ATLAS_AI_ENABLED:'false'}}),{code:'atlas_ai_paused'});
});
