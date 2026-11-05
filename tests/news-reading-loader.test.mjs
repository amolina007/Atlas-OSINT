import test from 'node:test';
import assert from 'node:assert/strict';
import {createReadingLoader} from '../dist/observatorio-reading-loader.mjs';
const ready={status:'ready',what:[{text:'Hecho',source:1}],context:[],sources:[{id:1}],generatedAt:'2026-11-05'};
const flush=()=>new Promise(r=>setImmediate(r));
test('background and opening share one request, ready readings need no fetch',async()=>{
 let resolve,calls=0;const loader=createReadingLoader({fetcher:()=>{calls++;return new Promise(r=>resolve=r);}});
 loader.update([{id:'a',searchQuery:'tema'}]);loader.tick();const opened=loader.load({id:'a'});assert.equal(calls,1);
 resolve({ok:true,json:async()=>ready});assert.deepEqual(await opened,ready);assert.deepEqual(loader.get({id:'a'}),ready);await loader.load({id:'a'});assert.equal(calls,1);
});
test('queue prioritizes visible cards, replaces obsolete filters and limits concurrency',async()=>{
 const calls=[],resolvers=[];const loader=createReadingLoader({fetcher:(url,options)=>{calls.push({url,options});return new Promise(r=>resolvers.push(r));}});
 loader.update([{id:'a'},{id:'b'},{id:'c'}]);loader.prioritize(['c']);loader.tick();loader.tick();loader.tick();assert.equal(calls.length,2);assert.ok(calls[0].url.endsWith('id=c'));assert.equal(calls[0].options.priority,'low');
 loader.update([{id:'new'}]);resolvers.forEach(r=>r({ok:true,json:async()=>ready}));await flush();loader.tick();assert.ok(calls[2].url.endsWith('id=new'));resolvers[2]({ok:true,json:async()=>ready});await flush();
});
test('background budget leaves capacity for manual reads; failures are not retried on render',async()=>{
 let time=0,calls=0;const loader=createReadingLoader({now:()=>time,fetcher:async()=>{calls++;return {ok:false,status:429};}});
 for(let i=0;i<6;i++){loader.update([{id:String(i)}]);loader.tick();await flush();}assert.equal(calls,4);
 await assert.rejects(loader.load({id:'manual'}));assert.equal(calls,5);
 time=61000;loader.update([{id:'0'}]);loader.tick();await flush();assert.equal(calls,5);
 loader.update([{id:'fresh'}]);loader.tick();await flush();assert.equal(calls,6);
});
