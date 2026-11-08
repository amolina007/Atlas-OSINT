import test from 'node:test';import assert from 'node:assert/strict';
import {duplicateStoryEvent,storyChanges,createStoryUpdater} from '../dist/observatorio-story-updates.mjs';
import {acceptedUpdate,persistFollowup,eligibleCandidates,publicStory} from '../netlify/lib/story-followups.mjs';
const time=Date.parse('2026-11-07T14:00:00Z');
const reading={status:'ready',what:[{text:'Nuevo acuerdo anunciado',source:1}],context:[{text:'Antecedente documentado',source:1}],sources:[{id:1,name:'Medio',url:'https://example.org/new'}]};
const origin={id:'news:old',title:'Conversaciones entre las partes',date:'2026-11-01T00:00:00Z',url:'https://example.org/old',source:'Medio'};
const article={id:'new',title:'Las partes firman un acuerdo',publishedAt:'2026-11-07T12:00:00Z',url:'https://example.org/new',source:'Medio',topics:[]};
const doc={events:[origin],tracking:{lastSeen:'2026-11-06T00:00:00Z'},facts:'Private notes must not reach the model'};
test('deduplication recognizes ids, canonical links and normalized titles',()=>{
 assert.ok(duplicateStoryEvent([origin],{...article,id:'old'}));
 assert.ok(duplicateStoryEvent([origin],{...article,url:origin.url+'?utm_source=x#fragment'}));
 assert.ok(duplicateStoryEvent([origin],{...article,title:'CONVERSACIONES entre las partes!'}));
 assert.equal(duplicateStoryEvent([origin],article),false);
 assert.equal(JSON.stringify(publicStory(doc)).includes('Private notes'),false);
});
test('only new, related, sourced facts are saved; invalid model indices cannot become claims',()=>{
 const good=acceptedUpdate(doc,article,reading,{related:true,changeType:'advance',newFacts:[0,99,0]},time);
 assert.equal(acceptedUpdate(doc,article,reading,{related:true,changeType:'coverage',newFacts:[0]},time),null);
 assert.equal(good.changes.length,1);assert.equal(good.changes[0].text,reading.what[0].text);
 assert.equal(acceptedUpdate(doc,article,reading,{related:false,newFacts:[0]},time),null);
 assert.equal(acceptedUpdate(doc,article,{...reading,context:[]},{related:true,changeType:'advance',newFacts:[0]},time),null);
 assert.equal(acceptedUpdate(doc,article,reading,{related:true,changeType:'advance',newFacts:[-1,'0',99]},time),null);
 assert.equal(acceptedUpdate({...doc,events:[{...origin,reading}]},article,reading,{related:true,changeType:'advance',newFacts:[0]},time),null);
 assert.equal(storyChanges({...doc,events:[origin,good]}).length,1);
 assert.equal(storyChanges({...doc,events:[good]},'2026-11-07T15:00:00Z').length,0);
 assert.equal(eligibleCandidates(doc,[{...article,publishedAt:'2026-10-01T00:00:00Z'}],time).length,0);
});
test('CAS merge preserves concurrent reading state, prevents duplicates and honors pause',async()=>{
 let row={id:'story',version:1,body:structuredClone(doc),archived:false},writes=0;
 const event=acceptedUpdate(doc,article,reading,{related:true,changeType:'advance',newFacts:[0]},time);
 const read=async()=>structuredClone(row);
 const write=async(old,body)=>{writes++;if(writes===1){row.version++;row.body.tracking.lastSeen='2026-11-07T13:00:00Z';return false;}if(old.version!==row.version)return false;row={...row,body,version:row.version+1};return true;};
 assert.equal((await persistFollowup(read,write,{event})).added,1);assert.equal(row.body.tracking.lastSeen,'2026-11-07T13:00:00Z');
 assert.equal((await persistFollowup(read,write,{event})).added,0);assert.equal(row.body.events.length,2);
 row.archived=true;assert.equal((await persistFollowup(read,write,{event:{...event,id:'other',url:'https://other.org',title:'Other'}})).paused,true);
});
test('concurrent new facts are reassessed instead of duplicated',async()=>{
 const row={version:2,archived:false,body:doc};let wrote=false;
 const result=await persistFollowup(async()=>row,async()=>{wrote=true;return true;},{event:article,expectedVersion:1,revalidate:async()=>false});
 assert.equal(result.added,0);assert.equal(wrote,false);
});
test('automatic queue skips paused stories, completes bounded work, and does not advance freshness after failure',async()=>{
 let now=time;const calls=[],states=[];const rows=[{id:'paused',archived:true,doc},{id:'active',archived:false,doc:structuredClone(doc)}];
 const updater=createStoryUpdater({list:()=>rows,now:()=>now,refresh:async()=>{},onStatus:(...a)=>states.push(a),request:async input=>{calls.push(input);if(input.mode==='discover')return {query:'parts agreement',articles:[{id:'new'}]};return {added:1};}});
 await updater.tick();assert.deepEqual(calls.map(c=>c.mode),['discover','assess','complete']);assert.ok(calls.every(c=>c.id==='active'));assert.equal(states.at(-1)[1],'ready');
 await updater.tick();assert.equal(calls.length,3);
 const failed=[];const broken=createStoryUpdater({list:()=>rows,now:()=>now,refresh:async()=>assert.fail('must not refresh after failure'),request:async input=>{failed.push(input.mode);if(input.mode==='assess')throw Error();return {articles:[{id:'new'}]};}});
 await broken.tick();assert.deepEqual(failed,['discover','assess']);assert.equal(rows[1].doc.tracking.checkedAt,undefined);
});
test('account switch cancels the remaining automatic work',async()=>{
 let release;const calls=[];const updater=createStoryUpdater({list:()=>[{id:'a',archived:false,doc}],refresh:async()=>assert.fail(),request:input=>{calls.push(input.mode);return new Promise(r=>release=r);}});
 const job=updater.tick();updater.cancel();release({articles:[{id:'new'}]});await job;assert.deepEqual(calls,['discover']);
});
test('endpoint requires a session and cannot read another owners story',async()=>{
 const {default:handler}=await import('../netlify/functions/story-updates.mjs');const oldNetlify=globalThis.Netlify,oldFetch=globalThis.fetch;
 globalThis.Netlify={env:{get:()=> 'branch-deploy'}};
 try{
  assert.equal((await handler(new Request('https://atlas.test/story',{method:'POST',body:'{}'}))).status,401);
  assert.equal((await handler(new Request('https://atlas.test/story',{method:'POST',headers:{Authorization:'Bearer token'},body:'null'}))).status,400);
  let queries=0;globalThis.fetch=async(url,options)=>{queries++;assert.ok(String(url).startsWith('https://utilbunuziotzumuiayu.supabase.co/rest/v1/atlas_dev_research?id=eq.'));assert.equal(options.headers.Authorization,'Bearer token');return Response.json([]);};
  const response=await handler(new Request('https://atlas.test/story',{method:'POST',headers:{Authorization:'Bearer token'},body:JSON.stringify({mode:'discover',id:'12345678-1234-1234-1234-123456789012'})}));assert.equal(response.status,404);assert.equal(queries,1);
 }finally{globalThis.Netlify=oldNetlify;globalThis.fetch=oldFetch;}
});
