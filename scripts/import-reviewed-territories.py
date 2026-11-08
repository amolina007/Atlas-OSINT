#!/usr/bin/env python3
"""Convert reviewed, openly licensed map vectors to WGS84 polygons.
No fronts inferred from incidents, no external SVG executed. See manifest for
reviewed source hashes, observation dates, georeferencing and license. New
source revisions require another review; a failed import never replaces data.
Usage: python scripts/import-reviewed-territories.py /path/to/source-directory
The directory must contain control-{gaza,sudan,congo}.svg.
"""
import sys,json,hashlib,math
from pathlib import Path as File
import numpy as np
from svgelements import SVG,Path,Shape,Move,Line,Close
from shapely import make_valid,set_precision,symmetric_difference
from shapely.geometry import Polygon,box,mapping
from shapely.ops import unary_union,transform
ROOT=File(__file__).resolve().parents[1]

def polygons(g):
 if g.geom_type in ['Polygon','MultiPolygon']:return g
 return unary_union([polygons(p) for p in getattr(g,'geoms',[]) if p.geom_type in ['Polygon','MultiPolygon','GeometryCollection']])

def geometry(e):
 p=Path(e);p.reify();rings=[]
 for sub in p.as_subpaths():
  pts=[]
  for seg in sub:
   if isinstance(seg,Move):pts.append(tuple(seg.end));continue
   n=1 if isinstance(seg,(Line,Close)) else max(2,min(100,math.ceil(seg.length(error=.01)/2)))
   pts.extend(tuple(seg.point(t/n)) for t in range(1,n+1))
  if len(pts)>2:
   g=polygons(make_valid(Polygon(pts))).simplify(.25,preserve_topology=True)
   if not g.is_empty and g.area>.01:rings.append(g)
 # The reviewed paths use disjoint rings and nested cutouts. Retain the cutouts.
 result=Polygon()
 for g in sorted(rings,key=lambda g:g.area,reverse=True):result=polygons(make_valid(symmetric_difference(result,g,grid_size=.01)))
 return polygons(make_valid(result))

def convert(key,config,folder):
 path=folder/f'control-{key}.svg'
 assert hashlib.sha256(path.read_bytes()).hexdigest()==config['sourceSha256'],'Unreviewed source revision: preserving published snapshot'
 els=list(SVG.parse(str(path)).elements());byid={e.id:e for e in els if isinstance(e,Shape)}
 m=np.array(config['transform'])
 project=lambda x,y:(m[0,0]*np.asarray(x)+m[1,0]*np.asarray(y)+m[2,0],m[0,1]*np.asarray(x)+m[1,1]*np.asarray(y)+m[2,1])
 layers=[]
 for item in config['areas']:
  g=unary_union([geometry(byid[sel] if isinstance(sel,str) else els[sel]) for sel in item['elements']])
  if key=='congo':g=g.intersection(box(0,0,4513.67,5913.87))
  layers.append((item,polygons(make_valid(g))))
 # Flatten the author's explicit overpainted areas in SVG coordinates, NOT
 # "country minus rebel area" applied to unrelated country boundaries.
 if key=='sudan':
  covered=Polygon();flat=[]
  for item,g in reversed(layers):
   flat.append((item,polygons(make_valid(g.difference(covered)))))
   covered=unary_union([covered,g])
  layers=list(reversed(flat))
 if key=='congo':
  layers[0]=(layers[0][0],polygons(make_valid(layers[0][1].difference(layers[1][1]))))
 features=[]
 for item,g in layers:
  g=polygons(make_valid(transform(project,g))).buffer(0).simplify(config['simplifyDegrees'],preserve_topology=True)
  g=polygons(make_valid(set_precision(g.buffer(0),1e-6,mode="pointwise"))).buffer(0)
  assert not g.is_empty and g.is_valid
  assert g.geom_type in ['Polygon','MultiPolygon']
  features.append({'type':'Feature','properties':{'status':item['status'],'date':config['date'],'source':config['source'],'sourceUrl':config['sourceUrl'],'meaning':item.get('meaning','control estimado por la fuente')},'geometry':mapping(g)})
 metadata={k:v for k,v in config.items() if k not in ['areas','transform','simplifyDegrees']}
 metadata['conflict']=key;metadata['method']='Vectores del mapa original georreferenciados y simplificados por Atlas. No se deduce control a partir de noticias ni de puntos de presencia. Zonas sin color: sin clasificación en esta capa.'
 metadata['reviewedAt']='2026-11-08';metadata['updatePolicy']='Versión revisada; conservar hasta validar una nueva revisión de la fuente.'
 data={'type':'FeatureCollection','metadata':metadata,'features':features}
 dest=ROOT/'dist'/'data'/f'{key}-control.geojson';tmp=dest.with_suffix('.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')));tmp.replace(dest)
 print(key,config['date'],len(features),'bandos/categorías',dest.stat().st_size,flush=True)

if __name__=='__main__':
 manifest=json.loads((ROOT/'data-sources/territorial/manifest.json').read_text())
 for key,config in manifest.items():convert(key,config,File(sys.argv[1]))
