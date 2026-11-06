#!/usr/bin/env python3
"""Build an attributed ODbL snapshot from VIINA. pip install shapely==2.0.7.
Run with --cache-dir to reuse source downloads; default fetches fresh originals.
No country subtraction or inferred control for missing observations.
"""
import argparse,csv,datetime,io,json,pathlib,zipfile,urllib.request,tempfile,hashlib
from shapely.geometry import shape,mapping
from shapely import union_all,make_valid

def build(cache,out,year):
    base='https://raw.githubusercontent.com/zhukovyuri/VIINA/main/Data/'
    urls={'viina-tess.json':base+'gn_UA_tess.geojson','viina-control.zip':f'https://media.githubusercontent.com/media/zhukovyuri/VIINA/main/Data/control_latest_{year}.zip'}
    for name,url in urls.items():
        path=cache/name
        if not path.exists():urllib.request.urlretrieve(url,path)
    latest='';statuses={};versions=set()
    with zipfile.ZipFile(cache/'viina-control.zip') as z:
        names=[n for n in z.namelist() if n.endswith('.csv')]
        if len(names)!=1:raise ValueError('Unexpected archive')
        with z.open(names[0]) as f:
            for row in csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig')):
                date=row['date']
                if date>latest:latest=date;statuses={};versions=set()
                if date==latest:
                    statuses[int(float(row['geonameid']))]=row['status'];versions.add(row['vcontrol_version'])
    date=datetime.datetime.strptime(latest,'%Y%m%d').date()
    if date>datetime.datetime.now(datetime.timezone.utc).date():raise ValueError('Future data date')
    if len(statuses)<30000:raise ValueError('Incomplete latest day; refusing to replace snapshot')
    tess=json.loads((cache/'viina-tess.json').read_text())
    groups={k:[] for k in ['UA','RU','CONTESTED','UNKNOWN']};counts={k:0 for k in groups}
    for feature in tess['features']:
        key=int(feature['properties']['geonameid']);status=statuses.get(key,'UNKNOWN')
        if status not in groups:status='UNKNOWN'
        geom=make_valid(shape(feature['geometry']))
        if geom.is_empty:raise ValueError('Empty locality geometry')
        groups[status].append(geom);counts[status]+=1
    if not counts['UA'] or not counts['RU']:raise ValueError('Missing control classes')
    features=[]
    for status,geoms in groups.items():
        if not geoms:continue
        # Dissolve cells; preserve topology and use only coarse display simplification.
        geom=union_all(geoms).simplify(0.002,preserve_topology=True)
        if geom.geom_type not in ('Polygon','MultiPolygon'):raise ValueError('Unexpected merged geometry')
        features.append({'type':'Feature','properties':{'status':status,'localities':counts[status],'date':str(date)},'geometry':mapping(geom)})
    result={'type':'FeatureCollection','features':features,'metadata':{'conflict':'Guerra Rusia–Ucrania','date':str(date),'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'VIINA 2.0 · Yuri Zhukov y Natalie Ayers','sourceUrl':'https://github.com/zhukovyuri/VIINA','license':'ODbL 1.0','licenseUrl':'https://opendatacommons.org/licenses/odbl/1-0/','sourceFiles':urls,'sourceVersions':sorted(versions),'counts':counts,'method':'Estado agregado de control territorial de VIINA por localidad. Celdas de localidades unidas por categoría y simplificadas para visualización; no son límites militares exactos. Las observaciones ausentes se mantienen sin determinar.','sha256':{name:hashlib.sha256((cache/name).read_bytes()).hexdigest() for name in urls}}}
    out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')));temp.replace(out)
    print(json.dumps({'date':str(date),'counts':counts,'bytes':out.stat().st_size}))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--cache-dir',type=pathlib.Path);p.add_argument('--year',type=int,default=datetime.datetime.now(datetime.timezone.utc).year);p.add_argument('--output',type=pathlib.Path,default=pathlib.Path('dist/data/ukraine-control.geojson'));a=p.parse_args()
    if a.cache_dir:build(a.cache_dir,a.output,a.year)
    else:
        with tempfile.TemporaryDirectory() as d:build(pathlib.Path(d),a.output,a.year)
