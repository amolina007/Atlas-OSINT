import test from 'node:test';
import assert from 'node:assert/strict';
import {createResearchStore,cleanResearch,LOCAL_KEY} from '../dist/observatorio-research.mjs';
const clone=x=>structuredClone(x);
function fixture(){
 const rows=[],values=new Map();let fail=false,hold=null;
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const db={from(){let op='select',value,filters=[];const q={select(){return q},order(){return q},limit(){return q},eq(k,v){filters.push([k,v]);return q},insert(v){op='insert';value=v;return q},update(v){op='update';value=v;return q},async then(resolve,reject){try{if(hold&&op==='update'){const h=hold;hold=null;await h;}if(fail)return resolve({error:{message:'offline'}});let data;if(op==='insert'){data=[{...clone(value),user_id:'A',version:1,archived:false}];rows.push(...data);}else{data=rows.filter(r=>filters.every(([k,v])=>r[k]===v));if(op==='update')data.forEach(r=>Object.assign(r,clone(value),{version:r.version+1}));}resolve({data:clone(data),error:null});}catch(e){reject(e)}}};return q;}};
 const make=()=>createResearchStore({db,storage});
 return {rows,storage,make,setFail:v=>fail=v,hold:p=>hold=p};
}
test('normalizes malformed documents and preserves local notebook when creating multiple account documents',async()=>{
 assert.equal(cleanResearch(null).events.length,0);const f=fixture();f.storage.setItem(LOCAL_KEY,JSON.stringify({title:'Local',facts:'Original'}));const s=f.make();await s.session({id:'A'});await s.create({title:'Uno'});const one=s.active;await s.create({title:'Dos'});assert.equal(f.rows.length,2);await s.choose(one);assert.equal(s.current().title,'Uno');assert.equal(s.local().facts,'Original');await s.choose('local');assert.equal(s.current().title,'Local');
});
test('updates made during a save are written with the returned version',async()=>{
 const f=fixture(),s=f.make();await s.session({id:'A'});await s.create({title:'Uno'});let release;f.hold(new Promise(r=>release=r));s.change({...s.current(),facts:'First'});const saving=s.flush();await Promise.resolve();s.change({...s.current(),facts:'Latest'});release();assert.equal(await saving,true);assert.equal(f.rows[0].body.facts,'Latest');assert.equal(f.rows[0].version,3);assert.equal(s.pending,0);
});
test('two clients cannot overwrite each other; conflict can be saved as a copy',async()=>{
 const f=fixture(),a=f.make();await a.session({id:'A'});await a.create({title:'Shared'});const b=f.make();await b.session({id:'A'});a.change({...a.current(),facts:'PC'});await a.flush();b.change({...b.current(),facts:'Mobile'});assert.equal(await b.flush(),false);assert.ok(b.conflict);assert.equal(f.rows[0].body.facts,'PC');assert.equal(b.current().facts,'Mobile');assert.equal(await b.create({...b.current(),title:'Copy'},{resolveConflict:true}),true);assert.equal(f.rows[1].body.facts,'Mobile');assert.equal(b.pending,0);
});
test('offline draft survives restart and is isolated from other accounts',async()=>{
 const f=fixture(),a=f.make();await a.session({id:'A'});await a.create({title:'Saved'});f.setFail(true);a.change({...a.current(),questions:'Offline question'});assert.equal(await a.flush(),false);await a.session(null);assert.equal(a.current().questions,'');f.setFail(false);const b=f.make();await b.session({id:'B'});assert.equal(b.current().questions,'');await b.session({id:'A'});assert.equal(b.current().questions,'Offline question');assert.equal(f.rows[0].body.questions,'Offline question');assert.equal(b.pending,0);
});
test('archive is reversible and refreshed contents are shared between clients',async()=>{
 const f=fixture(),a=f.make();await a.session({id:'A'});await a.create({title:'Test'});const b=f.make();await b.session({id:'A'});a.change({...a.current(),hypotheses:'Updated'});await a.flush();await b.refresh();assert.equal(b.current().hypotheses,'Updated');await b.archive();assert.equal(f.rows[0].archived,true);await b.archive();assert.equal(f.rows[0].archived,false);
});
