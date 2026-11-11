// Curated public evidence. Review date is NOT the date of the measurements.
export const forceReviewDate='2026-11-11';
const belfer={name:'Belfer Center · análisis con datos IISS/Oryx',url:'https://www.belfercenter.org/research-analysis/has-russian-ukraine-war-reached-turning-point-favoring-ukraine'};
const sipri={name:'SIPRI · gasto militar 2025',url:'https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025'};
const amnesty={name:'Amnistía Internacional · investigación de armamento',url:'https://www.amnesty.org/en/latest/news/2025/05/sudan-advanced-chinese-weaponry-provided-by-uae-identified-in-breach-of-arms-embargo-new-investigation/'};
const un={name:'ONU · informe S/2026/208',url:'https://monusco.unmissions.org/sites/default/files/2026-04/Report%20of%20the%20Secretary%20general%20S%202026%20208-n2605066.pdf'};
export const forceCategories=[['armor','Blindados, incluidos tanques'],['tanks','Tanques'],['drones','Drones'],['artillery','Artillería'],['aircraft','Aeronaves'],['helicopters','Helicópteros'],['airdefence','Defensa antiaérea'],['personnel','Personal militar'],['spending','Gasto militar']];
export const forceConflicts={
 ukraine:{name:'Ucrania',sides:['Rusia','Ucrania'],scope:'Fuerzas nacionales. El inventario total incluye material fuera del frente de Ucrania.',notes:'Los apoyos externos y las entregas no se suman al inventario sin una fecha y un criterio común.',facts:[
 {category:'armor',kind:'inventory',values:[12000,5727],qualifiers:['>','≈'],unit:'vehículos',period:'2025 · referencia histórica',scope:'Inventario nacional, no despliegue en el frente',source:belfer,note:'Cifras de The Military Balance 2026 citadas por el autor. Incluyen tanques: no sumarlos de nuevo como otra categoría.'},
 {category:'aircraft',kind:'losses',values:[380,200],qualifiers:['≥','≥'],unit:'aeronaves',period:'Desde febrero de 2022 hasta principios de junio de 2026',scope:'Pérdidas documentadas acumuladas en esta guerra',source:belfer,note:'Recuento Oryx citado por el análisis; no constituye un inventario disponible ni una cifra actual. La categoría de aeronaves no equivale solo a aviones de combate.'},
 {category:'spending',kind:'inventory',values:[190,84.1],qualifiers:['≈','≈'],unit:'miles de millones USD',period:'Año 2025',scope:'Gasto nacional anual, dólares corrientes',source:sipri,note:'Gasto militar anual estimado. No mide material desplegado ni probabilidad de victoria.'}
 ]},
 gaza:{name:'Gaza',sides:['Israel','Hamás y otros grupos armados'],scope:'Comparación asimétrica: el inventario nacional de Israel no equivale a las fuerzas desplegadas en Gaza.',notes:'Los grupos armados tienen estructuras distintas. No se atribuye a Hamás el inventario de otros grupos ni se presenta a la población civil como bando combatiente.',facts:[
 {category:'spending',kind:'inventory',values:[48.3,null],qualifiers:['',''],unit:'miles de millones USD',period:'Año 2025',scope:'Gasto nacional de Israel; no es gasto exclusivo de Gaza',source:sipri,note:'La fuente no ofrece aquí una cifra comparable para Hamás y otros grupos.'}
 ]},
 sudan:{name:'Sudán',sides:['Fuerzas Armadas de Sudán · SAF','Fuerzas de Apoyo Rápido · RSF'],scope:'SAF frente a RSF. Los equipos observados no permiten inferir el inventario total de cada fuerza.',notes:'Los recuentos anteriores a abril de 2023 no describen las existencias actuales tras pérdidas, capturas y nuevas entregas.',facts:[
 {category:'drones',kind:'inventory',values:[null,null],unit:'unidades',period:'Investigación publicada en mayo de 2025',scope:'Tipos de armamento documentados; sin recuento total',source:amnesty,note:'Amnistía identifica el uso por RSF de drones Wing Loong II y FeiHong-95. La investigación no establece cuántos siguen disponibles.'}
 ]},
 congo:{name:'RD del Congo · este',sides:['FARDC y aliados','AFC/M23 y apoyo de RDF'],scope:'Fuerzas presentes en el conflicto del este de la RDC. No se asigna todo el inventario de Ruanda al M23.',notes:'Cada actor conserva su identidad: el apoyo de RDF no convierte su inventario nacional en inventario propio de AFC/M23.',facts:[
 {category:'drones',kind:'inventory',values:[null,null],unit:'unidades',period:'Hecho del 23 de febrero de 2026',scope:'Uso de drones informado por la ONU; sin inventario',source:un,note:'El informe describe un ataque con dron de las FARDC en Rubaya. Documentar un ataque no permite calcular el número de drones disponibles.'}
 ]}
};
export function comparableFact(f){return f.values.length===2&&f.values.every(v=>Number.isFinite(v)&&v>=0)&&f.qualifiers?.every(q=>q===''||q==='≈');}
export function formatForceValue(value,qualifier='',unit=''){return value===null||value===undefined?'Sin cifra verificada':`${qualifier}${new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(value)} ${unit}`;}

// Snapshot of the public VizOryx presentation. Its cutoff is unspecified:
// never describe the retrieval day as the date of the losses.
for(const [category,values,label] of [
 ['tanks',[4456,1473],'Tanques'],
 ['drones',[26,29],'UCAV: drones de combate; excluye el total de drones pequeños/FPV'],
 ['helicopters',[186,59],'Helicópteros'],
 ['artillery',[1067,1002],'Solo artillería autopropulsada'],
 ['airdefence',[449,179],'Solo sistemas de misiles superficie-aire']
])forceConflicts.ukraine.facts.push({category,kind:'losses',values,qualifiers:['≥','≥'],unit:'unidades registradas',period:'Recuento acumulado desde 2022 · corte no informado',scope:label,source:{name:'VizOryx · presentación de registros Oryx',url:'https://vizoryx.vercel.app/'},note:'Consulta de la presentación pública: 11 de noviembre de 2026. La página no especifica el último corte del conjunto; no se presenta como una cifra al día. Registros con evidencia visual, no todas las pérdidas reales ni existencias restantes. Incluye los estados de pérdida del catálogo, no solo destrucciones.'});
