import {getStore} from '@netlify/blobs';
import {createHash} from 'node:crypto';
import {weatherGrid,parseAlerts,normalizeForecast} from '../lib/weather.mjs';
const memory=new Map();
async function cached(key,ttl,build){
 let store,old=memory.get(key);try{store=getStore({name:'atlas-dev-weather',consistency:'strong'});old=await store.get(key,{type:'json'})||old;}catch{}
 if(old&&Date.now()-Date.parse(old.retrievedAt)<ttl)return {...old,stale:false};
 try{const value={...await build(),retrievedAt:new Date().toISOString()};memory.set(key,value);if(memory.size>150)memory.delete(memory.keys().next().value);try{await store?.setJSON(key,value);}catch{}return {...value,stale:false};}catch(error){if(old)return {...old,stale:true};throw error;}
}
async function upstream(url,json=true){const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'AtlasWeather/1.0'}});if(!r.ok)throw Error('provider_'+r.status);return json?r.json():r.text();}
export default async function(req){
 if(Netlify.env.get('CONTEXT')==='production')return new Response('Dev only',{status:404});
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 const p=new URL(req.url).searchParams,mode=p.get('mode')||'forecast';let key,build,ttl=900000;
 try{
 if(mode==='search'){
  const q=(p.get('q')||'').trim();if(q.length<2||q.length>100)return Response.json({error:'invalid_query'},{status:400});
  key='search-'+createHash('sha256').update(q.toLowerCase()).digest('hex');ttl=86400000;
  build=async()=>{const u=new URL('https://geocoding-api.open-meteo.com/v1/search');u.search=new URLSearchParams({name:q,count:'8',language:'es',format:'json'});const d=await upstream(u);return {places:(d.results||[]).map(r=>({name:r.name,region:r.admin1||'',country:r.country||'',latitude:r.latitude,longitude:r.longitude,timezone:r.timezone})),source:'Open-Meteo / GeoNames'};};
 }else if(mode==='alerts'){
  key='gdacs-current';build=async()=>({...parseAlerts(await upstream('https://www.gdacs.org/xml/rss.xml',false)),source:'GDACS · Naciones Unidas / Comisión Europea',sourceUrl:'https://www.gdacs.org/',coverage:'Global, según informes actualizados en GDACS durante los últimos 30 días. Inundaciones, ciclones, sequías e incendios. No incluye todos los avisos meteorológicos locales.'});
 }else if(mode==='forecast'){
  if(!p.has('lat')||!p.has('lon'))throw Error('coordinates');
  const lat=Number(p.get('lat')),lon=Number(p.get('lon')),span=Number(p.get('span')||4),grid=weatherGrid(lat,lon,span);
  key='grid-'+[lat.toFixed(3),lon.toFixed(3),span.toFixed(2)].join('_');
  build=async()=>{const u=new URL('https://api.open-meteo.com/v1/forecast');u.search=new URLSearchParams({latitude:grid.points.map(p=>p.latitude.toFixed(4)).join(','),longitude:grid.points.map(p=>p.longitude.toFixed(4)).join(','),hourly:'temperature_2m,apparent_temperature,rain,precipitation_probability,wind_speed_10m,wind_direction_10m,weather_code',forecast_hours:'48',timeformat:'unixtime',timezone:'GMT',wind_speed_unit:'kmh'});const rows=normalizeForecast(await upstream(u),grid);return {grid,rows,source:'Open-Meteo · modelos meteorológicos',sourceUrl:'https://open-meteo.com/en/docs',kind:'forecast',validFrom:rows[12].hourly.time[0]*1000,validTo:rows[12].hourly.time.at(-1)*1000,coverage:'25 muestras en una malla regional. Separación '+grid.step.toFixed(2)+'°. No es radar ni medición de estaciones. La resolución del modelo varía por zona.'};};
 }else return Response.json({error:'invalid_mode'},{status:400});
 const d=await cached(key,ttl,build);return Response.json(d,{headers:{'Cache-Control':d.stale?'no-store':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
 }catch(e){return Response.json({error:e.message==='coordinates'?'invalid_coordinates':'weather_unavailable'},{status:e.message==='coordinates'?400:502,headers:{'Cache-Control':'no-store'}});}
}
export const config={rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
