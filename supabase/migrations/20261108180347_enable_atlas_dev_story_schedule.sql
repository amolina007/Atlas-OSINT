select cron.schedule('atlas-dev-story-updates','*/5 * * * *','select atlas_private.dispatch_story_updates();');
