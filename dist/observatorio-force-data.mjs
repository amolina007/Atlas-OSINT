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
export function comparableFact(f){return !f.noComparison&&f.values.length===2&&f.values.every(v=>Number.isFinite(v)&&v>=0)&&f.qualifiers?.every(q=>q===''||q==='≈');}
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

// Equipment evidence is separate from inventory totals: deliveries are never
// added to stock, and observed types do not imply a known available quantity.
const air={name:'The Almanac · FlightGlobal/Cirium 2026',url:'https://airmuseums.co.uk/numbers/air-forces-of-the-world'};
const euaa={name:'EUAA · Sudan Security Situation, octubre 2026',url:'https://dip-aws.euaa.europa.eu/coi/1-general-description-security-situation/12-actors-conflict'};
const sudanDelivery={name:'Sudan Tribune · 6 agosto 2026',url:'https://sudantribune.com/article/317072'};
const sudanDrones={name:'Sudan Tribune · 24 septiembre 2026',url:'https://sudantribune.com/article/319213'};
const janes={name:'Janes · nuevos UAV de M23 en 2026',url:'https://www.janes.com/defence-intelligence-insights/defence-and-national-security-analysis/new-m23-uav-increase-threat-to-drc-stability'};
const equipment=(side,category,title,status,period,detail,source)=>({side,category,title,status,period,detail,source});
forceConflicts.ukraine.facts[0]={category:'armor',kind:'inventory',values:[11000,5000],qualifiers:['>','>'],unit:'vehículos estimados',period:'Junio de 2026 · estimación del autor',scope:'Tanques y otros blindados nacionales; operatividad no comprobada',source:belfer,note:'El autor estima los remanentes usando el inventario IISS de 2025 y pérdidas registradas. No es un censo de vehículos operativos ni incorpora de forma exhaustiva entregas, reparaciones o material almacenado. Se muestran los umbrales publicados, no una precisión de unidad.'};
forceConflicts.ukraine.facts.push({category:'aircraft',label:'Aviones de combate',kind:'inventory',values:[1559,118],qualifiers:['≈','≈'],unit:'aviones de catálogo',period:'1 octubre 2025 · referencia histórica, edición 2026',scope:'Flota nacional catalogada activa; no disponibilidad actual',source:air,note:'Corte Cirium reproducido por The Almanac. Excluye helicópteros y drones. La fuente advierte posible sobreestimación rusa y excluye los Mirage donados a Ucrania. No es un balance actualizado a noviembre de 2026.',noComparison:true});
forceConflicts.gaza.facts.push({category:'aircraft',label:'Aviones de combate',kind:'inventory',values:[48,null],qualifiers:['',''],unit:'F-35I',period:'18 enero 2026 · flota declarada',scope:'Solo F-35I de Israel; no toda la aviación ni despliegue en Gaza',source:{name:'The Times of Israel · declaración de la IAF',url:'https://www.timesofisrael.com/liveblog_entry/three-more-f-35-fighter-jets-land-in-israel-bringing-iafs-fleet-to-48/'},note:'La llegada de tres aparatos elevó esta flota a 48. Es el estado comunicado en esa fecha, no una certificación de disponibilidad operativa actual. Los pedidos futuros no se incluyen.'});
forceConflicts.sudan.facts=forceConflicts.sudan.facts.filter(f=>f.category!=='drones');
forceConflicts.congo.facts=forceConflicts.congo.facts.filter(f=>f.category!=='drones');
forceConflicts.ukraine.equipment=[
 equipment(0,'drones','Drones de ataque y reconocimiento','Existencias no publicadas','Análisis de junio de 2026','Belfer recoge adquisiciones y producción de ambos países; esas series anuales no permiten contar los drones que quedan disponibles.',belfer),
 equipment(1,'drones','FPV, fibra óptica, reconocimiento y ataque','Entregas declaradas','Informe de enero de 2026 · seis meses anteriores','El Ministerio informa más de 2,2 millones de drones entregados en seis meses. Es un flujo acumulado, no el inventario restante; no se utiliza como cifra del VS.',{name:'Ministerio de Defensa de Ucrania',url:'https://mod.gov.ua/en/news/systemic-changes-to-strengthen-ukraine-s-military-denys-shmyhal-reports-to-parliament-on-his-tenure-as-minister-of-defense'})
];
forceConflicts.gaza.equipment=[
 equipment(0,'armor','Merkava y Namer','Modelos documentados','26 febrero 2026','El Ministerio documenta mantenimiento de transmisiones de ambas plataformas. No publica el número de vehículos disponibles.',{name:'Ministerio de Defensa de Israel',url:'https://www.mod.gov.il/en/press-releases/press-room/israel-mod-signs-approx-42-million-deal-with-ashot-ashkelon-for-rehabilitation-of-merkava-tank-transmissions'}),
 equipment(0,'drones','Heron TP, Heron 1, Hermes 450 y 900','En servicio según la fuente','Página sin fecha · consultada 11 noviembre 2026','El Ministerio identifica estos modelos en servicio, sin cantidades ni disponibilidad en Gaza.',{name:'Ministerio de Defensa de Israel · DDR&D',url:'https://www.mod.gov.il/en/departments/directorate-of-defense-research-development-ddrd'})
];
forceConflicts.sudan.equipment=[
 equipment(0,'armor','100 Mohafiz','Entrega declarada, no stock','Julio de 2026 · publicado 6 agosto','Dos oficiales citados por Sudan Tribune atribuyen a SAF la recepción de 100 blindados. No hay verificación independiente del remanente operativo.',sudanDelivery),
 equipment(1,'armor','Vehículos blindados','Uso documentado, sin total','Informe de octubre de 2026','EUAA describe blindados entre las capacidades de RSF, sin un censo de unidades disponibles.',euaa),
 equipment(0,'drones','TB2, Akinci, Mohajer-6, Ababil-3 y Shahpar','Tipos reportados','Informe de octubre de 2026','EUAA recoge uso de estas familias. No ofrece cantidades operativas por modelo.',euaa),
 equipment(1,'drones','FH-95, Wing Loong II y otros UAV','Tipos reportados','Informe de octubre de 2026','EUAA documenta varias familias de drones RSF sin inventario total.',euaa),
 equipment(0,'drones','Más de 40 Shahpar','Entrega declarada, no stock','Desde julio · publicado 24 septiembre 2026','Sudan Tribune cita fuentes militares sobre transferencias; no permite saber cuántos siguen operativos.',sudanDrones),
 equipment(1,'drones','Más de 60 drones de varios tipos','Entrega declarada a una unidad','Publicado 24 septiembre 2026','Un comandante RSF declara recepciones en su unidad. No es el total de RSF ni una cifra corroborada de existencias.',sudanDrones),
 equipment(0,'aircraft','K-8 y Su-25; cazas MiG','Flota descrita, sin recuento','6 agosto 2026','Sudan Tribune describe estos aviones y repuestos para K-8. No publica cuántos pueden volar.',sudanDelivery),
 equipment(1,'aircraft','Sin fuerza aérea según EUAA','Evaluación de capacidad','Informe de octubre de 2026','EUAA distingue la ausencia de fuerza aérea de RSF de su uso extensivo de drones. No se compara un cero de inventario con aeronaves de catálogo SAF.',euaa)
];
forceConflicts.congo.equipment=[
 equipment(0,'drones','Drones de las FARDC','Uso informado por la ONU','23 febrero 2026 · informe S/2026/208','La ONU informa un ataque con dron en Rubaya, sin cantidad de aeronaves disponibles.',un),
 equipment(1,'drones','Cuadricóptero, hexacóptero y ala delta','Tipos observados; atribución evaluada','Agosto–septiembre de 2026','Janes analiza imágenes atribuidas a M23/RDF y valora probable su contexto. No identifica modelos con certeza ni un inventario; los aparatos derribados no se cuentan como disponibles.',janes)
];
export function evidenceFor(conflict,category,side){return (forceConflicts[conflict]?.equipment||[]).filter(e=>e.category===category&&e.side===side);}
forceConflicts.congo.equipment[0]=equipment(0,'drones','CH-4 / CH-4B y TAI ANKA','Empleo documentado por la ONU','Desde octubre 2025 · informe 11 junio 2026','El informe S/2026/466, párrafo 162, identifica estas plataformas empleadas por FARDC. No publica sus existencias operativas.',{name:'ONU · S/2026/466, párr. 162',url:'https://www.ecoi.net/en/file/local/2142213/n2611394.pdf'});
