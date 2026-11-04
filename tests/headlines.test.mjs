import test from 'node:test';
import assert from 'node:assert/strict';
import {parse,mergeArticles,articleKey,headlines} from '../netlify/lib/headlines.mjs';
const xml='<rss><item><title>Política &amp; deporte - Medio</title><link>https://example.org/story?utm_source=test</link><source>Medio</source><pubDate>Wed, 04 Nov 2026 12:00:00 GMT</pubDate></item></rss>';
test('RSS conserva fecha y medio; IDs no dependen del orden o tracking',()=>{const a=parse(xml,'politica')[0];assert.equal(a.title,'Política & deporte');assert.equal(a.id,articleKey('https://example.org/story'));assert.equal(a.source,'Medio');assert.equal(a.publishedAt,'2026-11-04T12:00:00.000Z')});
test('deduplica entre temas sin perder categorías',()=>{const a=parse(xml,'politica'),b=parse(xml,'deportes');const rows=mergeArticles([a,b]);assert.equal(rows.length,1);assert.deepEqual(rows[0].topics,['politica','deportes'])});
test('rechaza enlaces ejecutables y fechas inválidas',()=>{assert.equal(parse(xml.replace('https://example.org/story?utm_source=test','javascript:alert(1)'),'x').length,0);assert.equal(parse(xml.replace('Wed, 04 Nov 2026 12:00:00 GMT','invalid'),'x').length,0)});
test('caída de un tema conserva los demás',async()=>{let n=0;const d=await headlines(async()=>{if(n++===0)throw Error();return {ok:true,text:async()=>xml}});assert.equal(d.sources.filter(s=>s.status==='error').length,1);assert.ok(d.articles.length>0)});
