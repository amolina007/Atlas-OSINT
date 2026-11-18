import {articleTags,articleLocation} from './observatorio-discovery.mjs';

export function initAtlasFeed({db,esc,date,getArticles,openNews,goHome,goLetters,goPolls,newsActions,followStory}){
 const root=document.getElementById('atlas-feed');
 let kind='all',limit=40,rows=[],loading=false,refreshQueued=false,error='',query='',period='168',order='newest',counts=new Map(),liked=new Set();
 const safe=esc;
 root.innerHTML=`<div class="heading atlas-feed-heading"><div><span class="eyebrow">COMUNIDAD / ATLAS</span><h1>Feed</h1><p>La conversación pública de Atlas: comentarios, cartas y preguntas. Las noticias y sus síntesis están en Inicio.</p></div><button id="atlas-feed-refresh">↻ Actualizar</button></div>
 <section class="atlas-feed-intro"><div><strong>Contexto antes que viralidad</strong><p>Cada aporte identifica a quien lo publica y enlaza el contenido relacionado cuando existe. Las opiniones de la comunidad no son noticias verificadas por Atlas.</p></div><div class="atlas-feed-compose"><button data-feed-letters>✉ Escribir una carta</button><button data-feed-polls>＋ Proponer una pregunta</button></div></section>
 <div class="atlas-feed-controls"><label>Buscar en el Feed<input id="atlas-feed-search" type="search" placeholder="Texto, autor, fuente, hashtag o lugar"></label><label>Periodo<select id="atlas-feed-period"><option value="24">Últimas 24 horas</option><option value="168" selected>Últimos 7 días</option><option value="720">Últimos 30 días</option><option value="0">Todo el periodo</option></select></label><label>Orden<select id="atlas-feed-order"><option value="newest">Más recientes</option><option value="oldest">Más antiguas</option></select></label></div>
 <div class="atlas-feed-tabs" role="group" aria-label="Filtrar publicaciones"><button data-atlas-kind="all" aria-pressed="true" class="active">Todo</button><button data-atlas-kind="comment" aria-pressed="false">Conversaciones</button><button data-atlas-kind="letter" aria-pressed="false">Cartas</button><button data-atlas-kind="poll" aria-pressed="false">Encuestas</button></div>
 <p id="atlas-feed-status" role="status"></p><div id="atlas-feed-list" class="atlas-feed-list"></div><button id="atlas-feed-more" hidden>Ver más publicaciones</button>`;
 const $=id=>root.querySelector('#'+id);
 const allArticles=()=> (getArticles()||[]).map(a=>({...a,id:String(a.id||'').replace(/^news:/,''),publishedAt:a.publishedAt||a.date}));
 function shareFallback(url,title){if(navigator.share){navigator.share({title,url}).catch(()=>{});return;}navigator.clipboard?.writeText(url).then(()=>{$('atlas-feed-status').textContent='Enlace copiado. Ya puedes compartirlo.';}).catch(()=>{$('atlas-feed-status').textContent='No se pudo copiar el enlace en este navegador.';});}
 function cardTags(a){return a?articleTags(a).slice(0,8):[];}
 function render(){
  const q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const cutoff=Number(period)?Date.now()-Number(period)*3600000:0;
  let filtered=rows.filter(r=>(kind==='all'||r.kind===kind)&&(!cutoff||Date.parse(r.created_at)>=cutoff));
  filtered=filtered.filter(r=>{const a=r.article;const tags=cardTags(a).join(' ');return !q||`${r.title||''} ${r.body||''} ${r.author||''} ${r.topic||''} ${r.source||''} ${tags} ${r.location?.label||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q);});
  filtered.sort((a,b)=>order==='oldest'?Date.parse(a.created_at)-Date.parse(b.created_at):Date.parse(b.created_at)-Date.parse(a.created_at));
  const page=filtered.slice(0,limit);
  $('atlas-feed-list').innerHTML=page.map(r=>{
   if(r.kind==='comment'){
    const a=r.article, id=a?.id, tags=cardTags(a), place=a&&articleLocation(a);
    const tagHTML=tags.map(t=>`<button class="atlas-feed-tag" data-feed-tag="${safe(t)}">#${safe(t)}</button>`).join('');
    return `<article class="atlas-share-card atlas-feed-comment"><div class="atlas-feed-card-meta"><span class="atlas-feed-type">Conversación · comentario en noticia</span><time datetime="${safe(r.created_at)}">${safe(date(r.created_at))}</time></div><p class="atlas-share-quote">${safe(r.body)}</p><p class="atlas-share-author">${safe(r.author||'Miembro de Convergencia')}</p>${a?`<section class="atlas-feed-related"><span class="eyebrow">NOTICIA RELACIONADA · PUBLICACIÓN DE ${safe(a.source)}</span><h2>${safe(a.title)}</h2><p class="atlas-feed-source">Fuente: ${safe(a.source)} · publicada ${safe(date(a.publishedAt))}</p>${place?`<p class="atlas-feed-place">⌖ ${safe(place.label)} <small>Referencia aproximada por el titular; no confirma dónde ocurrió el hecho.</small></p>`:''}<div class="atlas-feed-tags">${tagHTML}</div><button data-open-news="${safe(id)}" class="text-link">Abrir síntesis, contexto y fuentes ↗</button></section>`:'<p class="atlas-feed-context-muted">Noticia relacionada no disponible en esta consulta.</p>'}<div class="atlas-feed-actions">${id?`<button data-feed-like="${safe(id)}" aria-pressed="${liked.has(id)}">${liked.has(id)?'♥':'♡'} Me gusta noticia <span>${counts.get(id)?.likes??'—'}</span></button><button data-feed-comment="${safe(id)}">Comentar</button><button data-feed-share="${safe(id)}">↗ Compartir</button><button data-feed-follow="${safe(id)}">＋ Seguir historia</button>`:''}</div></article>`;
   }
   if(r.kind==='letter')return `<article class="atlas-share-card atlas-feed-letter"><div class="atlas-feed-card-meta"><span class="atlas-feed-type">Carta · opinión de la comunidad</span><time datetime="${safe(r.created_at)}">${safe(date(r.created_at))}</time></div><h2>${safe(r.title)}</h2><p class="atlas-share-author">${safe(r.signature)}</p><p class="atlas-share-quote">${safe(r.body)}</p><p class="atlas-feed-context-muted">Opinión de quien firma; no representa la postura editorial de Atlas.</p><div class="atlas-feed-actions"><button data-share-section="cartas">↗ Compartir sección</button><button data-feed-letters>Ver cartas al director</button></div></article>`;
   return `<article class="atlas-share-card atlas-feed-poll"><div class="atlas-feed-card-meta"><span class="atlas-feed-type">Encuesta · ${safe(r.topic)}</span><time datetime="${safe(r.created_at)}">Publicada ${safe(date(r.created_at))}</time></div><h2>${safe(r.title)}</h2><p>${safe(r.description||'Participación voluntaria de la comunidad.')}</p><p class="atlas-feed-context-muted">${new Date(r.closes_at).getTime()>Date.now()?'Recepción abierta':'Encuesta cerrada'} · resultados corresponden a quienes respondieron.</p><div class="atlas-feed-actions"><button data-open-polls>Ver pregunta y resultados ↗</button><button data-share-section="tendencias">↗ Compartir encuesta</button></div></article>`;
  }).join('')||`<div class="empty"><h2>${loading?'Cargando publicaciones…':error?'No se pudo actualizar el Feed':'No hay publicaciones con estos filtros'}</h2><p>${loading?'Consultando conversaciones y aportes públicos.':error?'Se conserva lo ya cargado; puedes reintentar.':'Amplía el periodo o prueba otra búsqueda.'}</p></div>`;
  $('atlas-feed-more').hidden=filtered.length<=limit;$('atlas-feed-status').textContent=loading?'Actualizando la conversación…':`${filtered.length} publicaciones · ${rows.length} aportes públicos disponibles`;
  bind();
 }
 function bind(){
  root.querySelectorAll('[data-open-news]').forEach(b=>b.onclick=()=>{const a=allArticles().find(x=>x.id===b.dataset.openNews);if(a)openNews(a);else goHome();});
  root.querySelectorAll('[data-atlas-kind]').forEach(b=>b.onclick=()=>{kind=b.dataset.atlasKind;limit=40;root.querySelectorAll('[data-atlas-kind]').forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.classList.toggle('active',x===b)});render();});
  root.querySelectorAll('[data-feed-tag]').forEach(b=>b.onclick=()=>{goHome();newsActions?.search?.(b.dataset.feedTag);});
  root.querySelectorAll('[data-feed-like]').forEach(b=>b.onclick=async()=>{b.disabled=true;await newsActions?.like?.(b.dataset.feedLike);await refresh();});
  root.querySelectorAll('[data-feed-comment]').forEach(b=>b.onclick=()=>newsActions?.comments?.(b.dataset.feedComment));
  root.querySelectorAll('[data-feed-share]').forEach(b=>b.onclick=()=>newsActions?.share?.(b.dataset.feedShare));
  root.querySelectorAll('[data-feed-follow]').forEach(b=>b.onclick=()=>followStory?.(b.dataset.feedFollow));
  root.querySelectorAll('[data-open-polls],[data-feed-polls]').forEach(b=>b.onclick=goPolls);root.querySelectorAll('[data-feed-letters]').forEach(b=>b.onclick=goLetters);
  root.querySelectorAll('[data-share-section]').forEach(b=>b.onclick=()=>{const href=new URL(location.href);href.hash=b.dataset.shareSection==='cartas'?'cartas':'tendencias';shareFallback(href.href,'Atlas · '+b.dataset.shareSection);});
 }
 async function refresh(){
  if(loading){refreshQueued=true;return;}loading=true;error='';render();
  try{
   if(!db)throw Error();
   const [comments,letters,polls]=await Promise.all([
    db.from('atlas_dev_news_comments').select('article_id,author_name,body,created_at').order('created_at',{ascending:false}).limit(100),
    db.from('atlas_dev_letters').select('title,body,signature,created_at').order('created_at',{ascending:false}).limit(50),
    db.from('atlas_dev_polls').select('id,title,description,topic,created_at,closes_at,closed,archived').eq('archived',false).order('created_at',{ascending:false}).limit(50)
   ]);
   if(comments.error||letters.error||polls.error)throw Error();
   const articles=allArticles(),byId=new Map(articles.flatMap(a=>[[a.id,a],[String(a.id).replace(/^news:/,''),a],[`news:${String(a.id).replace(/^news:/,'')}`,a]]));
   const commentRows=comments.data.map(r=>{const article=byId.get(r.article_id)||byId.get(String(r.article_id).replace(/^news:/,''));return {...r,kind:'comment',author:r.author_name,article, title:article?.title||'',source:article?.source||'',location:article&&articleLocation(article)};}).filter(r=>r.body);
   rows=[...commentRows,...letters.data.map(r=>({...r,kind:'letter',author:r.signature,title:r.title})),...polls.data.filter(p=>!p.archived).map(r=>({...r,kind:'poll'}))].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
   const ids=[...new Set(commentRows.map(r=>r.article?.id).filter(Boolean))].slice(0,200);
   if(ids.length){const [totals,mine]=await Promise.all([db.rpc('atlas_dev_news_counts',{article_ids:ids}),db.auth.getSession().then(({data})=>{const uid=data?.session?.user?.id;return uid?db.from('atlas_dev_news_likes').select('article_id').eq('user_id',uid).in('article_id',ids):{data:[],error:null};})]);if(!totals.error)counts=new Map(totals.data.map(x=>[x.article_id,x]));liked=new Set((mine?.data||[]).map(x=>x.article_id));}
   error='';
  }catch{error='load';}
  finally{loading=false;render();if(refreshQueued){refreshQueued=false;refresh();}}
 }
 $('atlas-feed-refresh').onclick=refresh;$('atlas-feed-search').oninput=e=>{query=e.target.value;render();};$('atlas-feed-period').onchange=e=>{period=e.target.value;render();};$('atlas-feed-order').onchange=e=>{order=e.target.value;render();};$('atlas-feed-more').onclick=()=>{limit+=40;render();};
 db?.auth.onAuthStateChange(()=>{liked.clear();refresh();});
 refresh();return {refresh};
}
