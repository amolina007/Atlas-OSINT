import test from 'node:test';import assert from 'node:assert/strict';import {weatherGrid,weatherViewportGrid,parseAlerts,normalizeForecast} from '../netlify/lib/weather.mjs';import {weatherColor,rainWindow} from '../dist/observatorio-weather.mjs';
test('grid has 25 centered samples with bounded coordinates',()=>{const g=weatherGrid(-33.4,-70.6,4);assert.equal(g.points.length,25);assert.equal(g.points[12].latitude,-33.4);assert.equal(g.step,.8);assert.throws(()=>weatherGrid(NaN,0));assert.throws(()=>weatherGrid(0,0,100));assert.ok(weatherGrid(0,179,12).points.every(p=>Math.abs(p.longitude)<=180));});
test('GDACS includes only current climate hazards and keeps latest event report',()=>{const item=(type,date,current='true')=>`<item><title>Alert</title><gdacs:eventtype>${type}</gdacs:eventtype><gdacs:eventid>1</gdacs:eventid><gdacs:iscurrent>${current}</gdacs:iscurrent><gdacs:datemodified>${date}</gdacs:datemodified><geo:lat>-33</geo:lat><geo:long>-70</geo:long><gdacs:alertlevel>Orange</gdacs:alertlevel></item>`;const d=parseAlerts('<rss><channel><pubDate>2026-11-08</pubDate>'+item('EQ','2026-11-08')+item('FL','2026-11-07')+item('FL','2026-11-08')+item('WF','2026-11-08','false')+'</channel></rss>',Date.parse('2026-11-08T12:00:00Z'));assert.equal(d.alerts.length,1);assert.equal(d.alerts[0].updatedAt,'2026-11-08T00:00:00.000Z');assert.match(d.alerts[0].url,/https:\/\/www.gdacs.org/);});
test('partial forecasts are rejected and null values are not zero rainfall',()=>{assert.throws(()=>normalizeForecast({},weatherGrid(0,0)));assert.equal(weatherColor('rain',null),'#9aa7a0');assert.notEqual(weatherColor('rain',0),weatherColor('rain',10));});
test('rain layer includes showers and supports street-level viewport grids',()=>{const grid=weatherGrid(-33,-70,.02);assert.equal(grid.step,.004);const rows=grid.points.map(()=>({hourly:{time:[1,2],temperature_2m:[10,11],rain:[.2,null],showers:[.4,.3],wind_speed_10m:[2,3]}}));const out=normalizeForecast(rows,grid);assert.deepEqual(out[12].hourly.rain,[.6,null]);});

test('rain windows distinguish dry weather from missing data and preserve traces',()=>{assert.equal(rainWindow({rain:[0,0]},0,2),0);assert.equal(rainWindow({rain:[.01,.02]},0,2),.03);assert.equal(rainWindow({rain:[0,null]},0,2),null);assert.equal(rainWindow({rain:[1]},0,24),null);assert.equal(rainWindow({rain:[1]},-1,1),null);});

test('viewport cells tile wide, tall and dateline-crossing maps without gaps',()=>{for(const b of [[-55,-17,-85,-60],[-35,-33,-75,-65],[-30,-20,170,190],[-85,85,-180,180]]){const g=weatherViewportGrid(...b);assert.equal(g.points.length,49);assert.deepEqual(g.points[0].bounds[0],[b[0],b[2]]);const end=g.points[48].bounds[1];assert.ok(Math.abs(end[0]-b[1])<1e-8&&Math.abs(end[1]-b[3])<1e-8);for(let i=0;i<49;i++){const r=g.points[i];assert.ok(Math.abs(r.longitude)<=180);if(i%7<6)assert.ok(Math.abs(r.bounds[1][1]-g.points[i+1].bounds[0][1])<1e-8);if(i<42)assert.ok(Math.abs(r.bounds[1][0]-g.points[i+7].bounds[0][0])<1e-8);}}assert.throws(()=>weatherViewportGrid(-90,90,-180,180));});

import {uncoveredWeatherBounds,bufferedWeatherBounds} from '../dist/observatorio-weather-coverage.mjs';
test('buffer covers ordinary pans and gaps are explicit for larger pans',()=>{const view={south:-30,north:-24,west:-114,east:-104},buffer=bufferedWeatherBounds(view);assert.equal(uncoveredWeatherBounds(view,buffer).length,0);assert.equal(uncoveredWeatherBounds({...view,west:-111,east:-101},buffer).length,0);const moved={...view,west:-105,east:-95},gaps=uncoveredWeatherBounds(moved,buffer);assert.ok(gaps.length);assert.equal(gaps[0].east,-95);assert.equal(uncoveredWeatherBounds(view,null).length,1);assert.equal(uncoveredWeatherBounds({south:0,north:10,west:175,east:185},{south:0,north:10,west:-185,east:-175}).length,0);});

import {weatherGridFits,weatherWorldShift} from '../dist/observatorio-weather-coverage.mjs';
test('zooming in refreshes coarse grids, minor pans reuse a fitting grid',()=>{
 const view={south:-35,north:-30,west:-74,east:-66},b=bufferedWeatherBounds(view),g=weatherViewportGrid(b.south,b.north,b.west,b.east);
 assert.equal(weatherGridFits(view,g),true);
 assert.equal(weatherGridFits({...view,west:-73,east:-65},g),true);
 assert.equal(weatherGridFits({south:-34,north:-31.5,west:-72,east:-68},g),false);
 assert.equal(weatherGridFits({...view,west:-40,east:-32},g),false);
});
test('world grid shifts as one rectangle without dropping edge cells',()=>{
 const view={south:-50,north:60,west:40,east:260},g=weatherViewportGrid(-80,80,-180,180),shift=weatherWorldShift(view,g);
 // Original per-cell shifting moved the western column to the east and tore
 // the edge of a cell whose midpoint was farther than 180 degrees away.
 const shifted=g.points.map(p=>p.bounds.map(([lat,lon])=>[lat,lon+shift]));
 for(let row=0;row<7;row++)for(let col=0;col<6;col++)assert.ok(Math.abs(shifted[row*7+col][1][1]-shifted[row*7+col+1][0][1])<1e-8);
 const crossing={south:-20,north:20,west:170,east:190},crossGrid=weatherViewportGrid(-30,30,-200,-160);
 assert.equal(weatherWorldShift(crossing,crossGrid),360);
 assert.equal(weatherGridFits(crossing,crossGrid),true);
});

import {alignWeatherHour} from '../dist/observatorio-weather.mjs';
test('cached and fresh forecast hour boundaries never select an absent timestamp',()=>{
 const times=Array.from({length:48},(_,i)=>1000+i*3600),fresh=Array.from({length:48},(_,i)=>4600+i*3600),rows=[{hourly:{time:fresh}}];
 assert.equal(alignWeatherHour(times,rows,0,24),1);
 assert.equal(alignWeatherHour(times,rows,5,24),5);
 assert.equal(alignWeatherHour(times,rows,47,24),24);
 assert.equal(alignWeatherHour(times,[{hourly:{time:[99999999]}}],0,24),0);
});
