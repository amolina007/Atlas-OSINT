import test from 'node:test';
import assert from 'node:assert/strict';
import {searchQuery,searchNews,articleFromRequest} from '../netlify/lib/news-search.mjs';
const item=(n,date='Wed, 04 Nov 2026 12:00:00 GMT')=>`<item><title>Observación de Saturno ${n} - Medio</title><source url="https://example.com">Medio</source><link>https://example.com/article/${n}</link><pubDate>${date}</pubDate></item>`;
test('public search is bounded, uses a fixed service, preserves old dates and deduplicates',async()=>{
 let url;const result=await searchNews('  Saturno   anillos ',async u=>{url=new URL(u);return {ok:true,text:async()=>'<rss>'+item('old','Mon, 01 Jan 2024 12:00:00 GMT')+item('old','Mon, 01 Jan 2024 12:00:00 GMT')+Array.from({length:60},(_,i)=>item(i)).join('')+'</rss>'};});
 assert.equal(url.hostname,'news.google.com');assert.equal(url.searchParams.get('q'),'Saturno anillos');assert.equal(result.articles.length,50);assert.ok(result.articles.every(a=>a.searchQuery==='Saturno anillos'));
 const old=await searchNews('Saturno',async()=>({ok:true,text:async()=>'<rss>'+item('old','Mon, 01 Jan 2024 12:00:00 GMT')+'</rss>'}));assert.equal(old.articles[0].publishedAt,'2024-01-01T12:00:00.000Z');
});
test('invalid input and unavailable providers are explicit errors, not empty success',async()=>{
 for(const q of ['', 'a','x'.repeat(161)])assert.throws(()=>searchQuery(q));
 await assert.rejects(searchNews('Saturno',async()=>({ok:false})));
 await assert.rejects(searchNews('Saturno',async()=>({ok:true,text:async()=>'<html>Error</html>'})));
});
test('reader and photo lookup accept only an ID found in server search results',async()=>{
 const deps={search:async q=>({articles:[{id:'known',searchQuery:q,title:'Real'}]}),feed:async()=>({articles:[{id:'feed'}]})};
 assert.equal((await articleFromRequest('known','Saturno',deps)).title,'Real');assert.equal(await articleFromRequest('forged','Saturno',deps),undefined);assert.equal((await articleFromRequest('feed',null,deps)).id,'feed');
});

import {newsEvidence} from '../dist/observatorio-news-geo.mjs';
import {cleanResearch} from '../dist/observatorio-research.mjs';
test('saved search evidence preserves query and the cited reading across research serialization',()=>{
 const reading={status:'ready',what:[{text:'El concierto se realizará en Chillán.',paragraph:1,source:1}],context:[{text:'Forma parte de un programa cultural.',paragraph:2,source:1}],sources:[{id:1,name:'Medio',url:'https://example.com/concierto'}],generatedAt:'2026-11-04T20:00:00Z'};
 const article={id:'a'.repeat(64),title:'Concierto en Chillán',url:'https://example.com/concierto',source:'Medio',publishedAt:'2026-11-04T19:00:00Z',topics:['busqueda'],searchQuery:'Chillán',reading};
 const evidence=newsEvidence(article);const reloaded=cleanResearch(JSON.parse(JSON.stringify({title:'Prueba',events:[evidence]}))).events[0];assert.equal(reloaded.searchQuery,'Chillán');assert.deepEqual(reloaded.reading,reading);assert.equal(newsEvidence({...article,reading:{status:'brief'}}).reading,null);
});
