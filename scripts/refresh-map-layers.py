#!/usr/bin/env python3
"""Dev build refresh. Published snapshots are the durable last-good checkpoint.
Fail the build if the checkpoint cannot be read: never roll back to Git's older data.
Each source is independently validated before the atomic Netlify deploy.
"""
import datetime,json,os,pathlib,subprocess,sys,tempfile,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='https://dev.atlas.convergenciaaura.cl/data/'
LAYERS={'conflict-catalog.json':'periodEnd','ukraine-control.geojson':'date'}
def validate(data,name):
 m=data['metadata'];key=LAYERS[name];day=datetime.date.fromisoformat(m[key])
 if day>datetime.datetime.now(datetime.timezone.utc).date():raise ValueError('Future date')
 if name.endswith('.geojson'):
  features=data['features']
  if not features or not {'UA','RU'}.issubset({f['properties']['status'] for f in features}):raise ValueError('Missing control classes')
  for f in features:
   if f['geometry']['type'] not in ('Polygon','MultiPolygon') or f['properties']['date']!=m[key]:raise ValueError('Invalid geometry/date')
 else:
  if not data['conflicts'] or sum(x['count'] for x in data['conflicts'])!=m['eventCount']:raise ValueError('Incomplete catalog')
  if 'incidents' in data and len(data['incidents'])!=m['eventCount']:raise ValueError('Incomplete events')
 return data

def refresh(previous,loader,name,now):
 """Pure last-good selection; failed refresh cannot alter content or source dates."""
 try:
  candidate=validate(loader(),name)
  if candidate['metadata'][LAYERS[name]]<previous['metadata'][LAYERS[name]]:raise ValueError('Source date regressed')
  result=candidate;status='ok'
 except Exception:
  result=json.loads(json.dumps(previous));status='retained'
 result['metadata']['refresh']={'checkedAt':now,'status':status,'intervalHours':6}
 return result

def main():
 if os.environ.get('BRANCH')!='dev':
  print('Map refresh: skipped outside dev');return
 now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 # Obtain every checkpoint before doing any work. An unreachable site aborts this build.
 old={}
 for name in LAYERS:
  with urllib.request.urlopen(BASE+name,timeout=45) as r:old[name]=validate(json.load(r),name)
 with tempfile.TemporaryDirectory() as tmp:
  for name in LAYERS:
   out=pathlib.Path(tmp)/name
   def load():
    script='update-conflict-catalog.py' if name.endswith('.json') else 'update-conflict-layer.py'
    subprocess.run([sys.executable,str(ROOT/'scripts'/script),'--output',str(out)],check=True,timeout=600)
    return json.loads(out.read_text())
   result=refresh(old[name],load,name,now)
   (ROOT/'dist/data'/name).write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
   print(name,result['metadata'][LAYERS[name]],result['metadata']['refresh']['status'])
if __name__=='__main__':main()
