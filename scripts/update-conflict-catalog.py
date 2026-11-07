#!/usr/bin/env python3
"""Aggregate UCDP Candidate CSV; retain all records, no claim of current activity."""
import argparse,csv,json,hashlib,datetime,urllib.request,collections,math,re,calendar,io
from pathlib import Path
URL='https://ucdp.uu.se/downloads/candidateged/GEDEvent_v26_01_26_09.csv'
p=argparse.ArgumentParser();p.add_argument('--input',type=Path);p.add_argument('--url');p.add_argument('--output',type=Path,default=Path('dist/data/conflict-catalog.json'));a=p.parse_args()
if a.url:URL=a.url
elif not a.input:
 page=urllib.request.urlopen('https://ucdp.uu.se/downloads/',timeout=45).read().decode()
 versions=re.findall(r'GEDEvent_v(\d{2})_01_(\d{2})_(\d{2})\.csv',page)
 if not versions:raise ValueError('No cumulative Candidate release found')
 version=max(versions,key=lambda v:(int(v[1]),int(v[2])))
 URL='https://ucdp.uu.se/downloads/candidateged/GEDEvent_v'+'_'.join((version[0],'01',version[1],version[2]))+'.csv'
parts=re.search(r'v(\d{2})_(\d{2})_(\d{2})_(\d{2})\.csv',URL).groups()
year=2000+int(parts[2]);month=int(parts[3]);period_end=f'{year}-{month:02d}-{calendar.monthrange(year,month)[1]}'
if period_end>str(datetime.datetime.now(datetime.timezone.utc).date()):raise ValueError('Future release')
raw=a.input.read_bytes() if a.input else urllib.request.urlopen(URL,timeout=90).read()
rows=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))));groups={};seen=set();incidents=[]
for r in rows:
 if r['id'] in seen:raise ValueError('Duplicate event ID')
 seen.add(r['id']);lat=float(r['latitude']);lon=float(r['longitude'])
 if not (math.isfinite(lat) and math.isfinite(lon) and abs(lat)<=90 and abs(lon)<=180):raise ValueError('Invalid location')
 start=r['date_start'][:10];end=r['date_end'][:10]
 datetime.date.fromisoformat(start);datetime.date.fromisoformat(end)
 if start>end or end>str(datetime.datetime.now(datetime.timezone.utc).date()):raise ValueError('Invalid event dates')
 incidents.append({'id':'ucdp-event:'+r['id'],'country':r['country'],'type':int(r['type_of_violence']),'title':r['conflict_name'],'actors':[r['side_a'],r['side_b']],'coordinates':[lon,lat],'start':start,'end':end,'date':end+'T00:00:00Z','place':r['where_coordinates'],'wherePrecision':int(r['where_prec']),'datePrecision':int(r['date_prec']),'review':r['code_status'],'sourceOffice':r['source_office'],'sourceArticle':r['source_article']})
 key=(r['country'],r['type_of_violence'],r['conflict_new_id'])
 if key not in groups:groups[key]={'id':'ucdp:'+':'.join(key),'country':r['country'],'region':r['region'],'type':int(r['type_of_violence']),'conflictId':r['conflict_new_id'],'title':r['conflict_name'],'count':0,'review':0,'start':r['date_start'][:10],'end':r['date_end'][:10],'points':[],'actors':set()}
 g=groups[key];g['count']+=1;g['review']+=r['code_status'].lower()!='clear';g['start']=min(g['start'],r['date_start'][:10]);g['end']=max(g['end'],r['date_end'][:10]);g['points'].append([lon,lat]);g['actors'].update([r['side_a'],r['side_b']])
for g in groups.values():
 pts=g.pop('points');g['coordinates']=[round(sum(p[i] for p in pts)/len(pts),4) for i in (0,1)];g['actors']=sorted(g['actors']);g['bounds']=[[min(p[1] for p in pts),min(p[0] for p in pts)],[max(p[1] for p in pts),max(p[0] for p in pts)]]
result={'metadata':{'source':'UCDP Candidate','version':'.'.join(parts),'period':f'{year}-01-01 — {period_end}','periodStart':f'{year}-01-01','periodEnd':period_end,'lastEventEnd':max(g['end'] for g in groups.values()),'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'url':URL,'docs':'https://ucdp.uu.se/downloads/','license':'CC BY 4.0','citation':'Hegre, Croicu, Eck & Högbladh (2020), Introducing the UCDP Candidate Events Dataset. doi:10.1177/2053168020935257','sha256':hashlib.sha256(raw).hexdigest(),'eventCount':len(rows),'countries':len(set(g['country'] for g in groups.values())),'method':'Agregado por país, tipo de violencia e identificador de conflicto. Punto central promedio de registros, no frente ni ubicación de un ataque. Candidatos preliminares; no implica actividad actual. Algunos intervalos terminan después del periodo de publicación.'},'incidents':sorted(incidents,key=lambda x:x['end'],reverse=True),'conflicts':sorted(groups.values(),key=lambda x:(x['country'],x['title']))}
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n');print(len(groups),'groups',len(rows),'events')
