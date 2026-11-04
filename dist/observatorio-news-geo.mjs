// Puntos de referencia aproximados, no coordenadas del hecho noticioso.
// Solo se usan nombres explícitos en el titular; nunca el país del medio.
const places = [
 ['Aysén',[-73,-45.4],['aysen']],['Santiago de Chile',[-70.67,-33.45],['santiago de chile']],
 ['Valparaíso',[-71.62,-33.05],['valparaiso']],['Temuco',[-72.59,-38.74],['temuco']],
 ['Antofagasta',[-70.4,-23.65],['antofagasta']],['Atacama',[-70,-27.5],['atacama']],
 ['Coquimbo',[-71.34,-29.95],['coquimbo']],['La Araucanía',[-72.5,-38.7],['araucania']],
 ['Gaza',[34.45,31.5],['gaza']],['Kiev',[30.52,50.45],['kiev','kyiv']],
 ['Moscú',[37.62,55.75],['moscu']],['Beirut',[35.5,33.89],['beirut']],
 ['Teherán',[51.39,35.69],['teheran']],['Buenos Aires',[-58.38,-34.6],['buenos aires']],
 ['Madrid',[-3.7,40.42],['madrid']],['París',[2.35,48.86],['paris']],
 ['Londres',[-0.12,51.51],['londres']],['Washington',[-77.04,38.91],['washington']],
 ['Nueva York',[-74.01,40.71],['nueva york']],['Chile',[-71,-33],['chile']],
 ['Argentina',[-64,-35],['argentina']],['Perú',[-75,-10],['peru']],
 ['Bolivia',[-64,-17],['bolivia']],['Brasil',[-52,-14],['brasil']],
 ['Uruguay',[-56,-33],['uruguay']],['Paraguay',[-58,-23],['paraguay']],
 ['Colombia',[-74,4],['colombia']],['Ecuador',[-78,-2],['ecuador']],
 ['Venezuela',[-66,7],['venezuela']],['México',[-102,23],['mexico']],
 ['Estados Unidos',[-98,39],['estados unidos','ee uu','ee. uu.','ee.uu.']],
 ['Canadá',[-106,56],['canada']],['España',[-4,40],['espana']],
 ['Francia',[2,47],['francia']],['Reino Unido',[-2,54],['reino unido']],
 ['Alemania',[10,51],['alemania']],['Italia',[12,43],['italia']],
 ['Ucrania',[32,49],['ucrania']],['Rusia',[90,60],['rusia']],
 ['Israel',[35,31],['israel']],['Palestina',[35.2,32],['palestina']],
 ['Líbano',[36,34],['libano']],['Irán',[54,32],['iran']],
 ['Siria',[38,35],['siria']],['China',[104,35],['china']],
 ['Japón',[138,37],['japon']],['India',[79,22],['india']],
 ['Taiwán',[121,24],['taiwan']],['Australia',[134,-25],['australia']],
 ['Sudán',[30,16],['sudan']],['Senegal',[-14,14],['senegal']],
];
const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function locateHeadline(title) {
 const text=' '+normalized(title).replace(/[^a-z0-9.]+/g,' ')+' ';
 const matches=places.filter(([, , aliases])=>aliases.some(a=>text.includes(' '+a+' ')));
 // No seleccionar arbitrariamente entre varios lugares mencionados.
 if(matches.length!==1)return null;
 const [label,coordinates]=matches[0];
 return {label,coordinates,method:'Mención en el titular · punto de referencia aproximado. No confirma dónde ocurrió el hecho.'};
}
export function newsEvidence(article) {
 const location=locateHeadline(article.title);
 return {id:'news:'+article.id,title:article.title,date:article.publishedAt,url:article.url,source:article.source,provider:'news',category:'Noticia',topics:article.topics||[],coordinates:location?.coordinates||null,location,detail:'Titular atribuido al medio, vía Google News RSS. Contenido y ubicación sin corroboración independiente.',capturedAt:article.capturedAt||new Date().toISOString()};
}

// Conservative card fallback: require an explicit geographic context, not just a club/person name.
export function mapFallbackLocation(title){
 const place=locateHeadline(title);if(!place)return null;
 const text=normalized(title);
 const aliases=places.find(p=>p[0]===place.label)?.[2]||[];
 return aliases.some(alias=>new RegExp('(?:\\ben|\\bdesde|\\bhacia|\\bcerca de|\\bal norte de|\\bal sur de)\\s+(?:el |la )?'+alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:\\b|$)').test(text))?place:null;
}
