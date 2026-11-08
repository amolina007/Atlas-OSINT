import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {JSDOM} from 'jsdom';
import {initNews} from '../dist/observatorio-news.mjs';
test('news UI shows loading then 24, 48 and the remaining complete articles without duplicates',async()=>{
 const dom=new JSDOM(await readFile(new URL('../dist/observatorio.html',import.meta.url),'utf8'),{url:'https://dev.atlas.convergenciaaura.cl/#feed'});
 const keys=['window','document','location','localStorage','setInterval','fetch','IntersectionObserver'],old=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));let resolveHeadlines;
 const reading={status:'ready',what:[{text:'Hecho',source:1}],context:[{text:'Contexto',source:1}],sources:[{id:1,url:'https://example.org/source'}]};
 const articles=Array.from({length:50},(_,i)=>({id:String(i).padStart(64,'0'),title:'Noticia '+i,url:'https://example.org/'+i,source:'Medio',publishedAt:new Date().toISOString(),topics:['politica'],reading}));
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,location:dom.window.location,localStorage:dom.window.localStorage,setInterval:()=>0,IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}},fetch:async url=>String(url).includes('/headlines')?new Promise(r=>resolveHeadlines=r):Response.json({image:null})});
 try{
 initNews({view(){},esc:s=>String(s??''),date:s=>s,onNews(){},addNews(){},showNewsMap(){}});
 assert.match(document.querySelector('#news-feed').textContent,/Buscando noticias/);
 resolveHeadlines(Response.json({articles,topics:[{id:'politica',label:'Política'}],sources:[{status:'ok',label:'Política',count:50}],updatedAt:new Date().toISOString()}));
 await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
 const count=()=>document.querySelectorAll('.news-card').length;
 assert.equal(count(),24);assert.match(document.querySelector('#news-page-status').textContent,/24 de 50/);
 document.querySelector('#more-news').click();assert.equal(count(),48);
 document.querySelector('#more-news').click();assert.equal(count(),50);assert.equal(document.querySelector('#more-news').hidden,true);
 assert.equal(new Set([...document.querySelectorAll('.news-card')].map(n=>n.dataset.photoId)).size,50);
 }finally{Object.assign(globalThis,old);dom.window.close();}
});
