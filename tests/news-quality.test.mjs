import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasCompleteReading} from '../dist/observatorio-reading-quality.mjs';
import {articleTags} from '../dist/observatorio-discovery.mjs';
test('only complete sourced readings qualify for presentation',()=>{
 const good={status:'ready',what:[{text:'Hecho',source:1}],context:[{text:'Contexto',source:1}],sources:[{id:1,url:'https://example.org/news'}]};
 assert.equal(hasCompleteReading(good),true);
 for(const invalid of [{...good,context:[]},{...good,what:[]},{...good,sources:[]},{...good,status:'unavailable'},{...good,context:[{text:'Contexto',source:2}]}])assert.equal(hasCompleteReading(invalid),false);
});
test('tags include multiple explicit places and actors from supported text',()=>{
 const tags=articleTags({title:'Trump y Putin debaten sobre Rusia y Ucrania',topics:['politica'],reading:{context:[{text:'La OTAN se reunió en París.'}]}});
 for(const tag of ['DonaldTrump','VladimirPutin','Rusia','Ucrania','OTAN','París'])assert.ok(tags.includes(tag),tag);
 assert.ok(!articleTags({title:'Una reunión internacional',source:'Rusia',topics:[]}).includes('Rusia'));
});
