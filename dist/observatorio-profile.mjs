export function initAtlasProfile({db,esc,date,getArticles,openNews,openAccount,openFeed,searchNews}){
 const root=document.getElementById('profile-content');
 let user=null,loading=false,request=0;
 const safe=esc;
 const initials=name=>String(name||'CA').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toLocaleUpperCase('es-CL');
 const topicNames={conflicts:'Conflictos',politics:'Política',economy:'Economía',climate:'Clima',health:'Salud',technology:'Tecnología',society:'Sociedad',world:'Mundo',chile:'Chile'};
 const articleMap=()=>new Map((getArticles()||[]).map(a=>[String(a.id||'').replace(/^news:/,''),a]));
 const displayName=u=>u?.user_metadata?.full_name||u?.user_metadata?.name||'Miembro de Convergencia';
 function renderLoading(){root.innerHTML='<div class="profile-loading" role="status"><span class="loading-spinner" aria-hidden="true"></span> Cargando tu perfil…</div>';}
 function renderSignedOut(){root.innerHTML=`<section class="profile-signin"><span class="profile-icon">◎</span><h2>Tu espacio en Atlas</h2><p>Inicia sesión con Convergencia para sincronizar tus temas y lugares favoritos y revisar tu actividad.</p><button class="primary" data-profile-login>Ingresar con Convergencia</button></section>`;root.querySelector('[data-profile-login]').onclick=openAccount;}
 function followLabel(f,articles){
  if(f.kind==='tag')return '#'+f.value;
  if(f.kind==='place')return '⌖ '+f.value;
  const match=articles.flatMap(a=>a.topics||[]).includes(f.value);
  return topicNames[f.value]|| (match?f.value.replace(/[-_]/g,' ').replace(/\b\w/g,x=>x.toUpperCase()):f.value);
 }
 function activityMarkup(item,articles){
  const icon=item.kind==='share'?'↗':item.kind==='comment'?'◌':'▤';
  const verb=item.kind==='share'?'Compartiste una noticia':item.kind==='comment'?'Comentaste una noticia':'Respondiste una encuesta';
  const article=item.articleId?articles.get(item.articleId):null;
  const title=article?.title||item.title||'Noticia de actualidad';
  const source=article?.source?`<span>${safe(article.source)}</span>`:'';
  const open=item.articleId&&article?`<button class="profile-activity-title" data-profile-open-news="${safe(item.articleId)}">${safe(title)} ↗</button>`:`<strong class="profile-activity-title-text">${safe(title)}</strong>`;
  return `<article class="profile-activity-item"><span class="profile-activity-icon" aria-hidden="true">${icon}</span><div class="profile-activity-main"><div class="profile-activity-meta"><strong>${verb}</strong><time datetime="${safe(item.createdAt)}">${safe(date(item.createdAt))}</time></div>${open}${item.body?`<p class="profile-activity-note">${safe(item.body)}</p>`:''}<div class="profile-activity-source">${source}</div></div></article>`;
 }
 function renderData({shares=[],comments=[],votes=[],follows=[],polls=[],shareCount=0,commentCount=0,voteCount=0},u){
  const articles=articleMap(),pollMap=new Map(polls.map(p=>[p.id,p.title]));
  const activities=[
   ...shares.map(r=>({kind:'share',articleId:String(r.article_id).replace(/^news:/,''),body:r.body,createdAt:r.created_at})),
   ...comments.map(r=>({kind:'comment',articleId:String(r.article_id).replace(/^news:/,''),body:r.body,createdAt:r.created_at})),
   ...votes.map(r=>({kind:'poll',title:pollMap.get(r.poll_id)||'Encuesta de Tendencias',createdAt:r.created_at}))
  ].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,8);
  const display=displayName(u),avatar=document.getElementById('account-avatar'),avatarUrl=avatar&&!avatar.hidden&&avatar.src?avatar.src:'';
  const interestItems=follows.map(f=>({kind:f.kind,label:followLabel(f,articles)}));
  const uniqueSources=[...new Set(activities.map(x=>x.articleId&&articles.get(x.articleId)?.source).filter(Boolean))].slice(0,4);
  const activity=activities.length?activities.map(x=>activityMarkup(x,articles)).join(''):`<div class="profile-empty"><strong>Tu actividad aparecerá aquí</strong><p>Comparte una noticia con contexto, comenta o participa en Tendencias.</p><button data-profile-feed>Explorar el Feed</button></div>`;
  root.innerHTML=`<div class="profile-grid"><section class="profile-identity-card"><div class="profile-ident"><div class="profile-avatar">${avatarUrl?`<img src="${safe(avatarUrl)}" alt="Foto de perfil de ${safe(display)}">`:`<span>${safe(initials(display))}</span>`}</div><div class="profile-name"><span class="eyebrow">CUENTA DE CONVERGENCIA</span><h2>${safe(display)}</h2><p>Noticias, contexto y fuentes abiertas</p></div><button class="profile-settings" data-profile-account aria-label="Administrar cuenta">⚙ <span>Cuenta</span></button></div><div class="profile-stats"><div><strong>${Number(shareCount).toLocaleString('es-CL')}</strong><span>Noticias<br>compartidas</span></div><div><strong>${Number(commentCount).toLocaleString('es-CL')}</strong><span>Comentarios</span></div><div><strong>${Number(voteCount).toLocaleString('es-CL')}</strong><span>Encuestas<br>respondidas</span></div></div><p class="profile-session-note">Sesión activa · tus preferencias se sincronizan con tu cuenta en PC y móvil.</p></section>
   <section class="profile-panel profile-interests"><div class="profile-section-heading"><div><span class="eyebrow">LECTURA PERSONAL</span><h2>Temas y lugares que sigues</h2></div><button data-profile-edit-follows>Administrar ↗</button></div>${interestItems.length?`<div class="profile-chips">${interestItems.map(x=>`<button data-profile-search="${safe(x.kind==='tag'?x.label.slice(1):x.label.replace(/^⌖ /,''))}">${safe(x.label)}</button>`).join('')}</div><p class="profile-muted">Privados en tu perfil; se usan para personalizar tus noticias.</p>`:`<p class="profile-muted">Aún no sigues temas ni lugares. Puedes agregarlos desde cualquier noticia.</p><button class="profile-inline-action" data-profile-home>Explorar noticias ↗</button>`}</section>
   <section class="profile-panel profile-activity"><div class="profile-section-heading"><div><span class="eyebrow">TU PARTICIPACIÓN</span><h2>Mi actividad</h2></div><button data-profile-feed>Ver Feed ↗</button></div><div class="profile-activity-list">${activity}</div></section>
   <aside class="profile-side"><section class="profile-panel profile-sources"><span class="eyebrow">FUENTES EN TU ACTIVIDAD</span><h2>Medios recientes</h2>${uniqueSources.length?`<ul>${uniqueSources.map(s=>`<li>▤ <span>${safe(s)}</span></li>`).join('')}</ul><p class="profile-muted">Medios de las noticias que compartiste o comentaste.</p>`:`<p class="profile-muted">Los medios aparecerán aquí cuando participes en una noticia.</p>`}</section><section class="profile-privacy"><span class="profile-privacy-icon">ⓘ</span><div><h2>Transparencia y privacidad</h2><p>Tus opiniones y comentarios aparecen en el Feed como aportes de la comunidad, no como análisis editorial verificado por Atlas.</p><p>Tus preferencias de lectura son privadas. No mostramos aquí tu correo ni tu historial de lectura.</p></div></section></aside></div>`;
  root.querySelectorAll('[data-profile-login],[data-profile-account]').forEach(b=>b.onclick=openAccount);
  root.querySelectorAll('[data-profile-feed]').forEach(b=>b.onclick=openFeed);
  root.querySelectorAll('[data-profile-home]').forEach(b=>b.onclick=()=>{location.hash='feed';});
  root.querySelectorAll('[data-profile-edit-follows]').forEach(b=>b.onclick=()=>{location.hash='feed';setTimeout(()=>document.getElementById('follow-topics')?.scrollIntoView({behavior:'smooth',block:'center'}),250);});
  root.querySelectorAll('[data-profile-search]').forEach(b=>b.onclick=()=>{location.hash='feed';searchNews?.(b.dataset.profileSearch);});
  root.querySelectorAll('[data-profile-open-news]').forEach(b=>b.onclick=()=>{const a=articles.get(b.dataset.profileOpenNews);if(a)openNews(a);});
 }
 async function render(){
  if(loading)return;const token=++request;loading=true;
  if(!db){root.innerHTML='<section class="profile-signin"><h2>Tu perfil no está disponible</h2><p>La conexión de Convergencia no está disponible ahora.</p></section>';loading=false;return;}
  renderLoading();
  try{
   const {data:{user:u}}=await db.auth.getUser();if(token!==request)return;user=u&&!u.is_anonymous?u:null;
   if(!user){renderSignedOut();return;}
   const uid=user.id;
   const [shareResult,commentResult,voteResult,followResult]=await Promise.all([
    db.from('atlas_dev_news_shares').select('article_id,body,created_at',{count:'exact'}).eq('user_id',uid).order('created_at',{ascending:false}).limit(8),
    db.from('atlas_dev_news_comments').select('article_id,body,created_at',{count:'exact'}).eq('user_id',uid).order('created_at',{ascending:false}).limit(8),
    db.from('atlas_dev_poll_votes').select('poll_id,created_at',{count:'exact'}).eq('user_id',uid).order('created_at',{ascending:false}).limit(8),
    db.from('atlas_dev_news_follows').select('kind,value').eq('user_id',uid).order('kind').order('value').limit(100)
   ]);
   if(token!==request)return;
   const err=[shareResult,commentResult,voteResult,followResult].find(x=>x.error);
   if(err)throw err.error;
   const votes=voteResult.data||[],pollIds=[...new Set(votes.map(x=>x.poll_id))];
   const pollResult=pollIds.length?await db.from('atlas_dev_polls').select('id,title').in('id',pollIds):{data:[],error:null};
   if(pollResult.error)throw pollResult.error;
   renderData({shares:shareResult.data||[],comments:commentResult.data||[],votes,follows:followResult.data||[],polls:pollResult.data||[],shareCount:shareResult.count||0,commentCount:commentResult.count||0,voteCount:voteResult.count||0},user);
  }catch{if(token===request)root.innerHTML='<section class="profile-error"><h2>No pudimos cargar tu perfil</h2><p>Se conservaron tus datos en tu cuenta. Revisa tu conexión e inténtalo de nuevo.</p><button data-profile-retry>↻ Reintentar</button></section>';root.querySelector('[data-profile-retry]')?.addEventListener('click',render);}
  finally{if(token===request)loading=false;}
 }
 db?.auth.onAuthStateChange(()=>{request++;loading=false;setTimeout(render,0);});
 render();
 return {render,refresh:render};
}
