export function hasCompleteReading(data){
 const sources=data?.sources|| (data?.source?[{id:1,...data.source}]:[]);
 const valid=p=>typeof p?.text==='string'&&p.text.trim().length>0&&sources.some(s=>(s.id||1)===(p.source||1)&&/^https:\/\//.test(s.url||''));
 return data?.status==='ready'&&Array.isArray(data.what)&&data.what.some(valid)&&Array.isArray(data.context)&&data.context.some(valid);
}
