# Direct OpenAI migration

All three inference entry points (summaries, briefing and story updates) use
`createAtlasAI`. It requires `ATLAS_OPENAI_API_KEY` and explicitly targets
https://api.openai.com/v1. Gateway-injected keys/base URLs are ignored, with no
fallback. The existing gpt-4.1-mini model and evidence validation are preserved.

Set ATLAS_OPENAI_API_KEY as a secret Functions environment variable in Netlify,
available to production and dev. Never place it in this repository or the browser.
A new deploy is required after configuration. Test one uncached real article and
check direct provider usage before declaring migration complete.

ATLAS_AI_ENABLED=false pauses new inference; cached summaries are still served.
This is a kill switch, not a daily spending limit. A global atomic daily quota has
not been implemented; provider dashboard alerts must not be described as hard caps.

Failed content attempts have a one-hour persistent cooldown. Successful summaries
retain their original durable cache. Missing configuration/paused AI does not
create a cooldown. Briefing runs only after preparation and only when the content
fingerprint changes; failed briefing generation retains the last good output.

This release does not yet batch summary generation/checking or provide distributed
in-flight deduplication. These are separate optimizations requiring quality and
concurrency checks. RSS, weather and territorial data remain independent of AI.
