import test from 'node:test';
import assert from 'node:assert/strict';
import {locateHeadline,newsEvidence} from '../dist/observatorio-news-geo.mjs';
test('reconoce una mención explícita y etiqueta el punto como aproximado',()=>{
 const p=locateHeadline('Tecnología e innovación a la economía de Aysén');
 assert.equal(p.label,'Aysén');assert.deepEqual(p.coordinates,[-73,-45.4]);assert.match(p.method,/No confirma/);
});
test('no asigna un lugar a titulares sin mención, coincidencias parciales o múltiples lugares',()=>{
 for(const title of ['El partido terminó empatado','La maquinaria china avanza en Chile','Chile y Argentina se reúnen','El estilo parisino'])assert.equal(locateHeadline(title),null);
});
test('evidencia conserva atribución, enlace y fechas sin exigir coordenadas',()=>{
 const a={id:'abc',title:'Nueva investigación científica',source:'Medio',publishedAt:'2026-11-04T12:00:00Z',capturedAt:'2026-11-04T13:00:00Z',url:'https://example.com/noticia',topics:['ciencia']};
 const e=newsEvidence(a);assert.equal(e.id,'news:abc');assert.equal(e.url,a.url);assert.equal(e.date,a.publishedAt);assert.equal(e.capturedAt,a.capturedAt);assert.equal(e.source,a.source);assert.equal(e.coordinates,null);
});

import { mapFallbackLocation } from '../dist/observatorio-news-geo.mjs';
test('map fallback requires explicit geographic context and rejects ambiguous or nominal mentions',()=>{
 assert.equal(mapFallbackLocation('Ataque en Gaza deja daños').label,'Gaza');
 assert.equal(mapFallbackLocation('Temporal en Valparaíso').label,'Valparaíso');
 assert.equal(mapFallbackLocation('Real Madrid gana la final'),null);
 assert.equal(mapFallbackLocation('Noticias de economía'),null);
 assert.equal(mapFallbackLocation('Encuentro en Chile y Argentina'),null);
});
