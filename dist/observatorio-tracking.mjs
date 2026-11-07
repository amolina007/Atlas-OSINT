import {createResearchStore} from './observatorio-research.mjs';
import {articleTags} from './observatorio-discovery.mjs';
import {hasCompleteReading} from './observatorio-reading-quality.mjs';

export async function storyId(uid,eventId){
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`atlas-story:${uid}:${eventId}`));
 const h=[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
 return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
}
export function storyEvents(doc){return [...doc.events].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));}
export function unreadCount(doc){return doc.events.filter(e=>Date.parse(e.followedAt||e.capturedAt||e.date)>Date.parse(doc.tracking?.lastSeen||'1970-01-01')).length;}
export function appendStoryEvent(doc,event){
 if(doc.events.some(e=>e.id===event.id))return doc;
 if(doc.events.length>=100)throw Error('Esta historia ya tiene 100 publicaciones.');
 return {...doc,events:[...doc.events,{...event,followedAt:new Date().toISOString()}]};
}
export function initTracking({db,esc,date,view,readNews,showMap,search,login}){
 const $=id=>document.getElementById(id),root=$('seguimiento');
 let state={rows:[],uid:null,loaded:false,active:'local'},selected=null,pending=null,busy=false,filter='',archived=false,store;
 const safe=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'#';}catch{return '#';}};
 const status=(message,kind='info')=>{for(const id of ['tracking-status','story-save-status']){const el=$(id);el.textContent=message;el.classList.toggle('error',kind==='error'||kind==='conflict');}};
 root.innerHTML=`<div class="heading"><div><span class="eyebrow">TUS HISTORIAS, CON CONTEXTO</span><h1>En seguimiento</h1><p>Vuelve a lo que te importa. Reúne sus novedades, consulta las fuentes y sigue su evolución.</p></div><button id="tracking-refresh">↻ Sincronizar</button></div><p id="tracking-status" role="status"></p><div class="tracking-tools"><label>Buscar en mis historias<input id="tracking-search" type="search" placeholder="Tema, lugar o protagonista"></label><button id="tracking-archived" aria-pressed="false">Ver pausadas</button><button id="tracking-login">Ingresar con Convergencia</button><button id="tracking-import" hidden>Recuperar guardados de este navegador</button></div><button id="tracking-conflict" hidden>Conservar mi versión como otra historia</button><div class="tracking-layout"><div id="tracking-list"></div><section id="tracking-detail" class="panel" aria-live="polite"></section></div>`;
 const dialog=document.createElement('dialog');dialog.id='story-follow-dialog';dialog.setAttribute('aria-labelledby','story-follow-title');dialog.innerHTML=`<button class="close" id="story-follow-close" aria-label="Cerrar">×</button><span class="eyebrow">EN SEGUIMIENTO</span><h2 id="story-follow-title">Seguir esta historia</h2><p id="story-headline"></p><form id="story-follow-form"><label>Guardar en<select id="story-target"></select></label><label id="story-name-label">Nombre de la historia<input id="story-name" required maxlength="150"></label><p class="muted">Privada · se guarda en tu cuenta de Convergencia para PC y móvil.</p><button class="primary" id="story-follow-submit">Seguir esta historia</button></form><p id="story-save-status" role="status"></p>`;document.body.append(dialog);
 let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};}
 const enabled=['dev.atlas.convergenciaaura.cl','dev--atlas-osint.netlify.app','localhost','127.0.0.1'].includes(location.hostname);
 store=createResearchStore({db,storage,enabled,onList:next=>{if(next.uid!==state.uid){selected=null;pending=null;dialog.close();}state=next;render();renderPreview();},onStatus:status});
 const lookup=id=>state.rows.find(r=>r.id===id);
 function renderPreview(){
  const rows=state.rows.filter(r=>!r.archived).slice(0,3);
  $('research-preview').innerHTML=rows.map(r=>`<button class="tracking-preview" data-story="${esc(r.id)}"><strong>${esc(r.title)}</strong><small>${r.doc.events.length} publicaciones${unreadCount(r.doc)?` · ${unreadCount(r.doc)} sin revisar`:''}</small></button>`).join('')||'<p class="muted">Pulsa «Seguir esta historia» en una noticia o en el mapa.</p>';
  $('research-preview-status').textContent=state.uid?'Privado · cuenta de Convergencia.':'Ingresa para guardar y recuperar tus historias.';
  $('research-preview').querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>open(b.dataset.story));
 }
 function render(){
  $('tracking-login').hidden=!!state.uid;$('tracking-refresh').hidden=!state.uid;$('tracking-refresh').disabled=!state.uid||busy;$('tracking-conflict').hidden=!state.conflict;
  $('tracking-import').hidden=!state.uid||!state.loaded||!store?.local().events.length;
  const rows=state.rows.filter(r=>r.archived===archived&&r.title.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  $('tracking-list').innerHTML=rows.map(r=>{const items=storyEvents(r.doc),count=unreadCount(r.doc);return `<button class="story-card ${selected===r.id?'active':''}" data-story="${esc(r.id)}" aria-pressed="${selected===r.id}"><span class="eyebrow">${r.archived?'PAUSADA':count?`${count} SIN REVISAR`:'AL DÍA CON LO GUARDADO'}</span><h2>${esc(r.title)}</h2><p>${items.length} ${items.length===1?'publicación':'publicaciones'} · ${new Set(items.map(e=>e.source)).size} ${new Set(items.map(e=>e.source)).size===1?'fuente':'fuentes'}</p>${items[0]?`<small>Última publicación guardada: ${esc(date(items[0].date))}</small>`:''}</button>`;}).join('')||`<div class="empty"><h2>${!state.uid?'Tus historias, contigo':!state.loaded?'Cargando tus historias…':archived?'No hay historias pausadas':filter?'Sin coincidencias':'Empieza a seguir una historia'}</h2><p>${!state.uid?'Ingresa con Convergencia para verlas en todos tus dispositivos.':'Desde Noticias o Mapa, pulsa «Seguir esta historia».'}</p><button id="tracking-browse">Explorar noticias →</button></div>`;
  $('tracking-browse')?.addEventListener('click',()=>view('feed'));
  $('tracking-list').querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>open(b.dataset.story));
  const row=lookup(selected);$('tracking-detail').hidden=!row;
  if(!row)return;
  const items=storyEvents(row.doc),latest=items.find(e=>hasCompleteReading(e.reading)),reading=latest?.reading;
  const tags=[...new Set(items.flatMap(e=>articleTags(e)))].slice(0,12);
  const section=(title,paragraphs)=>`<section><h3>${title}</h3>${paragraphs.map(p=>{const source=reading.sources?.find(s=>(s.id||1)===(p.source||1))||reading.source;return `<p>${esc(p.text)} ${source?`<a href="${esc(safe(source.url))}" target="_blank" rel="noopener noreferrer">[${p.source||1}]</a>`:''}</p>`;}).join('')}</section>`;
  $('tracking-detail').innerHTML=`<button id="story-back" class="story-back">← Mis historias</button><span class="eyebrow">${row.archived?'SEGUIMIENTO PAUSADO':'HISTORIA EN SEGUIMIENTO'}</span><h2>${esc(row.title)}</h2><div class="story-toolbar"><button id="story-news">Buscar novedades ↗</button><button id="story-pause">${row.archived?'Volver a seguir':'Dejar de seguir'}</button></div><p class="muted">${items.length} ${items.length===1?'publicación guardada':'publicaciones guardadas'} · las novedades se incorporan cuando las agregas a esta historia.</p>${reading?`<p class="muted">Publicación seguida del ${esc(date(latest.date))} · ${esc(latest.source)}</p>${section('Qué pasó',reading.what)}${section('Contexto',reading.context)}<section><h3>Fuentes de la síntesis</h3>${(reading.sources||[reading.source]).filter(Boolean).map(source=>`<p><a href="${esc(safe(source.url))}" target="_blank" rel="noopener noreferrer">[${source.id||1}] ${esc(source.name||'Fuente')} ↗</a>${source.publishedAt?` · ${esc(date(source.publishedAt))}`:''}</p>`).join('')}</section>`:''}<div class="news-tags">${tags.map(t=>`<button data-story-tag="${esc(t)}">#${esc(t)}</button>`).join('')}</div><h3>Cronología y fuentes</h3><ol class="story-timeline">${items.map((e,i)=>`<li><time>${esc(date(e.date))}</time><h4>${esc(e.title)}</h4><p>${esc(e.source)}</p><div class="story-toolbar">${e.provider==='news'&&hasCompleteReading(e.reading)?`<button data-story-read="${i}">Leer síntesis</button>`:''}${e.coordinates?`<button data-story-map="${i}">Ver en mapa</button>`:''}<a href="${esc(safe(e.url))}" target="_blank" rel="noopener noreferrer">Fuente original ↗</a></div></li>`).join('')}</ol>${['facts','hypotheses','questions'].some(k=>row.doc[k])?`<details><summary>Notas guardadas anteriormente</summary>${['facts','hypotheses','questions'].filter(k=>row.doc[k]).map(k=>`<p class="legacy-note">${esc(row.doc[k])}</p>`).join('')}</details>`:''}`;
  $('story-back').onclick=()=>{selected=null;render();};
  $('story-news').onclick=()=>search(row.title);
  $('story-pause').onclick=async()=>{if(busy)return;busy=true;try{if(await store.choose(row.id)&&await store.archive()){selected=null;render();}}finally{busy=false;render();}};
  $('tracking-detail').querySelectorAll('[data-story-read]').forEach(b=>b.onclick=()=>readNews(items[Number(b.dataset.storyRead)]));
  $('tracking-detail').querySelectorAll('[data-story-map]').forEach(b=>b.onclick=()=>showMap(items[Number(b.dataset.storyMap)]));
  $('tracking-detail').querySelectorAll('[data-story-tag]').forEach(b=>b.onclick=()=>search(b.dataset.storyTag));
 }
 async function open(id){
  if(busy)return;busy=true;
  try{if(!await store.choose(id))return;selected=id;view('seguimiento');render();const doc=store.current();if(unreadCount(doc)){doc.tracking.lastSeen=new Date().toISOString();store.change(doc);await store.flush();}if(matchMedia('(max-width:800px)').matches)$('tracking-detail').scrollIntoView({block:'start',behavior:'smooth'});}finally{busy=false;render();}
 }
 function follow(event){
  if(!enabled){view('seguimiento');status('Seguimientos disponibles en dev.','error');return;}
  if(!state.uid){view('seguimiento');login();return;}
  if(!state.loaded){view('seguimiento');status('Cargando tu cuenta. Pulsa Sincronizar para reintentar.');return;}
  const existing=state.rows.find(r=>!r.archived&&r.doc.events.some(e=>e.id===event.id));if(existing){open(existing.id);return;}
  pending=event;$('story-headline').textContent=event.title;$('story-name').value=event.title.slice(0,150);
  $('story-target').innerHTML='<option value="new">Nueva historia</option>'+state.rows.filter(r=>!r.archived).map(r=>`<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
  $('story-target').value='new';$('story-name-label').hidden=false;$('story-name').required=true;$('story-save-status').textContent='';dialog.showModal();
 }
 $('story-target').onchange=()=>{$('story-name-label').hidden=$('story-target').value!=='new';$('story-name').required=$('story-target').value==='new';};
 $('story-follow-close').onclick=()=>{dialog.close();pending=null;};
 $('story-follow-form').onsubmit=async e=>{
  e.preventDefault();if(busy||!pending||!state.uid)return;busy=true;$('story-follow-submit').disabled=true;
  const event=pending,uid=state.uid;
  try{let ok=false;
   if($('story-target').value==='new'){
    const id=await storyId(uid,event.id);if(uid!==state.uid)return;
    const prior=lookup(id);if(prior){ok=await store.choose(id);if(ok&&prior.archived)ok=await store.archive();}
    else ok=await store.create(appendStoryEvent({title:$('story-name').value.trim(),events:[]},event),{id});
   }else if(await store.choose($('story-target').value)){store.change(appendStoryEvent(store.current(),event));ok=await store.flush();}
   if(ok&&uid===state.uid){selected=store.active;pending=null;dialog.close();view('seguimiento');render();}
  }catch(error){status(error.message||'No se pudo guardar. Reintenta.','error');}finally{busy=false;$('story-follow-submit').disabled=false;render();}
 };
 $('tracking-search').oninput=e=>{filter=e.target.value;render();};
 $('tracking-archived').onclick=()=>{archived=!archived;selected=null;$('tracking-archived').textContent=archived?'Ver activas':'Ver pausadas';$('tracking-archived').setAttribute('aria-pressed',String(archived));render();};
 $('tracking-login').onclick=login;$('tracking-refresh').onclick=()=>store.refresh();
 $('tracking-import').onclick=async()=>{if(busy)return;busy=true;try{if(await store.create(store.local())){selected=store.active;render();}}finally{busy=false;}};
 $('tracking-conflict').onclick=async()=>{if(busy)return;busy=true;try{if(await store.create(store.current(),{resolveConflict:true})){selected=store.active;render();}}finally{busy=false;}};
 store.start();
 if(db){db.auth.getSession().then(({data})=>store.session(data?.session?.user));db.auth.onAuthStateChange((_event,session)=>setTimeout(()=>store.session(session?.user),0));}
 const refresh=()=>{if(!busy&&!store.pending)store.refresh();};
 window.addEventListener('focus',refresh);window.addEventListener('online',()=>store.refresh());setInterval(()=>{if(!document.hidden)refresh();},30000);
 window.addEventListener('beforeunload',e=>{if(store.pending){e.preventDefault();e.returnValue='';}});
 return {follow,render,renderPreview};
}
