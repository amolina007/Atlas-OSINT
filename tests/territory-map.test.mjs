import test from 'node:test';import assert from 'node:assert/strict';import {createTerritoryMapHandler} from '../netlify/functions/territory-map.mjs';
test('territory images use only fixed sources and reject unexpected content',async()=>{
 let calls=0;const h=createTerritoryMapHandler(async url=>{calls++;assert.match(url,/publishing.service.gov.uk/);return new Response('<svg/>',{headers:{'content-type':'image/svg+xml'}});});
 assert.equal((await h(new Request('https://atlas.test/?map=https://evil.test'))).status,404);assert.equal(calls,0);
 const r=await h(new Request('https://atlas.test/?map=gaza'));assert.equal(r.status,200);assert.match(r.headers.get('content-security-policy'),/sandbox/);
 const bad=createTerritoryMapHandler(async()=>new Response('<html/>',{headers:{'content-type':'text/html'}}));assert.equal((await bad(new Request('https://atlas.test/?map=sudan'))).status,502);
});
