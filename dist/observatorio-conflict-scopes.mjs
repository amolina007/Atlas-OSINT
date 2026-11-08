const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const africa=['Algeria|Argelia','Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon|Camerun','Cape Verde|Cabo Verde','Central African Republic|Republica Centroafricana','Chad','Comoros|Comoras','Congo','DR Congo (Zaire)|Republica Democratica del Congo|RD del Congo','Djibouti|Yibuti','Egypt|Egipto','Equatorial Guinea|Guinea Ecuatorial','Eritrea','Eswatini|Swaziland','Ethiopia|Etiopia','Gabon','Gambia','Ghana','Guinea','Guinea-Bissau','Ivory Coast|Costa de Marfil','Kenya|Kenia','Lesotho|Lesoto','Liberia','Libya|Libia','Madagascar','Malawi|Malaui','Mali','Mauritania','Mauritius|Mauricio','Morocco|Marruecos','Mozambique','Namibia','Niger','Nigeria','Rwanda|Ruanda','Sao Tome and Principe|Santo Tome y Principe','Senegal','Seychelles','Sierra Leone|Sierra Leona','Somalia','South Africa|Sudafrica','South Sudan|Sudan del Sur','Sudan','Tanzania','Togo','Tunisia|Tunez','Uganda','Zambia','Zimbabwe|Zimbabue'];
const middleEast=['Bahrain|Barein','Iran|Iran','Iraq|Irak','Israel','Palestine|Palestina|Gaza|West Bank|Cisjordania','Jordan|Jordania','Kuwait','Lebanon|Libano|Beirut','Oman','Qatar|Catar','Saudi Arabia|Arabia Saudita','Syria|Siria','Turkey|Turquia','United Arab Emirates|Emiratos Arabes Unidos','Yemen (North Yemen)|Yemen'];
export const conflictScopes={
 all:{label:'Todos los conflictos',bounds:[[-58,-175],[78,175]],description:'Cobertura mundial según las fuentes disponibles.'},
 ukraine:{label:'Ucrania',bounds:[[44.2,22.1],[52.5,40.3]],aliases:['Ukraine|Ucrania|Kiev|Kyiv|Kharkiv|Jarkov|Donetsk|Luhansk|Lugansk|Zaporizhzhia|Zaporiyia|Kherson|Jerson|Crimea'],description:'Eventos en Ucrania y reportes identificables por sus lugares. Control territorial estimado: VIINA.'},
 middleEast:{label:'Medio Oriente',bounds:[[12,25],[43,64]],aliases:middleEast,description:'Incluye Israel y Palestina, Líbano, Siria, Irán, Irak, Yemen y la península arábiga. No incluye control territorial en esta capa.'},
 africa:{label:'África',bounds:[[-35,-19],[38,52]],aliases:africa,description:'Incluye Sudán, el Sahel, RD del Congo y los demás países africanos con registros disponibles. No incluye control territorial en esta capa.'}
};
const aliases=scope=>conflictScopes[scope].aliases.flatMap(s=>s.split('|')).map(norm);
export function matchesConflictScope(row,scope='all'){
 if(scope==='all')return true;if(!conflictScopes[scope])return false;
 const names=aliases(scope);
 // A documented country takes precedence over mentions of foreign actors.
 if(row.country)return names.includes(norm(row.country));
 const place=norm(row.location?.label);
 if(place){for(const key of ['ukraine','middleEast','africa'])if(aliases(key).includes(place))return key===scope;}
 // Unlocated press reports stay in the list, without inventing coordinates.
 const text=' '+norm([row.title,place].join(' ')).replace(/[^a-z0-9]+/g,' ')+' ';
 return names.some(name=>text.includes(' '+name.replace(/[^a-z0-9]+/g,' ')+' '));
}

export const specificConflicts={
 gaza:{parent:'middleEast',label:'Gaza',bounds:[[31.20,34.20],[31.62,34.60]],names:['Gaza','Rafah','Khan Younis','Khan Yunis','Jan Yunis','Deir al Balah','Jabalia','Yabalia','Beit Lahia'],description:'Gaza: registros identificados por localidad; no se incluyen automáticamente todos los eventos de Israel o Palestina.'},
 lebanon:{parent:'middleEast',label:'Líbano',bounds:[[33.0,35.0],[34.8,36.7]],countries:['Lebanon'],names:['Libano','Lebanon','Beirut'],description:'Eventos y noticias identificados con Líbano.'},
 syria:{parent:'middleEast',label:'Siria',bounds:[[32.2,35.5],[37.5,42.5]],countries:['Syria'],names:['Siria','Syria','Damasco','Alepo'],description:'Eventos y noticias identificados con Siria.'},
 yemen:{parent:'middleEast',label:'Yemen',bounds:[[12,42],[19,55]],countries:['Yemen (North Yemen)','Yemen'],names:['Yemen','Sana','Sanaa','Hodeida'],description:'Eventos y noticias identificados con Yemen.'},
 sudan:{parent:'africa',label:'Sudán',bounds:[[8.5,21],[22.5,39]],countries:['Sudan'],names:['Sudan','Darfur','Jartum','Khartoum','El Fasher','Al Fashir'],description:'Guerra en Sudán. Sudán del Sur es un país distinto y no se incluye en este filtro.'},
 congo:{parent:'africa',label:'RD del Congo',bounds:[[-14,12],[6,32]],countries:['DR Congo (Zaire)','Democratic Republic of Congo','Democratic Republic of the Congo'],names:['RD del Congo','RD Congo','RDC','Republica Democratica del Congo','Democratic Republic of Congo','Democratic Republic of the Congo','Kivu','Goma','Bukavu','M23'],description:'República Democrática del Congo. No incluye automáticamente la República del Congo (Brazzaville).'}
};
function hasName(text,names){const t=' '+norm(text).replace(/[^a-z0-9]+/g,' ')+' ';return names.some(n=>t.includes(' '+norm(n).replace(/[^a-z0-9]+/g,' ')+' '));}
export function matchesSpecificConflict(row,key='all'){
 if(key==='all')return true;const c=specificConflicts[key];if(!c)return false;
 if(row.country){if(c.countries)return c.countries.includes(row.country);return ['Israel','Palestine'].includes(row.country)&&hasName(row.place,c.names);}
 let text=[row.title,row.location?.label].filter(Boolean).join(' ');
 if(key==='sudan')text=norm(text).replace(/sudan del sur|south sudan/g,'');
 return hasName(text,c.names);
}
