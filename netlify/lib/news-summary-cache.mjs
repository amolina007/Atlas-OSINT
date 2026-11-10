// Only validated public summaries are persisted. Version keys when generation rules change.
export const SUMMARY_VERSION='v1';
export const isReadySummary=data=>data?.status==='ready'&&Array.isArray(data.what)&&data.what.length>0&&Array.isArray(data.context)&&Array.isArray(data.sources)&&data.sources.length>0&&typeof data.generatedAt==='string';
export function createSummaryCache({getStore,build,onError=()=>{},now=Date.now,retryMs=3600000}){
 const pending=new Map(),memory=new Map();
 return async(id,query)=>{
  const key=SUMMARY_VERSION+'/'+id;
  if(memory.has(key))return {data:memory.get(key),cache:'memory'};
  if(pending.has(key))return pending.get(key);
  const task=(async()=>{
   let store;try{store=getStore();const saved=await store.get(key,{type:'json'});if(isReadySummary(saved)){remember(key,saved);return {data:saved,cache:'stored'};}}catch(error){onError('read',error);}
   if(store){try{const failure=await store.get('retry/'+key,{type:'json'});if(failure?.until>now())return {data:failure.data,cache:'cooldown'};}catch(error){onError('read',error);}}
   const data=await build(id,query);
   if(isReadySummary(data)){
    remember(key,data);
    if(store)try{await store.setJSON(key,data);}catch(error){onError('write',error);}
   }
   if(!isReadySummary(data)&&store&&!/atlas_ai_(not_configured|paused)/.test(data?.reasonCode||''))try{await store.setJSON('retry/'+key,{until:now()+retryMs,data});}catch(error){onError('write',error);}
   return {data,cache:'generated'};
  })();
  pending.set(key,task);try{return await task;}finally{pending.delete(key);}
 };
 function remember(key,data){if(memory.size>=100)memory.delete(memory.keys().next().value);memory.set(key,data);}
}
