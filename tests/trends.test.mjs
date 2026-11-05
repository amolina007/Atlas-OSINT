import test from 'node:test';import assert from 'node:assert/strict';
import {pollInput,pollClosed,percent} from '../dist/observatorio-trends.mjs';
const base={title:'¿Qué mejora necesita tu barrio?',description:'Prioridades locales',topic:'Vida cotidiana',kind:'single',options:'Áreas verdes\nTransporte\nOtra / No sé',closes:new Date(Date.now()+86400000).toISOString()};
test('poll creation validates options and uses canonical scales',()=>{assert.equal(pollInput(base).p_options.length,3);assert.throws(()=>pollInput({...base,options:'Igual\nigual'}));assert.throws(()=>pollInput({...base,options:'Solo una'}));assert.throws(()=>pollInput({...base,closes:'2020-01-01'}));assert.equal(pollInput({...base,kind:'scale'}).p_options.length,5);assert.deepEqual(pollInput({...base,kind:'text'}).p_options,[]);});
test('real percentages handle empty samples and closed surveys',()=>{assert.equal(percent(0,0),0);assert.equal(percent(1,4),25);assert.equal(pollClosed({closes_at:'2020-01-01'}),true);assert.equal(pollClosed({closes_at:base.closes,archived:true}),true);assert.equal(pollClosed({closes_at:base.closes,closed:false,archived:false}),false);});
import {readFileSync} from 'node:fs';import {JSDOM} from 'jsdom';
test('bottom ribbon retains five destinations with Trends fifth and account in header',()=>{const d=new JSDOM(readFileSync('dist/observatorio.html','utf8')).window.document;const buttons=d.querySelectorAll('.bottom-ribbon button');assert.equal(buttons.length,5);assert.equal(buttons[4].dataset.view,'tendencias');assert.ok(d.querySelector('#account'));assert.ok(d.querySelector('#tendencias'));});
import {surveyInput,surveyAnswers,questionsOf,answersOf,initTrends} from '../dist/observatorio-trends.mjs';
test('mixed survey validates every question and keeps question order',()=>{
 const qs=[{title:'Elige una prioridad',kind:'single',options:'Salud\nEducación'},{title:'Evalúa el servicio',kind:'scale'},{title:'Describe tu propuesta',kind:'text'}];
 const payload=surveyInput(base,qs);assert.deepEqual(payload.p_questions.map(q=>q.kind),['single','scale','text']);assert.equal(payload.p_questions[1].options.length,5);assert.deepEqual(payload.p_questions[2].options,[]);
 assert.throws(()=>surveyInput(base,[]));assert.throws(()=>surveyInput(base,Array(21).fill(qs[0])));assert.throws(()=>surveyInput(base,[qs[0],{...qs[0],options:'Solo'}]),/Pregunta 2/);
});
test('complete ballots map each answer to its question without mixing options',()=>{
 const p={questions:surveyInput(base,[{title:'Selecciona opciones',kind:'multiple',options:'A\nB\nC'},{title:'Evalúa el servicio',kind:'scale'},{title:'Describe tu propuesta',kind:'text'}]).p_questions};
 const data=new FormData();data.append('choice-0','0');data.append('choice-0','2');data.append('choice-1','4');data.append('answer-2','Propuesta de prueba');
 assert.deepEqual(surveyAnswers(p,data),[{choices:[0,2],answer:''},{choices:[4],answer:''},{choices:[],answer:'Propuesta de prueba'}]);
 data.delete('choice-1');assert.throws(()=>surveyAnswers(p,data),/pregunta 2/);data.append('choice-1','8');assert.throws(()=>surveyAnswers(p,data),/pregunta 2/);
 assert.equal(questionsOf({title:'Legacy',kind:'text',options:[]})[0].title,'Legacy');assert.deepEqual(answersOf({choices:[0],answer:''}),[{choices:[0],answer:''}]);
});
test('question editor can combine, reorder and remove questions preserving their contents',()=>{
 const dom=new JSDOM('<section id="tendencias"></section>');const previous=globalThis.document;globalThis.document=dom.window.document;
 try{initTrends({db:null,esc:String,date:String,login:()=>{}});const d=dom.window.document;let cards=()=>[...d.querySelectorAll('.survey-question-editor')];
 cards()[0].querySelector('[data-title]').value='Primera pregunta';d.querySelector('#add-question').click();cards()[1].querySelector('[data-title]').value='Segunda pregunta';
 cards()[1].querySelector('[data-kind]').value='text';cards()[1].querySelector('[data-kind]').dispatchEvent(new dom.window.Event('change'));assert.equal(cards()[1].querySelector('[data-options-wrap]').hidden,true);
 cards()[1].querySelector('[data-up]').click();assert.equal(cards()[0].querySelector('[data-title]').value,'Segunda pregunta');
 cards()[0].querySelector('[data-down]').click();assert.equal(cards()[0].querySelector('[data-title]').value,'Primera pregunta');cards()[1].querySelector('[data-remove]').click();assert.equal(cards().length,1);assert.equal(cards()[0].querySelector('[data-remove]').disabled,true);
 }finally{globalThis.document=previous;dom.window.close();}
});
import {questionKey} from '../dist/observatorio-trends.mjs';
test('duplicate review ignores accents, punctuation and case',()=>{assert.equal(questionKey('¿Qué opinas de la educación?'),questionKey('QUE OPINAS DE LA EDUCACION'));assert.throws(()=>surveyInput(base,[{title:'¿Qué opinas de la educación?',kind:'text'},{title:'QUE OPINAS DE LA EDUCACION',kind:'text'}]),/repetidas/);});
test('ordinary members can propose but publishing controls remain hidden',async()=>{
 const dom=new JSDOM('<section id="tendencias"></section>');const previous=globalThis.document;globalThis.document=dom.window.document;dom.window.HTMLDialogElement.prototype.close=function(){};
 const db={auth:{getSession:async()=>({data:{session:{user:{id:'member'}}}}),onAuthStateChange:()=>{}},rpc:async()=>({data:false}),from:()=>({select(){return this;},order(){return this;},limit:async()=>({data:[]})})};
 try{initTrends({db,esc:String,date:String,login:()=>{}});await new Promise(resolve=>setImmediate(resolve));const d=dom.window.document;assert.equal(d.querySelector('#new-poll').hidden,true);assert.equal(d.querySelector('[data-poll-mode="mine"]').hidden,true);assert.ok(d.querySelector('#propose-question'));assert.ok(d.querySelector('[data-poll-mode="proposals"]'));}finally{globalThis.document=previous;dom.window.close();}
});
