import test from 'node:test';
import assert from 'node:assert/strict';
import {createSummaryCache} from '../netlify/lib/news-summary-cache.mjs';
import {createReadingCache} from '../dist/observatorio-reading-cache.mjs';
const data={status:'ready',what:[{text:'Hecho verificado',source:1}],context:[],sources:[{id:1,url:'https://example.com/news'}],generatedAt:'2026-11-05T12:00:00Z'};
test('durable summaries survive new server instances and different search queries',async()=>{
 const rows=new Map();let builds=0;const deps={getStore:()=>({get:async k=>rows.get(k),setJSON:async(k,v)=>rows.set(k,v)}),build:async()=>{builds++;return data;}};
 const first=createSummaryCache(deps);assert.equal((await first('id','query')).cache,'generated');
 assert.equal((await first('id','other query')).cache,'memory');
 const cold=createSummaryCache(deps);assert.deepEqual((await cold('id')).data,data);assert.equal(builds,1);
});
test('concurrent requests share generation and incomplete results can retry',async()=>{
 let builds=0;const cache=createSummaryCache({getStore:()=>({get:async()=>null,setJSON:async()=>{}}),build:async()=>{builds++;return {status:'brief'};}});
 await Promise.all([cache('id','one'),cache('id','two')]);assert.equal(builds,1);await cache('id');assert.equal(builds,2);
});
test('storage failures do not discard a valid generated reading',async()=>{
 const errors=[];const cache=createSummaryCache({getStore:()=>{throw Error('offline');},build:async()=>data,onError:op=>errors.push(op)});
 assert.deepEqual((await cache('id')).data,data);assert.deepEqual(errors,['read']);
});
test('local cache persists citations and original generation date after reload, with bounded size',()=>{
 let saved;const storage={getItem:()=>saved,setItem:(k,v)=>{saved=v;}};const cache=createReadingCache(storage);cache.set('article',data);
 assert.deepEqual(createReadingCache(storage).get('article'),data);cache.set('article',{status:'brief'});assert.deepEqual(cache.get('article'),data);
 for(let i=0;i<70;i++)cache.set('id'+i,data);assert.equal(JSON.parse(saved).length,60);assert.equal(cache.get('article'),null);
});
test('broken or unavailable local storage leaves reader usable',()=>{
 const cache=createReadingCache({getItem:()=>'{broken',setItem:()=>{throw Error('quota');}});cache.set('id',data);assert.deepEqual(cache.get('id'),data);assert.equal(createReadingCache().get('missing'),null);
});
