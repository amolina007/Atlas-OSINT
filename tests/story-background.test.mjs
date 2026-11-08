import test from 'node:test';import assert from 'node:assert/strict';
import {runStoryJob} from '../netlify/functions/story-background.mjs';
test('unclaimed, expired or replayed jobs cannot invoke the model',async()=>{
 assert.deepEqual(await runStoryJob(async()=>null,()=>assert.fail()),{claimed:false});
});
test('background discovery persists through scoped CAS and finishes without a browser session',async()=>{
 const calls=[];let row={id:'one',version:3,body:{events:[{id:'old'}]},archived:false};
 const rpc=async(action,args)=>{calls.push([action,args]);if(action==='claim'||action==='read')return structuredClone(row);if(action==='append'){assert.equal(args.p_version,3);row.body.events.push(args.p_event);row.version++;return true;}return true;};
 const process=async(input,read,write)=>{if(input.mode==='discover')return Response.json({query:'story',articles:[{id:'new'}]});const old=await read();assert.equal(await write(old,{events:[...old.body.events,{id:'new',automatic:true}]}),true);return Response.json({added:1});};
 assert.equal((await runStoryJob(rpc,process)).complete,true);assert.equal(row.body.events.length,2);assert.deepEqual(calls.at(-1),['finish',{p_success:true}]);
});
test('failed source does not mark a review successful and closes the capability',async()=>{
 const calls=[];const rpc=async(action,args)=>{calls.push([action,args]);return action==='claim'?{id:'one'}:true;};
 assert.equal((await runStoryJob(rpc,async()=>Response.json({}, {status:502}))).complete,false);
 assert.deepEqual(calls.at(-1),['finish',{p_success:false}]);
});
test('worker accepts the fixed dev hostname without build-only branch variables',async()=>{
 const {default:handler}=await import('../netlify/functions/story-background.mjs');
 const previousFetch=globalThis.fetch,previousNetlify=globalThis.Netlify;let calls=0;
 globalThis.Netlify={env:{get:()=>undefined}};
 globalThis.fetch=async()=>{calls++;return Response.json(null);};
 try{await handler(new Request('https://dev.atlas.convergenciaaura.cl/.netlify/functions/story-background',{method:'POST',body:JSON.stringify({token:'a'.repeat(64)})}));assert.equal(calls,1);
 await handler(new Request('https://atlas.convergenciaaura.cl/.netlify/functions/story-background',{method:'POST',body:JSON.stringify({token:'a'.repeat(64)})}));assert.equal(calls,1);
 }finally{globalThis.fetch=previousFetch;globalThis.Netlify=previousNetlify;}
});
