import importlib.util,pathlib,unittest,copy
spec=importlib.util.spec_from_file_location('refresh',pathlib.Path(__file__).parents[1]/'scripts/refresh-map-layers.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class RefreshTests(unittest.TestCase):
 def setUp(self):self.old={'metadata':{'periodEnd':'2026-09-30','eventCount':1},'conflicts':[{'count':1}],'incidents':[{'id':'one'}]}
 def test_network_failure_retains_content_and_date(self):
  def fail():raise TimeoutError()
  result=m.refresh(self.old,fail,'conflict-catalog.json','now');self.assertEqual(result['incidents'],self.old['incidents']);self.assertEqual(result['metadata']['periodEnd'],'2026-09-30');self.assertEqual(result['metadata']['refresh']['status'],'retained');self.assertNotIn('refresh',self.old['metadata'])
 def test_regression_retained(self):
  d=copy.deepcopy(self.old);d['metadata']['periodEnd']='2026-08-31';self.assertEqual(m.refresh(self.old,lambda:d,'conflict-catalog.json','now')['metadata']['refresh']['status'],'retained')
 def test_partial_retained(self):
  d=copy.deepcopy(self.old);d['incidents']=[];self.assertEqual(m.refresh(self.old,lambda:d,'conflict-catalog.json','now')['metadata']['refresh']['status'],'retained')
 def test_valid_revision_same_date_accepted(self):
  d=copy.deepcopy(self.old);d['incidents'][0]['id']='corrected';self.assertEqual(m.refresh(self.old,lambda:d,'conflict-catalog.json','now')['incidents'][0]['id'],'corrected')
if __name__=='__main__':unittest.main()
