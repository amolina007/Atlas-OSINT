import test from 'node:test';import assert from 'node:assert/strict';
import {technicalMetrics,analysisHtml} from '../dist/observatorio-economy-analysis.mjs';
const series=Array.from({length:50},(_,i)=>({date:new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10),value:i+1}));
test('technical indicators use observation windows and exclude carried points',()=>{const m=technicalMetrics([...series,{date:'2026-03-01',value:1000,carried:true}]);assert.equal(m.sma20,40.5);assert.equal(m.sma50,25.5);assert.equal(m.rsi,100);assert.equal(m.count,50);assert.equal(m.max,50);});
test('RSI handles falling, flat and insufficient histories',()=>{assert.equal(technicalMetrics(series.map(r=>({...r,value:-r.value}))).rsi,0);assert.equal(technicalMetrics(series.map(r=>({...r,value:3}))).rsi,50);assert.equal(technicalMetrics(series.slice(0,14)).rsi,null);assert.equal(technicalMetrics([]).sma20,null);});
test('macro analysis avoids trading metrics and distinguishes monthly IPC',()=>{const d={value:.5,date:'2026-10',annual:4.5,series:[{date:'2026-10',value:.5}],source:{name:'INE',url:'https://www.ine.gob.cl/'}};const html=analysisHtml('ipc',d,d.series,String);assert.match(html,/doce meses: 4,5%/);assert.match(html,/Una observación/);assert.doesNotMatch(html,/RSI simple ·/);});
import {readFileSync} from 'node:fs';
import {fundamentalReading} from '../dist/observatorio-economy-analysis.mjs';
const fixture=id=>JSON.parse(readFileSync(new URL(`./fixtures/economy/${id}.json`,import.meta.url)));
test('real dollar and copper snapshots agree with independently calculated Python reference',()=>{
 for(const [id,a,b,rsi] of [['dolar',982.5105,969.0168,51.1418462528144],['cobre',6.492,6.5392,42.553191489361666]]){const m=technicalMetrics(fixture(id).series);assert.ok(Math.abs(m.sma20-a)<1e-9);assert.ok(Math.abs(m.sma50-b)<1e-9);assert.ok(Math.abs(m.rsi-rsi)<1e-9);}
});
test('all six real snapshots show dated sourced information and distinct fundamental analysis',()=>{
 for(const id of ['dolar','uf','ipc','tpm','cobre','imacec']){const d=fixture(id),html=analysisHtml(id,d,d.series,String);assert.ok(html.includes(d.source.url));assert.match(html,/ANÁLISIS FUNDAMENTAL/);assert.match(html,/ANÁLISIS TÉCNICO/);assert.ok(html.includes(fundamentalReading(id,d)));assert.doesNotMatch(html,/NaN|undefined/);}
 assert.match(fundamentalReading('dolar',fixture('dolar')),/subió \$7,99/);
 assert.match(fundamentalReading('uf',fixture('uf')),/100 UF.*\$687/);
 assert.match(fundamentalReading('ipc',fixture('ipc')),/0,5%.*4,5%/);
 assert.match(fundamentalReading('tpm',fixture('tpm')),/no todas las reuniones/);
 assert.match(fundamentalReading('cobre',fixture('cobre')),/subió US\$0,04/);
 assert.match(fundamentalReading('imacec',fixture('imacec')),/aumentó 0,2%.*mismo mes del año anterior/);
});
test('headline future rows do not leak into technical averages',()=>{const d=fixture('dolar'),html=analysisHtml('dolar',{...d,series:[...d.series,{date:'2027-01-01',value:1000000}]},d.series,String);assert.match(html,/\$982,51/);});
