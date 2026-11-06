import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selectMapRows,countryName} from '../dist/observatorio-map.mjs';
test('map modes isolate sources, date windows and category filters',()=>{
 const now=Date.parse('2026-11-06T12:00:00Z');const data={conflicts:[{title:'Ukraine: Territory',country:'Ukraine',type:1}],events:[{title:'Storm',date:'2026-11-06T00:00:00Z',category:'Severe Storms'},{title:'Old fire',date:'2026-09-01',category:'Wildfires'}],newsEvents:[{title:'Report',date:'2026-11-06',category:'Noticia'}]};
 assert.equal(selectMapRows('conflicts',data,'Ucrania','1',1,now).length,1);
 assert.equal(selectMapRows('conflicts',data,'Ucrania','2',1,now).length,0);
 assert.deepEqual(selectMapRows('climate',data,'','all',7,now).map(e=>e.title),['Storm']);
 assert.deepEqual(selectMapRows('news',data,'','all',30,now).map(e=>e.title),['Report']);
 assert.equal(countryName('Sudan'),'Sudán');
});
test('UCDP derived catalog accounts for every source event with valid aggregates and provenance',async()=>{
 const {metadata:m,conflicts:rows}=JSON.parse(await readFile(new URL('../dist/data/conflict-catalog.json',import.meta.url)));
 assert.equal(m.license,'CC BY 4.0');assert.equal(m.periodEnd,'2026-09-30');assert.equal(rows.reduce((n,r)=>n+r.count,0),m.eventCount);
 assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);assert.equal(new Set(rows.map(r=>r.country)).size,m.countries);
 for(const r of rows){assert.ok([1,2,3].includes(r.type));assert.ok(r.review<=r.count);assert.ok(r.start<=r.end);assert.ok(Math.abs(r.coordinates[0])<=180&&Math.abs(r.coordinates[1])<=90);assert.ok(r.actors.length);}
 assert.ok(rows.some(r=>r.country==='Ukraine'));assert.ok(rows.some(r=>r.country==='Sudan'));assert.ok(rows.some(r=>r.country==='Myanmar (Burma)'));
});
