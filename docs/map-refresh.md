# Automatic map refresh (dev only)

Supabase project utilbunuziotzumuiayu, cron job `atlas-dev-map-layers`, checks every six hours at minute 17 UTC. Job 19 calls a Netlify build hook constrained to branch dev. The hook is stored encrypted as `atlas_dev_map_build_hook` in Vault; never copy its value into Git or client assets. No production deployment is scheduled.

The build runs `scripts/refresh-map-layers.py` only when BRANCH=dev. It first retrieves all published dev checkpoints. If any checkpoint cannot be read, the build fails, keeping the previous deployment. Each source independently discovers/downloads and validates data. A source error, malformed/incomplete payload or regressing observation date retains that source's published checkpoint; metadata.refresh reports the failed attempt. Netlify publication is atomic. The browser revalidates every five minutes while visible and keeps its current data on failure.

UCDP: latest cumulative January-to-month Candidate CSV linked from the official downloads page; individual records and aggregate counts share one artifact/version. Candidate events are preliminary organized lethal violence, not a complete live attack feed. Source dates and location precision are shown. Default event window is last 30 days of the dataset, not today. Corrections with the same source date are accepted.

VIINA: current-year control archive, latest complete day, at least 30,000 localities, all published control classes retained. Territory is dissolved locality tessellation, not exact front lines. A missing current-year archive retains the prior snapshot until publication resumes.

Operational checks: query cron.job by jobname (do not expose command secrets), cron.job_run_details, Netlify dev deployment status, and public metadata.refresh. A failed build leaves older checkedAt visible. To pause, use cron.unschedule('atlas-dev-map-layers').

Tests: `python3 -m unittest discover -s tests -p 'test_*.py'`; `npm test`.
