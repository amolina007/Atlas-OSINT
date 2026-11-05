import {articleLocation,discoveryMarkup} from './observatorio-discovery.mjs';
export function createNewsReader({esc,date,addNews,newsEvidence,onDiscovery,getArticles}){
 const dialog=document.createElement('dialog');dialog.id='news-reader';dialog.setAttribute('aria-labelledby','reader-title');dialog.innerHTML='<button class="close" aria-label="Cerrar lectura">×</button><div id="reader-body"></div>';document.body.append(dialog);let controller,current,sequence=[];
 dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>controller?.abort());
 const safe=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'#';}catch{return '#';}};
 async function open(article,keepSequence=false){
 if(!keepSequence)sequence=[...(getArticles?.()||[article])];
 const index=sequence.findIndex(a=>a.id===article.id);
 current=article;controller?.abort();controller=new AbortController();const signal=controller.signal;
 const body=dialog.querySelector('#reader-body');body.innerHTML=`<div class="reader-navigation"><button id="reader-prev" ${index<=0?'disabled':''}>← Anterior</button><span>${index+1} / ${sequence.length}</span><button id="reader-next" ${index<0||index>=sequence.length-1?'disabled':''}>Siguiente →</button></div><span class="eyebrow">LECTURA ATLAS</span><h1 id="reader-title">${esc(article.title)}</h1><p class="muted">${esc(article.source)} · ${esc(date(article.publishedAt))}</p>${discoveryMarkup(article,esc)}<div id="reader-result" role="status"><p>Buscando cobertura y preparando la lectura…</p></div><section class="reader-sources"><h2>Fuentes</h2><a id="reader-source" href="${esc(safe(article.url))}" target="_blank" rel="noopener noreferrer">${esc(article.source)} · abrir publicación original ↗</a></section><button id="reader-save" class="primary">Agregar a investigación</button>`;
 body.querySelector('#reader-prev').onclick=()=>open(sequence[index-1],true);body.querySelector('#reader-next').onclick=()=>open(sequence[index+1],true);
 body.querySelectorAll('[data-discover-tag]').forEach(b=>b.onclick=()=>{dialog.close();onDiscovery({tag:b.dataset.discoverTag});});body.querySelectorAll('[data-discover-place]').forEach(b=>b.onclick=()=>{const place=articleLocation(article);if(place){dialog.close();onDiscovery({place,radius:100});}});
 body.querySelector('#reader-save').onclick=()=>{dialog.close();addNews(newsEvidence(current));};if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 const activeController=controller;const timer=setTimeout(()=>activeController.abort(),55000);
 try{const r=await fetch('/.netlify/functions/news-summary?id='+article.id,{signal});if(!r.ok)throw Error(r.status===429?'rate':'request');const data=await r.json();if(signal.aborted)return;
 const result=body.querySelector('#reader-result');
 if(data.source?.url)body.querySelector('#reader-source').href=safe(data.source.url);
 if(data.status==='ready'){
 const sources=data.sources||[{id:1,...data.source}];
 body.querySelector('.reader-sources').innerHTML='<h2>Fuentes</h2>'+sources.map(s=>`<p><a id="reader-source-${s.id}" href="${esc(safe(s.url))}" target="_blank" rel="noopener noreferrer">[${s.id}] ${esc(s.name)} · ${esc(s.title||article.title)} ↗</a></p>`).join('')+(data.alternative?`<p class="muted">Cobertura del mismo hecho en otros medios. <a href="${esc(safe(article.url))}" target="_blank" rel="noopener noreferrer">Publicación que abriste ↗</a></p>`:'');
 const section=(title,items)=>items.length?`<section><h2>${title}</h2>${items.map(p=>`<p>${esc(p.text)} <a href="#reader-source-${p.source||1}" class="reader-citation" aria-label="Ver fuente ${p.source||1}">[${p.source||1}]</a></p>`).join('')}</section>`:'';
 result.innerHTML=section('Qué pasó',data.what)+section('Contexto',data.context)+`<p class="muted">${esc(data.notice)} · ${esc(date(data.generatedAt))}</p>`;
 }else result.innerHTML=data.preview?`<h2>En la publicación</h2><blockquote>${esc(data.preview)}</blockquote><p class="muted">${esc(article.source)}</p>`:'';
 }catch(e){if(!dialog.open||current!==article||controller!==activeController)return;body.querySelector('#reader-result').innerHTML=`<button id="reader-retry">Reintentar lectura</button>`;body.querySelector('#reader-retry').onclick=()=>open(article,true);}finally{clearTimeout(timer);}
 }
 return open;
}
