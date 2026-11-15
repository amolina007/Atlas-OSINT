export const preferenceTable='atlas_dev_economic_chart_preferences';
const ids=['dolar','uf','ipc','tpm','cobre','imacec'],keys=['sma20','sma50','ema20','bands','rsi'];
export function normalizePreferences(value={}){
 const interval=['daily','weekly','monthly'].includes(value.interval)?value.interval:'daily';
 return {months:[1,3,6,12,60].includes(value.months)?value.months:12,interval,style:value.style==='candles'&&interval!=='daily'?'candles':'line',studies:Array.isArray(value.studies)?[...new Set(value.studies.filter(k=>keys.includes(k)))]:['sma20','sma50']};
}
// Owner generations isolate asynchronous reads/writes when the Core account changes.
export function createPreferences(db,onChange){
 let owner=null,generation=0,values={},dirty=new Set(),running=false,reading=false,loaded=false,error=false,revision=0;
 const notify=()=>onChange();
 async function refresh(){
  if(!owner||reading||running||dirty.size)return;
  const token=generation,version=revision;reading=true;notify();
  try{const result=await db.from(preferenceTable).select('indicator,months,interval,style,studies').eq('user_id',owner);if(token!==generation)return;if(result.error)throw result.error;if(version===revision){values={};for(const row of result.data||[])if(ids.includes(row.indicator))values[row.indicator]=normalizePreferences(row);loaded=true;error=false;}}
  catch{if(token===generation)error=true;}
  finally{if(token===generation){reading=false;notify();}}
 }
 async function flush(){
  if(!owner||running||!dirty.size)return;
  const token=generation,user=owner;running=true;error=false;notify();
  try{while(dirty.size&&token===generation){const id=dirty.values().next().value,snapshot=JSON.stringify(values[id]);const result=await db.from(preferenceTable).upsert({user_id:user,indicator:id,...values[id]},{onConflict:'user_id,indicator'});if(token!==generation)return;if(result.error)throw result.error;if(JSON.stringify(values[id])===snapshot)dirty.delete(id);}}
  catch{if(token===generation)error=true;}
  finally{if(token===generation){running=false;notify();}}
 }
 return {
  get(id){return values[id]??=normalizePreferences();},
  set(id,value){if(!ids.includes(id)||(owner&&!loaded))return;values[id]=normalizePreferences(value);revision++;if(owner){dirty.add(id);void flush();}notify();},
  account(id){if(id===owner)return;generation++;owner=id;values={};dirty=new Set();running=false;reading=false;loaded=false;error=false;revision++;notify();if(owner)void refresh();},
  refresh,retry(){return dirty.size?flush():refresh();},
  state(){return {disabled:!!owner&&!loaded,status:!owner?'Ingresa con Convergencia para guardar tu gráfico.':error?'No se pudo sincronizar el gráfico. Reintenta.':running||dirty.size?'Guardando gráfico…':!loaded?'Cargando tu gráfico…':'Gráfico sincronizado con tu cuenta.',error};}
 };
}
