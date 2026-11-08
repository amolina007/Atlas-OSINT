export function groupedNews(rows,briefing){
 const byId=new Map(rows.map(a=>[a.id,a])),claimed=new Set(),groups=new Map();
 for(const g of briefing?.groups||[]){
  const members=g.articleIds.map(id=>byId.get(id)).filter(a=>a&&!claimed.has(a.id));if(!members.length)continue;
  // Keep the current filter/order: the first matching article represents the group.
  members.sort((a,b)=>rows.indexOf(a)-rows.indexOf(b));
  members.forEach(a=>claimed.add(a.id));groups.set(members[0].id,{...g,members});
 }
 return rows.filter(a=>!claimed.has(a.id)||groups.has(a.id)).map(a=>({...a,coverage:groups.get(a.id)}));
}
export function briefingMarkup(group,esc,date){
 if(!group)return '';
 const safe=url=>{try{return new URL(url).protocol==='https:'?url:'#';}catch{return '#';}};
 const paragraph=(label,p)=>p?`<div class="briefing-point"><h3>${label}</h3><p>${esc(p.text)} <a href="${esc(safe(p.url))}" target="_blank" rel="noopener noreferrer">${esc(p.source)} ↗</a></p>${p.evidence?`<details class="claim-evidence"><summary>Ver respaldo en la fuente</summary><blockquote>${esc(p.evidence.excerpt)}</blockquote><p class="muted">${p.publishedAt?`Publicación: ${esc(date(p.publishedAt))} · `:""}Revisión: ${esc(date(p.evidence.checkedAt))}</p><a href="${esc(safe(p.url))}" target="_blank" rel="noopener noreferrer">Leer el texto original ↗</a></details>`:""}</div>`:'';
 const sources=new Map();for(const a of group.members)for(const s of a.reading?.sources||[a.reading?.source].filter(Boolean)){if(s?.url&&safe(s.url)!=='#')sources.set(s.url,{...s,name:s.name||a.source});}
 return `<div class="coverage-context">${paragraph('Qué pasó',group.what)}${paragraph('Por qué importa',group.why)}${group.change?`<details class="coverage-change"><summary>Qué cambió · ${esc(date(group.change.publishedAt))}</summary>${paragraph('Antes',group.before)}${paragraph('Ahora',group.change)}</details>`:''}<details class="coverage-sources"><summary>${group.members.length} ${group.members.length===1?'publicación':'publicaciones'} · ${sources.size} ${sources.size===1?'fuente citada':'fuentes citadas'}</summary><ul>${[...sources.values()].map(s=>`<li><a href="${esc(safe(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a></li>`).join('')}</ul>${group.members.map(a=>`<button class="coverage-read" data-read="${esc(a.id)}">${esc(a.title)} →</button>`).join('')}</details></div>`;
}
export function renderEssentials(root,rows,briefing,{esc,date,open,visible=true}){
 const cutoff=Date.now()-24*3600000;
 const picks=rows.filter(a=>a.coverage?.essential&&Date.parse(a.publishedAt)>=cutoff).sort((a,b)=>briefing.groups.findIndex(g=>g.id===a.coverage.id)-briefing.groups.findIndex(g=>g.id===b.coverage.id)).slice(0,5);
 root.hidden=!visible||!picks.length;if(root.hidden){root.innerHTML='';return;}
 root.innerHTML=`<div class="essential-heading"><div><span class="eyebrow">TU PANORAMA EN POCOS MINUTOS</span><h2>Lo esencial de hoy</h2></div><span>Actualizado ${esc(date(briefing.updatedAt))}</span></div><p class="essential-intro">Selección automática de las últimas 24 horas, con contexto y fuentes. Abre cada historia para contrastar sus coberturas.</p><div class="essential-grid">${picks.map((a,i)=>`<article class="essential-card"><span class="essential-number">0${i+1}</span><div><h3><button data-essential="${esc(a.id)}">${esc(a.title)}</button></h3><p>${esc(a.coverage.what.text)}</p><a href="${esc(a.coverage.what.url)}" target="_blank" rel="noopener noreferrer">${esc(a.coverage.what.source)} ↗</a><details><summary>Por qué importa${a.coverage.change?' · Qué cambió':''}</summary>${briefingMarkup(a.coverage,esc,date)}</details></div></article>`).join('')}</div>`;
 root.querySelectorAll('[data-essential]').forEach(b=>b.onclick=()=>open(rows.find(a=>a.id===b.dataset.essential)));
 root.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>open(rows.flatMap(a=>a.coverage?.members||[a]).find(a=>a.id===b.dataset.read)));
}
