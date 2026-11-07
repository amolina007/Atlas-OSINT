import {initMapExplorer} from './observatorio-map.mjs';
import {initLetters} from './observatorio-letters.mjs';
import {initTrends} from './observatorio-trends.mjs';
import {initTracking} from './observatorio-tracking.mjs';
import { initNews } from './observatorio-news.mjs';
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = s => { try { const u = new URL(s); return u.protocol === 'https:' ? u.href : '#'; } catch { return '#'; } };
const link = (href, text) => `<a href="${esc(url(href))}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>`;
const date = s => new Date(s).toLocaleString('es-CL', { dateStyle:'medium', timeStyle:'short' });
let tracking;
let newsEvents = [], feedMap, feedMarkers;
let mapExplorer, baseLayer;
let events = [], sources = [], filter = 'all', selected, fetchedAt, map, markers;
function view(name) { if(name==='investigacion')name='seguimiento'; $('atlas-menu').open=false; document.querySelectorAll('.view').forEach(el => el.hidden = el.id !== name); document.querySelectorAll('[data-view]').forEach(b => { b.classList.toggle('active', b.dataset.view === name); b.setAttribute('aria-pressed', b.dataset.view === name); }); if(name==='feed'){renderResearchPreview();setTimeout(()=>feedMap?.invalidateSize(),0);} if (name === 'panorama') setTimeout(() => map?.invalidateSize(),0); if (name === 'seguimiento') tracking?.render(); if(!/(?:access_token|refresh_token|error_description|code)=/.test(location.hash + location.search)) location.hash = name; }
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => view(b.dataset.view));
window.addEventListener('hashchange', () => { const name = location.hash.slice(1); if (['feed','panorama','investigacion','seguimiento','fuentes','cartas','tendencias'].includes(name)) view(name); });
if (window.L) { map = L.map('map', { worldCopyJump:true, minZoom:0 }).setView([-8,-48],3); baseLayer=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:18, attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map).on('tileerror', () => { $('status').textContent = 'Algunas teselas del mapa no cargaron. Las señales siguen disponibles en la lista.'; }); markers = L.layerGroup().addTo(map); L.control.scale({imperial:false}).addTo(map); } else $('map').innerHTML = '<p class="empty">No se pudo cargar el mapa. Puedes explorar las señales en la lista y reintentar recargando.</p>';

if(window.L){feedMap=L.map('feed-map',{zoomControl:false,scrollWheelZoom:false,dragging:false,attributionControl:true}).setView([10,0],1);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(feedMap);feedMarkers=L.layerGroup().addTo(feedMap);}
function renderResearchPreview(){tracking?.renderPreview();}
function renderFeedMap(rows){feedMarkers?.clearLayers();const located=rows.filter(e=>e.coordinates);for(const e of located){if(!feedMarkers)break;const tip=document.createElement('span');tip.textContent=e.title;L.circleMarker([e.coordinates[1],e.coordinates[0]],{radius:4,color:'#fff',weight:1,fillColor:'#7655ab',fillOpacity:.9}).addTo(feedMarkers).bindTooltip(tip).on('click',()=>showNewsMap(e));}$('feed-map-caption').textContent=`${located.length} titulares con lugar reconocido · puntos aproximados, no ubicación confirmada.`;}
$('chile').onclick = () => map?.setView([-33.45,-70.66],5);
$('world').onclick = () => map?.setView([8,-35],2);
function filtered() { const cutoff = Date.now()-Number($('period').value)*86400000; return [...events,...newsEvents].filter(e => (filter === 'all' || e.provider === filter) && Date.parse(e.date) >= cutoff); }
function eventCard(e, cls = 'event') { return `<button class="${cls}" data-event="${esc(e.id)}"><span class="tag">${esc(e.source)} · ${esc(e.category)}</span><strong>${esc(e.title)}</strong><small>${esc(date(e.date))}</small></button>`; }
function bindEvents(root, fn = showDetail) { root.querySelectorAll('[data-event]').forEach(b => b.onclick = () => { const e = [...events,...newsEvents].find(e => e.id === b.dataset.event); if (e) fn(e); }); }
function render() {
  if(mapExplorer){mapExplorer.update({events,newsEvents,sources,fetchedAt});return;}
  const rows = filtered(); $('count').textContent = `${rows.filter(e=>e.coordinates).length} señales en el mapa · ${rows.filter(e=>!e.coordinates).length} sin ubicación`; $('result-count').textContent = rows.length;
  $('events').innerHTML = rows.length ? rows.map(e => eventCard(e)).join('') : '<div class="empty">Sin señales para estos filtros.<br>Prueba otro periodo o búsqueda.</div>'; bindEvents($('events'));
  markers?.clearLayers(); for (const e of rows) { if (!map) break; if(!e.coordinates)continue; const marker = L.circleMarker([e.coordinates[1],e.coordinates[0]], { radius:6, color:'#ffffff', weight:1.5, fillColor:e.provider === 'news' ? '#7255ab':e.provider === 'usgs' ? '#c66e43':'#087c70', fillOpacity:.82 }).addTo(markers); const tip = document.createElement('span'); tip.textContent=e.title; marker.bindTooltip(tip).on('click', () => showDetail(e)); }
  const days = Array.from({length:7}, (_,i) => { const d = new Date(); d.setUTCDate(d.getUTCDate()-6+i); const key=d.toISOString().slice(0,10); return { label:d.toLocaleDateString('es-CL',{day:'numeric',month:'short',timeZone:'UTC'}), count:rows.filter(e => e.date.startsWith(key)).length }; }); const max=Math.max(1,...days.map(d => d.count)); $('chart').innerHTML=days.map(d => `<div class="bar" style="height:${Math.max(2,d.count/max*75)}px" title="${esc(d.label)}: ${d.count}"><b>${d.count}</b><span>${esc(d.label)}</span></div>`).join('');
}
function showDetail(e) {
 selected=e;$('detail-content').innerHTML=`<span class="badge">${esc(e.source)}</span><h2>${esc(e.title)}</h2><p>${esc(e.detail)}</p><p>${esc(date(e.date))}</p><p>${link(e.url,'Publicación original')}</p><button id="add-evidence" class="primary">Seguir esta historia</button>`;
 $('detail').showModal();$('add-evidence').onclick=()=>{$('detail').close();addNews(e);};
}
$('close-detail').onclick=()=>$('detail').close();
function renderSources() { $('coverage').innerHTML=sources.map(s=>`<div class="coverage-row"><strong>${esc(s.name)}</strong><span class="${s.status==='ok'?'ok':'error'}">${s.status==='ok'?s.count+' registros':'Sin conexión'}</span></div>`).join(''); $('source-list').innerHTML=sources.map(s=>`<section class="panel source-card"><span class="source-status ${s.status==='ok'?'ok':'error'}">${s.status==='ok'?'● Conectada':'● No disponible'}</span><h2>${esc(s.name)}</h2><p>${esc(s.scope)}</p><p class="muted">Consulta: ${esc(date(s.checkedAt))} · ${s.count} registros recibidos${s.error?' · '+esc(s.error):''}</p>${link(s.docs,'Documentación')}${link(s.url,'Datos originales')}</section>`).join(''); }
async function refresh() { $('refresh').disabled=true; $('status').textContent='Consultando USGS y NASA EONET…'; try { const res=await fetch('/.netlify/functions/observatory',{signal:AbortSignal.timeout(20000)}); if(!res.ok) throw Error(); const data=await res.json(); if(!Array.isArray(data.events)||!Array.isArray(data.sources)) throw Error(); events=data.events; sources=data.sources; fetchedAt=data.fetchedAt; render(); renderSources(); const failed=sources.filter(s=>s.status!=='ok'); $('status').textContent=`Consulta: ${date(fetchedAt)} · ${failed.length ? 'Cobertura parcial: '+failed.map(s=>s.name).join(', ')+' no disponible.' : '2 fuentes conectadas.'} Los conectores se actualizan como máximo cada 5 minutos.`; } catch { $('status').textContent='No se pudo actualizar. '+(events.length?'Se conserva la consulta anterior; revisa su fecha.':'No hay datos disponibles. Usa Actualizar fuentes para reintentar.'); if(!events.length) { render(); $('coverage').textContent='Conexión no disponible'; $('source-list').textContent='No se pudo obtener el estado de las fuentes. Reintenta con Actualizar fuentes.'; } } finally { $('refresh').disabled=false; } }
$('search').oninput=()=>news.search($('search').value); $('period').onchange=render;
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});render()});
function addNews(e){tracking?.follow(e);}
function showNewsMap(e){
 view('panorama');mapExplorer?.setMode('news');filter='news';
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='news');b.setAttribute('aria-pressed',b.dataset.filter==='news')});
 render();if(e.coordinates)map?.setView([e.coordinates[1],e.coordinates[0]],4);showDetail(e);
}
const news = initNews({ view, esc, date, onNews:rows=>{newsEvents=rows;render();renderFeedMap(rows);renderResearchPreview();},addNews,showNewsMap });
mapExplorer=initMapExplorer({map,L:window.L,markers,baseLayer,esc,date,openEvent:showDetail,addEvidence:addNews,readNews:e=>news.readEvidence(e)});
render();
const letters=initLetters({db:window.auraClient,esc,date,login:()=>$('feed-account').click()});
const trends=initTrends({db:window.auraClient,esc,date,login:()=>$('feed-account').click()});
tracking=initTracking({db:window.auraClient,esc,date,view,readNews:e=>news.readEvidence(e),showMap:showNewsMap,search:q=>news.search(q),login:()=>$('feed-account').click()});
$('refresh').onclick=()=>Promise.allSettled([refresh(),news.refresh()]); view(['feed','panorama','investigacion','seguimiento','fuentes','cartas','tendencias'].includes(location.hash.slice(1))?location.hash.slice(1):'feed'); refresh();
