import test from 'node:test';
import assert from 'node:assert/strict';
import {extractArticle,validateSummary} from '../netlify/lib/news-summary.mjs';
const title='Un estudio sobre el territorio';
const paragraph='El equipo presentó los resultados de un estudio sobre el territorio y explicó los métodos empleados para obtener los datos. ';
const body=paragraph.repeat(12);
test('requires real body, matching title and free access',()=>{
 assert.equal(extractArticle(`<h1>${title}</h1><meta name="description" content="${body}">`,title),null);
 assert.equal(extractArticle(`<h1>Otro artículo</h1><article><p>${body}</p></article>`,title),null);
 assert.ok(extractArticle(`<h1>${title}</h1><article><p>${body}</p></article>`,title).length);
 assert.equal(extractArticle(`<script type="application/ld+json">${JSON.stringify({'@type':'NewsArticle',headline:title,articleBody:body,isAccessibleForFree:false})}</script>`,title),null);
});
test('rejects invented evidence, unsupported paragraph ids, insufficient and malformed output',()=>{
 const p=[{id:1,text:paragraph}];const valid={sufficient:true,what:[{text:'El equipo comunicó los resultados y describió su metodología.',paragraph:1,evidence:'El equipo presentó los resultados de un estudio'}],context:[]};
 assert.ok(validateSummary(valid,p));assert.equal(validateSummary({...valid,sufficient:false},p),null);
 assert.equal(validateSummary({...valid,what:[{...valid.what[0],paragraph:2}]},p),null);
 assert.equal(validateSummary({...valid,what:[{...valid.what[0],evidence:'Texto que no aparece en el artículo real'}]},p),null);
});

import {resolveEvidence} from '../netlify/lib/news-summary.mjs';
test('citation ids are derived from unique exact source evidence, never invented by the model',()=>{
 const p=[{id:1,text:paragraph}];const value={sufficient:true,what:[{text:'El equipo explicó los resultados de su estudio.',evidence:'El equipo presentó los resultados de un estudio'}],context:[]};
 assert.equal(resolveEvidence(value,p).what[0].paragraph,1);
 const ambiguous=structuredClone(value);assert.equal(resolveEvidence(ambiguous,[...p,{...p[0],id:2}]).what[0].paragraph,null);
 assert.equal(validateSummary(ambiguous,p),null);
});
