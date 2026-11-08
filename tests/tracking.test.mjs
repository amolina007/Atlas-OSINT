import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {initTracking,storyId,appendStoryEvent,unreadCount} from '../dist/observatorio-tracking.mjs';
import {createResearchStore} from '../dist/observatorio-research.mjs';
const event={id:'news:one',title:'Una historia de prueba',url:'https://example.org/news',source:'Fuente',date:'2026-11-07T10:00:00Z',provider:'news'};
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(){
 const rows=[];let uid='A',fail=false,authCallback;
 const db={auth:{getSession:async()=>({data:{session:{user:{id:uid}}}}),onAuthStateChange:fn=>{authCallback=fn;}},from(){let op='select',value,filters=[];const q={select(){return q},order(){return q},limit(){return q},eq(k,v){filters.push([k,v]);return q},insert(v){op='insert';value=v;return q},update(v){op='update';value=v;return q},async then(resolve){if(fail)return resolve({error:{message:'offline'}});let data;if(op==='insert'){if(rows.some(r=>r.id===value.id))return resolve({error:{code:'23505'}});data=[{...structuredClone(value),user_id:uid,version:1,archived:false}];rows.push(...data);}else{data=rows.filter(r=>r.user_id===uid&&filters.every(([k,v])=>r[k]===v));if(op==='update')data.forEach(r=>Object.assign(r,structuredClone(value),{version:r.version+1}));}resolve({data:structuredClone(data)});}};return q;}};
 return {db,rows,fail:()=>{fail=true;},login:async next=>{uid=next;authCallback?.('SIGNED_OUT',null);await new Promise(r=>setTimeout(r,10));}};
}
test('following deduplicates an article per account, counts unseen and preserves tracked metadata across devices',async()=>{
 const f=fixture(),storage={getItem:()=>null,setItem(){},removeItem(){}};
 const first=createResearchStore({db:f.db,storage}),second=createResearchStore({db:f.db,storage});
 await first.session({id:'A'});await second.session({id:'A'});
 const id=await storyId('A',event.id);assert.notEqual(id,await storyId('B',event.id));
 const doc=appendStoryEvent({title:event.title,events:[]},event);
 assert.equal(appendStoryEvent(doc,event).events.length,1);
 await first.create(doc,{id});await second.create(doc,{id});assert.equal(f.rows.length,1);
 assert.equal(second.current().events[0].title,event.title);assert.equal(unreadCount(second.current()),1);
 const seen=second.current();seen.tracking.lastSeen=new Date(Date.now()+1000).toISOString();second.change(seen);await second.flush();await first.refresh();assert.equal(unreadCount(first.current()),0);
 await second.archive();await first.refresh();assert.equal(f.rows[0].archived,true);
});
test('UI saves to the account, renders saved sources and does not announce success on failed writes',async()=>{
 const dom=new JSDOM(await readFile(new URL('../dist/observatorio.html',import.meta.url),'utf8'),{url:'https://dev.atlas.convergenciaaura.cl/#seguimiento'});
 const keys=['window','document','localStorage','location','matchMedia','setInterval'],previous=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,location:dom.window.location,matchMedia:()=>({matches:false}),setInterval:()=>0});
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 const f=fixture();let destination;
 try{
 const tracking=initTracking({auto:false,db:f.db,esc:s=>String(s??'').replace(/</g,'&lt;'),date:s=>s,view:v=>{destination=v;},readNews(){},showMap(){},search(){},login(){}});await flush();await flush();
 tracking.follow(event);assert.equal(document.querySelector('#story-follow-dialog').open,true);
 await document.querySelector('#story-follow-form').onsubmit({preventDefault(){}});
 assert.equal(f.rows.length,1);assert.equal(destination,'seguimiento');assert.match(document.querySelector('#tracking-detail').textContent,/Línea de tiempo de eventos/);assert.equal(document.querySelector('#story-follow-dialog').open,false);
 tracking.follow(event);await flush();assert.equal(f.rows.length,1);await flush();
 tracking.follow({...event,id:'news:advance',title:'Avance posterior',url:'https://example.org/advance',date:'2026-11-08T10:00:00Z'});document.querySelector('#story-target').value=f.rows[0].id;await document.querySelector('#story-follow-form').onsubmit({preventDefault(){}});
 assert.equal(document.querySelectorAll('.story-timeline li').length,2);assert.equal(document.querySelector('.story-timeline h4').textContent,'Avance posterior');document.querySelector('#timeline-order').click();assert.equal(document.querySelector('.story-timeline h4').textContent,event.title);assert.ok(document.querySelector('time[datetime]'));assert.equal(document.querySelector('#news-source'),null);
 f.fail();tracking.follow({...event,id:'news:two'});await document.querySelector('#story-follow-form').onsubmit({preventDefault(){}});assert.equal(document.querySelector('#story-follow-dialog').open,true);assert.match(document.querySelector('#story-save-status').textContent,/No se pudo/);
 await f.login(null);assert.equal(document.querySelectorAll('.story-card').length,0);assert.equal(document.querySelector('#story-follow-dialog').open,false);assert.equal(document.querySelectorAll('.bottom-ribbon button').length,5);assert.equal(document.querySelector('[data-view="investigacion"]'),null);
 }finally{Object.assign(globalThis,previous);dom.window.close();}
});
