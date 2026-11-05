const key='atlas:public-readings:v1',limit=60;
const ready=d=>d?.status==='ready'&&Array.isArray(d.what)&&d.what.length&&Array.isArray(d.context)&&Array.isArray(d.sources)&&d.sources.length&&typeof d.generatedAt==='string';
export function createReadingCache(storage){
 let rows=[];try{const saved=JSON.parse(storage?.getItem(key)||'[]');if(Array.isArray(saved))rows=saved.filter(r=>typeof r?.id==='string'&&ready(r.data)).slice(-limit);}catch{}
 return {get:id=>rows.find(r=>r.id===id)?.data||null,set(id,data){if(!ready(data))return;rows=rows.filter(r=>r.id!==id);rows.push({id,data});rows=rows.slice(-limit);try{storage?.setItem(key,JSON.stringify(rows));}catch{}}};
}
