import test from 'node:test';
import assert from 'node:assert/strict';
import {reserveAIRequest} from '../netlify/lib/atlas-ai-budget.mjs';
test('concurrent requests cannot exceed the daily limit; next day has fresh slots',async()=>{
 const slots=new Set();const getBudgetStore=()=>({async setJSON(key){if(slots.has(key))return {modified:false};slots.add(key);return {modified:true};}});
 const opts={env:{ATLAS_AI_DAILY_CALL_LIMIT:'3'},getBudgetStore,now:new Date('2026-11-20T15:00:00Z')};
 const results=await Promise.allSettled(Array.from({length:10},()=>reserveAIRequest(opts)));
 assert.equal(results.filter(x=>x.status==='fulfilled').length,3);
 assert.equal(results.filter(x=>x.status==='rejected').length,7);
 await reserveAIRequest({...opts,now:new Date('2026-11-21T15:00:00Z')});
});
test('storage failure blocks spending',async()=>{
 await assert.rejects(reserveAIRequest({getBudgetStore:()=>{throw Error('offline');}}),/offline/);
});
