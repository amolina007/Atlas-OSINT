import test from 'node:test';import assert from 'node:assert/strict';
import {verifiedClaim,auditBriefing,AUDIT_VERSION} from '../netlify/lib/briefing-audit.mjs';
const doc={url:'https://example.org/one',publishedAt:'2026-11-08T10:00:00Z',paragraphs:[{id:1,text:'Este párrafo de prueba explica el anuncio y los antecedentes documentados para comprenderlo.'}]};
const claim={text:'Síntesis',url:doc.url,articleId:'a',publishedAt:'2026-11-08T13:00:00Z'};
test('proof requires both semantic approval and an existing paragraph in the cited original',()=>{
 assert.equal(verifiedClaim(claim,{supported:false,paragraph:1},[doc],'now'),null);
 assert.equal(verifiedClaim(claim,{supported:true,paragraph:99},[doc],'now'),null);
 assert.equal(verifiedClaim({...claim,url:'https://different.example/'},{supported:true,paragraph:1},[doc],'now'),null);
 const value=verifiedClaim(claim,{supported:true,paragraph:1},[doc],'now');assert.equal(value.publishedAt,doc.publishedAt);assert.equal(value.evidence.paragraph,1);
});
const text='La autoridad anunció el inicio de una negociación para alcanzar un acuerdo entre las partes. Los representantes explicaron que el proceso tendrá etapas y que los resultados serán comunicados mediante publicaciones oficiales. La iniciativa se desarrolla en el marco de una discusión que continúa abierta y que requiere la participación de distintas instituciones. El calendario se conocerá cuando terminen las conversaciones iniciales. Las personas interesadas podrán consultar los documentos públicos y las declaraciones de sus representantes para conocer el estado del proceso y las decisiones que se adopten durante las siguientes jornadas.';
const article={id:'a',title:'Anuncio',reading:{sources:[{id:1,title:'Anuncio',url:doc.url,publishedAt:doc.publishedAt}],context:[{text:'Antecedente alternativo',source:1}]}};
const group={articleIds:['a'],what:claim,why:claim,before:claim,change:{...claim,text:'Otra redacción'},essential:true};
const html=`<html><h1>Anuncio</h1><article><p>${text}</p></article></html>`;
test('later wording alone never produces a change and unsupported relevance removes the group',async()=>{
 const fetchPage=async()=>({text:html});
 const judge=async()=>({checks:{what:{supported:true,paragraph:1},why0:{supported:true,paragraph:1},before:{supported:true,paragraph:1},change:{supported:true,paragraph:1}},whyKey:'why0',advance:false});
 const result=await auditBriefing({groups:[group]},[article],{fetchPage,judge});assert.equal(result.auditVersion,AUDIT_VERSION);assert.equal(result.groups.length,1);assert.equal(result.groups[0].change,null);
 const rejected=await auditBriefing({groups:[group]},[article],{fetchPage,judge:async()=>({checks:{what:{supported:true,paragraph:1}},whyKey:null})});assert.equal(rejected.groups.length,0);
});
test('source fetch failure cannot fabricate proof',async()=>{const result=await auditBriefing({groups:[group]},[article],{fetchPage:async()=>{throw Error('offline');},judge:()=>{throw Error('must not judge unavailable text');}});assert.equal(result.groups.length,0);});
