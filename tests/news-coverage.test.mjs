import test from 'node:test';
import assert from 'node:assert/strict';
import {coverageCandidates,combineCoverage,findCoverage} from '../netlify/lib/news-coverage.mjs';
const original={id:'original',source:'Uno',sourceUrl:'https://uno.example',publishedAt:'2026-11-04T12:00:00Z',title:'Festival solidario en Chillán'};
const candidate={...original,id:'other',source:'Dos',sourceUrl:'https://dos.example'};
test('coverage excludes original publisher, duplicate publishers and unrelated dates',()=>{
 assert.deepEqual(coverageCandidates(original,[original,candidate,{...candidate,id:'duplicate'},{...candidate,sourceUrl:'https://old.example',publishedAt:'2025-01-01'}]),[candidate]);
});
test('cross-source paragraph IDs remain unique and citations retain their publisher',()=>{
 const result=combineCoverage([{article:original,url:'https://uno.example/a',paragraphs:[{id:1,text:'Primera evidencia'}]},{article:candidate,url:'https://dos.example/b',paragraphs:[{id:1,text:'Segunda evidencia'}]}]);
 assert.deepEqual(result.paragraphs.map(p=>[p.id,p.source]),[[1,1],[2,2]]);assert.equal(result.sources[1].url,'https://dos.example/b');
});
test('search retrieves actual matching bodies; headlines alone never become evidence',async()=>{
 const xml='<rss><item><title>Festival solidario en Chillán - Dos</title><source url="https://dos.example">Dos</source><link>https://news.google.com/rss/articles/abc</link><pubDate>Wed, 04 Nov 2026 12:00:00 GMT</pubDate></item></rss>';
 let requested;
 const deps={read:async url=>{requested=new URL(url);return {text:xml};},resolve:async()=>({url:'https://dos.example/a',text:'<h1>Festival solidario en Chillán</h1>'})};
 assert.deepEqual(await findCoverage(original,deps),[]);assert.equal(requested.hostname,'news.google.com');
 deps.resolve=async()=>({url:'https://dos.example/a',text:'<h1>Festival solidario en Chillán</h1><article><p>'+('El festival reúne a artistas locales para apoyar una campaña solidaria durante dos jornadas en la plaza de la ciudad. '.repeat(8))+'</p></article>'});
 assert.equal((await findCoverage(original,deps)).length,1);
});
