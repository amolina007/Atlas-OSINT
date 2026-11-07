import {parse,mergeArticles} from './headlines.mjs';
export function isWarReport(title){
 const t=String(title).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return /\b(bombarde\w*|ataques?|atac\w*|misiles?|drones?|ofensiva|enfrentamientos?|airstrike\w*|shelling)\b/.test(t)&&/\b(guerra|militar\w*|ejercito|ucrania|rusia|israel|gaza|libano|sudan|iran|siria|yemen|hezbola|hamas|rebeldes|taliban|myanmar|congo)\b/.test(t)&&! /\b(ciberataque|videojuego|futbol|simulacro|aniversario|pelicula)\b/.test(t);
}
const queries=['(ataque OR bombardeo OR misiles OR drones) (Ucrania OR Rusia)','(ataque OR bombardeo OR misiles) (Gaza OR Israel OR Líbano OR Irán OR Siria OR Yemen)','(ataque OR bombardeo OR enfrentamientos) (Sudán OR Myanmar OR Congo OR guerra)'];
let cache;
export async function warReports(fetcher=fetch,now=Date.now()){
 if(fetcher===fetch&&cache&&now-cache.at<300000)return cache.value;
 const results=await Promise.all(queries.map(async(q)=>{try{const r=await fetcher('https://news.google.com/rss/search?'+new URLSearchParams({q:q+' when:7d',hl:'es-419',gl:'CL',ceid:'CL:es-419'}),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const xml=await r.text();if(!/<rss\b/i.test(xml))throw Error();return {ok:true,rows:parse(xml,'conflictos').filter(a=>isWarReport(a.title)&&Date.parse(a.publishedAt)<=now+300000&&Date.parse(a.publishedAt)>=now-7*86400000).slice(0,50)};}catch{return {ok:false,rows:[]};}}));
 if(!results.some(r=>r.ok)){if(cache)return {...cache.value,stale:true,checkedAt:new Date(now).toISOString()};throw Error('Fuentes temporalmente no disponibles');}
 const value={articles:mergeArticles(results.map(r=>r.rows)),updatedAt:new Date(now).toISOString(),partial:results.some(r=>!r.ok),coverage:'Titulares públicos de los últimos 7 días; hasta 50 por consulta. Cobertura parcial, no inventario exhaustivo de ataques.'};
 if(fetcher===fetch)cache={at:now,value};return value;
}
