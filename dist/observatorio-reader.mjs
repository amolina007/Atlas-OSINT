export function createNewsReader({esc,date,addNews,newsEvidence}){
 const dialog=document.createElement('dialog');dialog.id='news-reader';dialog.setAttribute('aria-labelledby','reader-title');dialog.innerHTML='<button class="close" aria-label="Cerrar lectura">×</button><div id="reader-body"></div>';document.body.append(dialog);let controller,current;
 dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>controller?.abort());
 const safe=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'#';}catch{return '#';}};
 return async article=>{
 current=article;controller?.abort();controller=new AbortController();const signal=controller.signal;
 const body=dialog.querySelector('#reader-body');body.innerHTML=`<span class="eyebrow">LECTURA ATLAS</span><h1 id="reader-title">${esc(article.title)}</h1><p class="muted">${esc(article.source)} · ${esc(date(article.publishedAt))}</p><div id="reader-result" role="status"><p>Consultando el contenido de la fuente y preparando una síntesis…</p><p class="muted">Puede tardar unos segundos. No resumimos solo el titular.</p></div><section class="reader-sources"><h2>Fuentes</h2><a id="reader-source" href="${esc(safe(article.url))}" target="_blank" rel="noopener noreferrer">${esc(article.source)} · abrir publicación original ↗</a></section><button id="reader-save" class="primary">Agregar a investigación</button>`;
 body.querySelector('#reader-save').onclick=()=>{dialog.close();addNews(newsEvidence(current));};if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 const timer=setTimeout(()=>controller?.abort(),55000);
 try{const r=await fetch('/.netlify/functions/news-summary?id='+article.id,{signal});if(!r.ok)throw Error(r.status===429?'rate':'request');const data=await r.json();if(signal.aborted)return;
 const result=body.querySelector('#reader-result');
 if(data.source?.url)body.querySelector('#reader-source').href=safe(data.source.url);
 if(data.status==='ready'){
 const section=(title,items)=>`<section><h2>${title}</h2>${items.map(p=>`<p>${esc(p.text)} <a href="#reader-source" class="reader-citation" aria-label="Fuente: ${esc(article.source)}, párrafo ${p.paragraph}" title="Contenido respaldado por el párrafo ${p.paragraph} recuperado de la fuente">[1]</a></p>`).join('')}</section>`;
 result.innerHTML=section('Qué pasó',data.what)+section('Contexto',data.context)+(data.context.length?'':'<p>La fuente recuperada no aporta antecedentes suficientes para añadir contexto.</p>')+`<section><h2>Alcance y límites</h2><p>${esc(data.notice)}</p><p class="muted">El relato conserva las atribuciones del medio. No se han contrastado otras publicaciones.</p><p class="muted">Síntesis preparada: ${esc(date(data.generatedAt))}</p></section>`;
 }else result.innerHTML=`<h2>Síntesis no disponible</h2><p>${esc(data.reason)}</p><p class="muted">No añadimos datos ni contexto que no podamos respaldar con el contenido de la fuente.</p>`;
 }catch(e){if(!dialog.open||current!==article)return;body.querySelector('#reader-result').innerHTML=`<h2>No se pudo preparar la síntesis</h2><p>${e.message==='rate'?'Has realizado varias consultas. Espera un minuto y vuelve a abrir la noticia.':'La consulta no se completó. Puedes abrir la publicación original o cerrar y reintentar.'}</p>`;}finally{clearTimeout(timer);}
 };
}
