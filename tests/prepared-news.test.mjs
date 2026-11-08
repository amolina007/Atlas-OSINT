import test from 'node:test';import assert from 'node:assert/strict';
import {readyNews,prepareNews} from '../netlify/lib/prepared-news.mjs';
const now=Date.parse('2026-11-08T12:00:00Z');
const reading={status:'ready',what:[{text:'Hecho sustentado',source:1}],context:[{text:'Antecedente sustentado',source:1}],sources:[{id:1,url:'https://example.org/source'}]};
const articles=Array.from({length:60},(_,i)=>({id:String(i),title:'Noticia '+i,url:'https://example.org/'+i,publishedAt:new Date(now-i*60000).toISOString(),topics:['politica']}));
test('prepared feed keeps at least two pages of complete, distinct news',async()=>{
 let snapshot;const result=await prepareNews({articles,now:()=>now,target:48,summarize:async()=>({data:reading}),publish:async s=>snapshot=s});
 assert.equal(result.count,48);assert.equal(snapshot.articles.slice(0,24).length,24);assert.equal(snapshot.articles.slice(24,48).length,24);
 assert.equal(new Set(snapshot.articles.map(a=>a.id)).size,48);
});
test('rejects incomplete, duplicate, stale or future news without removing valid previous content',async()=>{
 const old={...articles[0],reading};
 assert.equal(readyNews([old,old,{...old,id:'copy'},{...articles[1],reading:{...reading,context:[]}},{...articles[2],reading,publishedAt:'2026-10-01T00:00:00Z'}],now).length,1);
 let snapshot;await prepareNews({articles:articles.slice(1,4),previous:[old],now:()=>now,summarize:async()=>{throw Error('source')},publish:async s=>snapshot=s});assert.deepEqual(snapshot.articles,[old]);
});
test('full reserve still processes new headlines on the next run',async()=>{
 let count=0;await prepareNews({articles:[...articles,{...articles[0],id:'new',url:'https://example.org/new',title:'Nuevo hecho'}],previous:articles.slice(0,48).map(a=>({...a,reading})),target:48,now:()=>now,summarize:async()=>{count++;return {data:reading}},publish:async()=>{}});assert.ok(count>0);
});
