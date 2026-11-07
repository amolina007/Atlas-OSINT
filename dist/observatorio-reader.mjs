import {articleLocation,discoveryMarkup} from './observatorio-discovery.mjs';
export function createNewsReader({esc,date,addNews,newsEvidence,onDiscovery,getArticles,readings}){
 const dialog=document.createElement('dialog');dialog.id='news-reader';dialog.setAttribute('aria-labelledby','reader-title');dialog.innerHTML='<button class="close" aria-label="Cerrar lectura">×</button><div id="reader-body"></div>';document.body.append(dialog);let controller,current,currentReading,sequence=[];
 dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>controller?.abort());
 // Close only when the gesture starts and ends on the backdrop, not when
 // selecting text or using controls inside the reading panel.
 const onBackdrop=event=>{const r=dialog.getBoundingClientRect();return event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom);};
 let backdropPress=false;
 dialog.addEventListener('pointerdown',event=>{backdropPress=event.isPrimary&&event.button===0&&onBackdrop(event);});
 dialog.addEventListener('pointercancel',()=>{backdropPress=false;});
 dialog.addEventListener('click',event=>{const dismiss=backdropPress&&onBackdrop(event);backdropPress=false;if(dismiss)dialog.close();});
 dialog.addEventListener('close',()=>{backdropPress=false;});
 const safe=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'#';}catch{return '#';}};
 async function open(article,keepSequence=false){
 if(!keepSequence)sequence=[...(getArticles?.()||[article])];
 if(!sequence.some(a=>a.id===article.id))sequence=[article];
 const index=sequence.findIndex(a=>a.id===article.id);
 current=article;currentReading=null;controller?.abort();controller=new AbortController();const signal=controller.signal;
 const body=dialog.querySelector('#reader-body');body.innerHTML=`<span class="eyebrow">LECTURA ATLAS</span><h1 id="reader-title">${esc(article.title)}</h1><p class="muted">${esc(article.source)} · ${esc(date(article.publishedAt))}</p>${discoveryMarkup(article,esc)}<div id="reader-result" role="status"><p><strong class="loading-label"><span class="loading-spinner" aria-hidden="true"></span>Preparando síntesis…</strong></p><p class="muted">Buscando contenido y fuentes.</p></div><section class="reader-sources"><h2>Fuentes</h2><a id="reader-source" href="${esc(safe(article.url))}" target="_blank" rel="noopener noreferrer">${esc(article.source)} · abrir publicación original ↗</a></section><div class="reader-navigation"><button id="reader-prev" ${index<=0?'disabled':''}>← Anterior</button><button id="reader-save" class="primary">Agregar a investigación</button><button id="reader-next" ${index<0||index>=sequence.length-1?'disabled':''}>Siguiente →</button></div><p class="reader-position muted">${index+1} / ${sequence.length}</p>`;
 body.querySelector('#reader-prev').onclick=()=>open(sequence[index-1],true);body.querySelector('#reader-next').onclick=()=>open(sequence[index+1],true);
 body.querySelectorAll('[data-discover-tag]').forEach(b=>b.onclick=()=>{dialog.close();onDiscovery({tag:b.dataset.discoverTag});});body.querySelectorAll('[data-discover-place]').forEach(b=>b.onclick=()=>{const place=articleLocation(article);if(place){dialog.close();onDiscovery({place,radius:100});}});
 body.querySelector('#reader-save').onclick=()=>{dialog.close();addNews(newsEvidence({...current,reading:currentReading}));};if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 const activeController=controller;const timer=setTimeout(()=>activeController.abort(),55000);
 try{const data=readings.get(article)||await readings.load(article);if(signal.aborted)return;
 const result=body.querySelector('#reader-result');
 if(data.source?.url)body.querySelector('#reader-source').href=safe(data.source.url);
 if(data.status==='ready'){
 currentReading=data;
 const sources=data.sources||[{id:1,...data.source}];
 body.querySelector('.reader-sources').innerHTML='<h2>Fuentes</h2>'+sources.map(s=>`<p><a id="reader-source-${s.id}" href="${esc(safe(s.url))}" target="_blank" rel="noopener noreferrer">[${s.id}] ${esc(s.name)} · ${esc(date(s.publishedAt))} · ${esc(s.title||article.title)} ↗</a></p>`).join('')+(data.alternative?`<p class="muted">Cobertura del mismo hecho en otros medios. <a href="${esc(safe(article.url))}" target="_blank" rel="noopener noreferrer">Publicación que abriste ↗</a></p>`:'');
 const section=(title,items)=>items.length?`<section><h2>${title}</h2>${items.map(p=>`<p>${esc(p.text)} <a href="#reader-source-${p.source||1}" class="reader-citation" aria-label="Ver fuente ${p.source||1}">[${p.source||1}]</a></p>`).join('')}</section>`:'';
 result.innerHTML=(data.alternative?`<p class="muted">Cobertura de ${sources.map(s=>`${esc(s.name)} (${esc(date(s.publishedAt))})`).join(' · ')}.</p>`:'')+section('Qué pasó',data.what)+section('Contexto',data.context)+`<p class="muted">${esc(data.notice)} · ${esc(date(data.generatedAt))}</p>`;
 }else result.innerHTML=data.preview?`<h2>En la publicación</h2><blockquote>${esc(data.preview)}</blockquote><p class="muted">${esc(article.source)}</p>`:'';
 }catch(e){if(!dialog.open||current!==article||controller!==activeController)return;body.querySelector('#reader-result').innerHTML=`<button id="reader-retry">Reintentar lectura</button>`;body.querySelector('#reader-retry').onclick=()=>open(article,true);}finally{clearTimeout(timer);}
 }
 return open;
}
