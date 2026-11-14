import {indicators,chileDay} from '../../dist/observatorio-economy-data.mjs';
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}(-\d{2})?$/.test(s)&&Number.isFinite(Date.parse(s.length===7?s+'-01':s));
const finite=v=>typeof v==='number'&&Number.isFinite(v);
export function normalizeEconomy(id,d,now=new Date()){
 if(!indicators[id]||!d||d.indicador!==id)throw Error('invalid_indicator');
 const today=chileDay(now),raw=d.serie||d.cambios;
 if(!Array.isArray(raw))throw Error('invalid_series');
 const rows=new Map();
 for(const r of raw){const date=r.fecha||r.mes,value=id==='ipc'?r.variacionMensual:id==='tpm'?r.tasa:r.valor;if(!validDate(date)||!finite(value)||date>today||(id==='tpm'&&r.tipo&&r.tipo!=='nominal'))continue;rows.set(date.length===7?date+'-01':date,{date:date.length===7?date+'-01':date,value});}
 const earliest=new Date(now);earliest.setUTCFullYear(earliest.getUTCFullYear()-6);
 const series=[...rows.values()].sort((a,b)=>a.date.localeCompare(b.date)).filter(r=>r.date>=earliest.toISOString().slice(0,10));
 const date=d.fecha||d.mes,value=id==='ipc'?d.variacionMensual:d.valor;
 if(!validDate(date)||date>today||!finite(value)||!series.length)throw Error('invalid_value');
 const sourceUrl=new URL(d.fuente?.url);if(sourceUrl.protocol!=='https:'||!['sii.cl','www.sii.cl','si3.bcentral.cl','www.bcentral.cl','www.ine.gob.cl','ine.gob.cl'].includes(sourceUrl.hostname))throw Error('invalid_source');
 const lagDays=(Date.parse(today)-Date.parse(date.length===7?date+'-01':date))/86400000;
 return {id,value,date,series,source:{name:d.fuente.nombre,url:sourceUrl.href},provider:'indicadores.cl',providerUrl:'https://indicadores.cl/api/',providerUpdatedAt:d.meta?.datosObtenidos||null,annual:id==='ipc'&&d.acumulados?.hasta===date&&finite(d.acumulados.ultimos12Meses)?d.acumulados.ultimos12Meses:null,effectiveSince:id==='tpm'&&validDate(d.vigenteDesde)?d.vigenteDesde:null,delayed:lagDays>(id==='imacec'?100:id==='ipc'?75:7)};
}
export async function retainedSeries({old,load,now=Date.now()}){if(old&&now-Date.parse(old.retrievedAt)<3600000)return {...old,stale:false};try{return {...await load(),retrievedAt:new Date(now).toISOString(),stale:false};}catch(e){if(old)return {...old,stale:true};throw e;}}
