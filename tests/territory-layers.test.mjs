import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {validateControl,initConflictLayer,controlClasses,isRecentControl} from '../dist/observatorio-conflicts.mjs';
const snapshot=k=>JSON.parse(readFileSync(`dist/data/${k}-control.geojson`,'utf8'));
test('reviewed areas carry source dates, licenses and actual polygons for each conflict',()=>{
 for(const key of ['gaza','sudan','congo']){
  const d=validateControl(snapshot(key));assert.equal(d.metadata.conflict,key);assert.match(d.metadata.sourceSha256,/^[a-f0-9]{64}$/);assert.match(d.metadata.sourceUrl,/commons.wikimedia.org/);assert.ok(d.metadata.accuracy);assert.ok(d.metadata.license);assert.ok(d.features.length>=2);
  for(const f of d.features){assert.ok(controlClasses[f.properties.status]);assert.equal(f.properties.sourceUrl,d.metadata.sourceUrl);assert.equal(f.properties.date,d.metadata.date);}
 }
 assert.equal(snapshot('congo').metadata.date,'2025-04-03');assert.match(snapshot('congo').metadata.coverage,/no representa el control actual/);
 assert.ok(snapshot('congo').features.filter(f=>f.properties.status.endsWith('_PRESENCE')).every(f=>f.properties.meaning.includes('no implica control exclusivo')));
});
test('changing conflicts ignores late responses and preserves last valid snapshot on refresh failure',async()=>{
 const dom=new JSDOM('<section id="panorama"><div class="map-center"><div class="panorama-grid"></div><div class="map-footer"></div></div></section>');
 const original={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};globalThis.document=dom.window.document;globalThis.setInterval=()=>0;
 const pending=[],shown=new Set(),popups=[];globalThis.fetch=(url)=>new Promise(resolve=>pending.push({url,resolve}));
 const map={removeLayer:g=>shown.delete(g),hasLayer:g=>shown.has(g),invalidateSize(){},fitBounds(){}};
 const L={canvas:()=>({}),geoJSON(fc,options){const layer={fc,addTo(){shown.add(this);return this},setStyle(){}};for(const f of fc.features)options.onEachFeature(f,{bindPopup:p=>popups.push(p)});return layer;}};
 const tick=()=>new Promise(r=>setImmediate(r));
 try{
  const control=initConflictLayer({map,L});control.setConflict('gaza');control.setConflict('sudan');
  pending[1].resolve({ok:true,json:async()=>snapshot('sudan')});await tick();
  pending[0].resolve({ok:true,json:async()=>snapshot('gaza')});await tick();
  assert.match(document.querySelector('#conflict-status').textContent,/Sudán/);assert.equal(shown.size,0);document.querySelector('#conflict-history').checked=true;document.querySelector('#conflict-history').onchange();assert.equal(shown.size,6);assert.ok([...shown].every(g=>g.fc.features[0].properties.sourceUrl.includes('Sudan')));
  assert.ok(popups.every(p=>p.querySelector('a').href.startsWith('https://commons.wikimedia.org/')));
  const reload=document.querySelector('#conflict-retry').onclick();pending[2].resolve({ok:false});await reload;assert.equal(shown.size,6);assert.match(document.querySelector('#conflict-status').textContent,/Conservamos el corte 2026-10-03/);
  control.setConflict('congo');assert.equal(shown.size,0);pending[3].resolve({ok:true,json:async()=>snapshot('congo')});await tick();assert.equal(shown.size,0);assert.equal(document.querySelector('#conflict-history').checked,false);document.querySelector('#conflict-history').checked=true;document.querySelector('#conflict-history').onchange();assert.equal(shown.size,5);assert.match(document.querySelector('#conflict-status').textContent,/2025-04-03/);
  control.setEnabled(false);assert.equal(shown.size,0);control.setEnabled(true);assert.equal(shown.size,5);
  control.setConflict(null);assert.equal(shown.size,0);assert.equal(control.panel.hidden,true);assert.equal(document.querySelector('#territory-stamp').hidden,true);
 }finally{Object.assign(globalThis,original);dom.window.close();}
});

test('recency depends on the observation date, never reviewedAt',()=>{const d=snapshot('congo');d.metadata.reviewedAt='2026-11-08';assert.equal(isRecentControl(d,Date.parse('2026-11-08')),false);d.metadata.date='2026-11-07';assert.equal(isRecentControl(d,Date.parse('2026-11-08')),true);assert.equal(isRecentControl(d,Date.parse('2026-11-16')),false);});
