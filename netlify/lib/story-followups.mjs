import {hasCompleteReading} from '../../dist/observatorio-reading-quality.mjs';
import {duplicateStoryEvent,normalizeStoryText} from '../../dist/observatorio-story-updates.mjs';
import {newsEvidence} from '../../dist/observatorio-news-geo.mjs';
export function publicStory(doc){
 const events=[...(doc.events||[])].sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
 const excerpt=e=>({title:String(e.title).slice(0,500),date:e.date,facts:(e.reading?.what||[]).map(p=>String(p.text).slice(0,1400)),context:(e.reading?.context||[]).map(p=>String(p.text).slice(0,1400))});
 return {origin:events[0]?excerpt(events[0]):null,recent:events.slice(-8).map(excerpt)};
}
export function eligibleCandidates(doc,articles,now=Date.now()){
 const origin=Math.min(...doc.events.map(e=>Date.parse(e.date)));
 return articles.filter(a=>Date.parse(a.publishedAt)>=origin&&Date.parse(a.publishedAt)<=now+300000&&!duplicateStoryEvent(doc.events,{...a,date:a.publishedAt})).slice(0,35);
}
export function acceptedUpdate(doc,article,reading,decision,now=Date.now()){
 if(!hasCompleteReading(reading)||decision?.related!==true||!Array.isArray(decision.newFacts)||duplicateStoryEvent(doc.events,article))return null;
 const old=new Set(doc.events.flatMap(e=>(e.reading?.what||[]).map(p=>normalizeStoryText(p.text))));
 const changes=[...new Set(decision.newFacts)].filter(i=>Number.isInteger(i)&&i>=0&&i<reading.what.length).map(i=>reading.what[i]).filter(p=>!old.has(normalizeStoryText(p.text)));
 if(!changes.length)return null;
 return {...newsEvidence({...article,reading}),automatic:true,followedAt:new Date(now).toISOString(),changes:changes.map(p=>({text:p.text,source:p.source||1}))};
}
export async function persistFollowup(read,write,{event,checkedAt,expectedVersion,revalidate}={}){
 for(let attempt=0;attempt<3;attempt++){
  const row=await read();if(!row||row.archived)return {added:0,paused:true};
  const body=structuredClone(row.body);let added=0;
  if(event&&revalidate&&row.version!==expectedVersion&&!await revalidate(body))return {added:0};
  if(event&&!duplicateStoryEvent(body.events,event)){if(body.events.length>=100)return {added:0,full:true};body.events.push(event);added=1;}
  if(checkedAt)body.tracking={...body.tracking,checkedAt};
  if(!added&&!checkedAt)return {added:0};
  if(new TextEncoder().encode(JSON.stringify(body)).length>950000)throw Error('story_capacity');
  if(await write(row,body))return {added};
 }
 throw Error('concurrent_update');
}
