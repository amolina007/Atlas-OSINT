import test from 'node:test';import assert from 'node:assert/strict';
import {forceConflicts,comparableFact,formatForceValue} from '../dist/observatorio-force-data.mjs';
test('unknown counts never render as zero and bounds are not exact ratios',()=>{
 assert.equal(formatForceValue(null),'Sin cifra verificada');assert.match(formatForceValue(0,'','unidades'),/^0 /);
 assert.equal(comparableFact({values:[12000,5727],qualifiers:['>','≈']}),false);
 assert.equal(comparableFact({values:[10,null],qualifiers:['','']}),false);
});
test('every published measurement has attribution, period, scope and both sides',()=>{
 for(const c of Object.values(forceConflicts)){assert.equal(c.sides.length,2);for(const f of c.facts){assert.equal(f.values.length,2);assert.ok(f.period);assert.ok(f.scope);assert.ok(f.note);assert.ok(new URL(f.source.url).protocol==='https:');}}
});
test('equipment observations and deliveries never enter numeric stock comparisons',()=>{
 for(const c of Object.values(forceConflicts))for(const e of c.equipment||[]){assert.ok([0,1].includes(e.side));assert.ok(e.period&&e.status&&e.detail&&e.source.url);assert.equal(e.values,undefined);}
 const air=forceConflicts.ukraine.facts.find(f=>f.category==='aircraft'&&f.kind==='inventory');assert.equal(comparableFact(air),false);assert.match(air.period,/2025/);
 assert.ok(forceConflicts.congo.equipment.some(e=>e.title.includes('ANKA')));
 assert.ok(forceConflicts.sudan.equipment.some(e=>e.status.includes('Entrega')));
});
