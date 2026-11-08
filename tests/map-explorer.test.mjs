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

import {matchesConflictScope} from '../dist/observatorio-conflict-scopes.mjs';
test('conflict scopes filter real catalog countries and do not classify foreign actors as locations',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../dist/data/conflict-catalog.json',import.meta.url)));
 for(const scope of ['ukraine','middleEast','africa'])assert.ok(catalog.conflicts.filter(e=>matchesConflictScope(e,scope)).length>0,scope);
 assert.equal(matchesConflictScope({country:'Sudan',title:'Ukraine actors'},'ukraine'),false);
 assert.equal(matchesConflictScope({country:'Ukraine'},'ukraine'),true);
 assert.equal(matchesConflictScope({country:'Lebanon'},'middleEast'),true);
 assert.equal(matchesConflictScope({country:'DR Congo (Zaire)'},'africa'),true);
 assert.equal(matchesConflictScope({title:'Ataque en Gaza',location:{label:'Gaza'}},'africa'),false);
 assert.equal(matchesConflictScope({title:'Ataque en Gaza',location:{label:'Gaza'}},'middleEast'),true);
 assert.equal(matchesConflictScope({title:'Combates en Burkina Faso'},'africa'),true);
 assert.equal(matchesConflictScope({title:'Ataque sin lugar conocido'},'africa'),false);
});

import {matchesSpecificConflict} from '../dist/observatorio-conflict-scopes.mjs';
test('specific conflicts distinguish Gaza, Sudan and DR Congo from nearby countries',async()=>{
 const {incidents}=JSON.parse(await readFile(new URL('../dist/data/conflict-catalog.json',import.meta.url)));
 for(const key of ['gaza','sudan','congo'])assert.ok(incidents.some(e=>matchesSpecificConflict(e,key)),key);
 assert.equal(matchesSpecificConflict({country:'Israel',place:'Tel Aviv',title:'Gaza militants'},'gaza'),false);
 assert.equal(matchesSpecificConflict({country:'Israel',place:'Gaza city'},'gaza'),true);
 assert.equal(matchesSpecificConflict({country:'South Sudan',title:'Sudan'},'sudan'),false);
 assert.equal(matchesSpecificConflict({title:'Combates en Sudán del Sur'},'sudan'),false);
 assert.equal(matchesSpecificConflict({title:'Ataques en Darfur'},'sudan'),true);
 assert.equal(matchesSpecificConflict({country:'Congo'},'congo'),false);
 assert.equal(matchesSpecificConflict({title:'Ataques en República del Congo, Brazzaville'},'congo'),false);
 assert.equal(matchesSpecificConflict({title:'Enfrentamientos en Kivu, RD del Congo'},'congo'),true);
});
