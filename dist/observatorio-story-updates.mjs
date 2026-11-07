import {hasCompleteReading} from './observatorio-reading-quality.mjs';
export const normalizeStoryText=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function canonicalStoryURL(value){try{const u=new URL(value);if(u.protocol!=='https:')return '';u.hash='';for(const k of [...u.searchParams.keys()])if(/^utm_/i.test(k)||['oc','fbclid','gclid'].includes(k))u.searchParams.delete(k);u.searchParams.sort();return u.href.replace(/\/$/,'');}catch{return '';}}
export function duplicateStoryEvent(events,candidate){
 const id=e=>String(e.id).replace(/^news:/,''),urls=e=>[e.url,e.reading?.source?.url].map(canonicalStoryURL).filter(Boolean);
 return events.some(e=>id(e)===id(candidate)||urls(e).some(u=>urls(candidate).includes(u))||normalizeStoryText(e.title)===normalizeStoryText(candidate.title));
}
export function storyChanges(doc,since=doc.tracking?.lastSeen){const cutoff=Date.parse(since||'1970-01-01');return doc.events.filter(e=>e.automatic&&Date.parse(e.followedAt)>cutoff&&hasCompleteReading(e.reading)).sort((a,b)=>Date.parse(b.followedAt)-Date.parse(a.followedAt));}
export function createStoryUpdater({list,request,refresh,onStatus=()=>{},now=Date.now}){
 let running=false,generation=0,nextRun=0;const attempts=new Map();
 return {cancel(){generation++;attempts.clear();nextRun=0;},get running(){return running;},async tick(forceId){
  if(running||(!forceId&&now()<nextRun))return;
  const rows=list().filter(r=>!r.archived&&r.doc.events.length&&r.doc.events.length<100);
  const row=forceId?rows.find(r=>r.id===forceId):rows.filter(r=>now()-Math.max(Date.parse(r.doc.tracking?.checkedAt)||0,attempts.get(r.id)||0)>=15*60000).sort((a,b)=>Math.max(Date.parse(a.doc.tracking?.checkedAt)||0,attempts.get(a.id)||0)-Math.max(Date.parse(b.doc.tracking?.checkedAt)||0,attempts.get(b.id)||0))[0];
  if(!row)return;running=true;const token=generation;attempts.set(row.id,now());onStatus(row.id,'loading');
  try{const result=await request({mode:'discover',id:row.id});if(token!==generation)return;
   let added=0;
   for(const a of result.articles||[]){if(token!==generation)return;const saved=await request({mode:'assess',id:row.id,articleId:a.id,query:result.query});if(token!==generation)return;added+=saved.added||0;}
   if(token!==generation)return;await request({mode:'complete',id:row.id});if(token!==generation)return;await refresh();running=false;onStatus(row.id,'ready',added);
  }catch{running=false;if(token===generation)onStatus(row.id,'error');}finally{running=false;nextRun=now()+60000;}
 }};
}
