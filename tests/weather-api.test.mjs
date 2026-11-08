import test from 'node:test';import assert from 'node:assert/strict';import handler from '../netlify/functions/weather.mjs';
test('weather API preserves dated data on provider failure and validates requests',async()=>{
 const oldFetch=globalThis.fetch,oldNetlify=globalThis.Netlify,oldNow=Date.now;let calls=0,fail=false;
 globalThis.Netlify={env:{get:()=> 'branch-deploy'}};globalThis.fetch=async()=>{calls++;if(fail)throw Error('offline');return Response.json(Array.from({length:25},()=>({latitude:1,longitude:2,hourly_units:{},hourly:{time:[100,3700],temperature_2m:[10,11],rain:[0,1],wind_speed_10m:[5,6]}})));};
 try{assert.equal((await handler(new Request('https://dev.atlas.convergenciaaura.cl/.netlify/functions/weather?lat=bad&lon=2'))).status,400);assert.equal(calls,0);
 const req=()=>new Request('https://dev.atlas.convergenciaaura.cl/.netlify/functions/weather?lat=1&lon=2&span=0.7');const first=await (await handler(req())).json();assert.equal(first.rows.length,25);assert.equal(first.stale,false);
 fail=true;Date.now=()=>oldNow()+16*60000;const fallback=await (await handler(req())).json();assert.equal(fallback.stale,true);assert.equal(fallback.retrievedAt,first.retrievedAt);assert.deepEqual(fallback.rows,first.rows);
 globalThis.Netlify.env.get=()=> 'production';assert.equal((await handler(req())).status,404);
 }finally{globalThis.fetch=oldFetch;globalThis.Netlify=oldNetlify;Date.now=oldNow;}
});
