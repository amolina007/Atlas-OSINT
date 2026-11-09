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

## Live verification on the canonical domain

2026-11-09: Google OAuth returned successfully and the session survived reload.
The production feed returned 72 prepared articles; the UI initially rendered 24.
Public search returned 50 Valdivia results and rendered those with complete
summaries; an external-search article opened with context and a source link.
Like/unlike, comment publication and link copying succeeded. The technical
comment was removed. A private test story persisted with one timeline event.
Valdivia saved as a favorite and survived mobile reload with wind and a one-hour
period; temporary preferences are restored after verification.

Production APIs returned HTTP 200 for headlines, search, weather place search,
forecast, GDACS, war reports and territorial GeoJSON. Congo remains explicitly
historical; Ukraine's returned source cutoff was 2026-11-07.

The user authorized a temporary technical survey: single choice, scale and open
text were submitted from the mobile UI, all three results displayed, and the
survey was archived. No opinion-poll responses were submitted or altered.
Letters: public list and form checked; owner-authorized INSERT verified inside
a rolled-back transaction, without publishing test editorial content.

Background production feed completed at 13:56:21 UTC; the production story
worker completed at 14:00:09 UTC. Both dispatch requests returned HTTP 202.
Privacy checks with another authenticated identity returned zero private stories,
favorites, follows and votes. This is distinct from real browser-flow evidence.
