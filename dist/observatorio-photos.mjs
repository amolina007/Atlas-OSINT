// Carga bajo demanda: las noticias y sus acciones no esperan a las fotos.
export function createNewsPhotos(){
 const cache=new Map(),pending=new Set(),queue=[];let active=0,observer;
 function state(id,value){document.querySelectorAll(`[data-photo-id="${id}"]`).forEach(c=>c.dataset.photoState=value);}
 function apply(id,photo){if(!photo){state(id,'unavailable');return;}state(id,'loading-image');for(const card of document.querySelectorAll(`[data-photo-id="${id}"]`)){
 const art=card.querySelector('.story-art');if(!art||art.querySelector('img'))continue;
 let url;try{url=new URL(photo.url);if(url.protocol!=='https:')continue;}catch{continue;}
 const img=document.createElement('img');img.className='source-photo';img.alt=photo.alt||`Imagen publicada por ${photo.source} para esta noticia`;img.referrerPolicy='no-referrer';img.decoding='async';
 const timeout=setTimeout(()=>{state(id,'image-timeout');img.remove();},15000);
 img.onload=()=>{clearTimeout(timeout);if(img.naturalWidth<160||img.naturalHeight<90){img.remove();return;}state(id,'loaded');art.classList.add('has-photo');art.removeAttribute('aria-hidden');const credit=document.createElement('a');credit.className='photo-credit';credit.textContent='Imagen: '+photo.source+' ↗';credit.href=photo.articleUrl;credit.target='_blank';credit.rel='noopener noreferrer';art.append(credit);};
 img.onerror=()=>{clearTimeout(timeout);state(id,'image-error');img.remove();};img.src=url.href;art.append(img);
 }}
 async function pump(){if(active>=3||!queue.length)return;const id=queue.shift();active++;state(id,'loading-metadata');try{const r=await fetch('/.netlify/functions/news-image?id='+id,{signal:AbortSignal.timeout(22000)});const photo=r.ok?(await r.json()).image:null;cache.set(id,photo);apply(id,photo);}catch{cache.set(id,null);state(id,'request-error');}finally{active--;pending.delete(id);pump();}}
 function enqueue(id){if(cache.has(id)){apply(id,cache.get(id));return;}if(pending.has(id))return;pending.add(id);queue.push(id);pump();}
 return root=>{observer?.disconnect();observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);enqueue(e.target.dataset.photoId);}},{rootMargin:'250px'});root.querySelectorAll('[data-photo-id]').forEach((card,index)=>{if(cache.has(card.dataset.photoId))apply(card.dataset.photoId,cache.get(card.dataset.photoId));else if(index<3)enqueue(card.dataset.photoId);else observer.observe(card);});};
}
