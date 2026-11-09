# Atlas production promotion — 2026-11-09

The root route now serves observatorio.html on production and dev. The previous
interface remains at /atlas-anterior. Production uses the published Core assets;
dev continues using Core dev.

Public search, summaries, prepared feed, climate and reference map APIs now run
in production. Story updates still require the caller JWT and owner RLS. Workers
accept only the two canonical domains, POST and a valid single-use capability;
claiming an invalid/expired job cannot call the model.

Existing atlas_dev_* tables and site-wide atlas-dev-* caches retain their names
for compatibility and preserve account data. They are shared by the two Atlas
interfaces. Private follows, stories, favorites and votes retain their existing
owner policies. No table grants or RLS policies are widened by this release.

Migration atlas_production_workers moves the two private dispatch functions to
production and schedules the production map build every six hours. Existing
bounded queues prevent double claiming; there is still one feed/story schedule.

Validation: npm test; python3 -m unittest discover -s tests -p 'test_*.py'.
Runtime and responsive verification must be performed on atlas.convergenciaaura.cl,
not inferred from a ready deploy or a branch test.
