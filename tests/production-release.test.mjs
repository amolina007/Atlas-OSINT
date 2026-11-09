import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import search from '../netlify/functions/news-search.mjs';
import summary from '../netlify/functions/news-summary.mjs';
import updates from '../netlify/functions/story-updates.mjs';
test('production APIs are active while retaining validation and authentication',async()=>{
 const previous=globalThis.Netlify;globalThis.Netlify={env:{get:()=> 'production'}};
 try{
  assert.equal((await search(new Request('https://atlas.convergenciaaura.cl/.netlify/functions/news-search'))).status,400);
  assert.equal((await summary(new Request('https://atlas.convergenciaaura.cl/.netlify/functions/news-summary?id=bad'))).status,400);
  assert.equal((await updates(new Request('https://atlas.convergenciaaura.cl/.netlify/functions/story-updates',{method:'POST',body:'{}'}))).status,401);
 }finally{globalThis.Netlify=previous;}
});
test('canonical homepage serves the complete observatory, preserving the legacy route',()=>{
 const lines=readFileSync('dist/_redirects','utf8').split('\n');
 assert.ok(lines.includes('/ /observatorio.html 200!'));
 assert.ok(lines.includes('/atlas-anterior /index.html 200!'));
});
