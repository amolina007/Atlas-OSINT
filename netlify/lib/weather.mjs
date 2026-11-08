import {load} from 'cheerio';
export function weatherGrid(lat,lon,span=4){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>85||Math.abs(lon)>180||!Number.isFinite(span)||span<.02||span>12)throw Error('coordinates');
 const step=span/5,points=[];
 for(let y=0;y<5;y++)for(let x=0;x<5;x++){const latitude=Math.max(-85,Math.min(85,lat+(y-2)*step)),longitude=((lon+(x-2)*step+540)%360)-180;points.push({latitude,longitude});}
 return {points,step,center:{latitude:lat,longitude:lon},span};
}
export function weatherViewportGrid(south,north,west,east){
 if(![south,north,west,east].every(Number.isFinite)||south< -85||north>85||north<=south||east<=west||east-west>360.001||Math.abs(west)>540||Math.abs(east)>540)throw Error('coordinates');
 const size=7,dy=(north-south)/size,dx=(east-west)/size,points=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const bottom=south+y*dy,left=west+x*dx;points.push({latitude:bottom+dy/2,longitude:((left+dx/2+540)%360)-180,bounds:[[bottom,left],[bottom+dy,left+dx]]});}
 return {points,step:dy,longitudeStep:dx,center:{latitude:(south+north)/2,longitude:(((west+east)/2+540)%360)-180},span:north-south,bounds:{south,north,west,east}};
}
export function parseAlerts(xml,now=Date.now()){
 const $=load(xml,{xmlMode:true}),rows=new Map(),iso=s=>Number.isFinite(Date.parse(s))?new Date(s).toISOString():null;
 $('item').each((_,el)=>{const item=$(el),get=name=>item.find(name.replace(':','\\:')).first().text().trim(),type=get('gdacs:eventtype');
  if(!['FL','TC','DR','WF'].includes(type)||get('gdacs:iscurrent')!=='true')return;
  const latitude=Number(get('geo:lat')),longitude=Number(get('geo:long')),id=type+get('gdacs:eventid'),updatedAt=iso(get('gdacs:datemodified')||get('pubDate'));
  if(!updatedAt||Date.parse(updatedAt)<now-30*86400000||Date.parse(updatedAt)>now+300000||!get('geo:lat')||!get('geo:long')||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return;
  const row={id,type,title:get('title'),description:get('description').replace(/<[^>]*>/g,''),country:get('gdacs:country'),level:get('gdacs:alertlevel'),latitude,longitude,start:iso(get('gdacs:fromdate')),end:iso(get('gdacs:todate')),updatedAt,url:'https://www.gdacs.org/report.aspx?eventtype='+type+'&eventid='+encodeURIComponent(get('gdacs:eventid'))};
  if(!rows.has(id)||rows.get(id).updatedAt<updatedAt)rows.set(id,row);
 });
 return {alerts:[...rows.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),publishedAt:iso($('channel > pubDate').first().text())};
}
export function normalizeForecast(data,grid){
 const rows=Array.isArray(data)?data:[data];if(rows.length!==grid.points.length)throw Error('incomplete_grid');
 return rows.map((r,i)=>{if(!r.hourly?.time?.length||!Array.isArray(r.hourly.temperature_2m)||!Array.isArray(r.hourly.rain)||!Array.isArray(r.hourly.wind_speed_10m))throw Error('invalid_forecast');if(Array.isArray(r.hourly.showers))r.hourly.rain=r.hourly.rain.map((v,j)=>Number.isFinite(v)&&Number.isFinite(r.hourly.showers[j])?Math.round((v+r.hourly.showers[j])*1000)/1000:null);return {...grid.points[i],modelLatitude:r.latitude,modelLongitude:r.longitude,hourly:r.hourly,units:r.hourly_units};});
}
