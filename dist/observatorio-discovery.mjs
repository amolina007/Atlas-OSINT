import {mapFallbackLocation} from './observatorio-news-geo.mjs';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const topicTags={politica:'Política',deportes:'Deportes',conflictos:'Conflictos',economia:'Economía',ciencia:'Ciencia',tecnologia:'Tecnología',salud:'Salud',cultura:'Cultura'};
const rules=[['InteligenciaArtificial',/\b(inteligencia artificial|ia)\b/],['Elecciones',/eleccion|electoral|comicios/],['Empleo',/empleo|trabajador|laboral|trabajo/],['Música',/musica|concierto|banda|folclor/],['Cine',/\bcine\b|pelicula/],['SaludPública',/salud|hospital|sanitari/],['Educación',/educacion|escuela|universidad/],['MedioAmbiente',/ambient|climatic|biodiversidad|forestal/],['Energía',/energia|electric|renovable/],['Ciberseguridad',/ciberseguridad|ciberataque/],['Fútbol',/futbol|fifa|mundial|liga de campeones/],['EconomíaCircular',/economia circular/],['Teletón',/teleton/],['ConflictoArmado',/bombardeo|ejercito|tropas|guerra|militar/]];
const localNames=new Set(['Aysén','Santiago de Chile','Valparaíso','Temuco','Antofagasta','Atacama','Coquimbo','La Araucanía','Gaza','Kiev','Moscú','Beirut','Teherán','Buenos Aires','Madrid','París','Londres','Washington','Nueva York','Chillán','Concepción','Puerto Montt','Valdivia']);
export function articleLocation(article){
 const place=mapFallbackLocation(article.title);if(!place)return null;
 return {...place,scope:localNames.has(place.label)?'local':'country'};
}
export function articleTags(article){
 const tags=(article.topics||[]).map(t=>topicTags[t]).filter(Boolean);const text=norm(article.title);
 for(const [tag,pattern] of rules)if(pattern.test(text))tags.push(tag);
 const place=articleLocation(article);if(place)tags.push(place.label.replace(/\s+/g,''));
 return [...new Set(tags.length?tags:['Actualidad'])].slice(0,7);
}
export function distanceKm(a,b){const rad=x=>x*Math.PI/180;const dlat=rad(b[1]-a[1]),dlon=rad(b[0]-a[0]);const h=Math.sin(dlat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dlon/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
export function discoveryMatches(article,selection){
 if(!selection)return true;
 if(selection.tag)return articleTags(article).includes(selection.tag);
 const place=articleLocation(article);if(!place)return false;
 if(selection.place.scope==='country')return place.label===selection.place.label;
 return place.scope==='local'&&distanceKm(place.coordinates,selection.place.coordinates)<=selection.radius;
}
export function discoveryMarkup(article,esc){const place=articleLocation(article);return `<div class="news-tags discovery-tags">${articleTags(article).map(tag=>`<button data-discover-tag="${esc(tag)}" aria-label="Ver noticias relacionadas con ${esc(tag)}">#${esc(tag)}</button>`).join('')}</div><div class="story-context">${place?`<button class="location-link" data-discover-place="${esc(article.id)}">⌖ ${esc(place.label)} · ${place.scope==='country'?'ver noticias sobre este país':'ver noticias cercanas'}</button><small>Referencia aproximada del titular; no confirma el lugar del hecho.</small>`:'<small>Ubicación del hecho no determinada.</small>'}</div>`;}
