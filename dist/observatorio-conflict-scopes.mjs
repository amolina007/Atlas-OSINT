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
