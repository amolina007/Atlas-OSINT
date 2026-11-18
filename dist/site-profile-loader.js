/* Site display identity: dev only; global Aura identity remains unchanged. */
(() => {
  const host=location.hostname;
  const dev = /(^|[.-])dev([.-]|$)/i.test(host) || /^[a-f0-9]{12,}--atlas-osint\.netlify\.app$/i.test(host) || ['localhost','127.0.0.1'].includes(host);
  if (!dev || window.AuraSiteProfile || document.querySelector('script[data-site-profile-core]')) return;
  const script=document.createElement('script');script.src='/aura-core-dev/aura-site-profile.js';script.dataset.site='atlas';script.dataset.siteProfileCore='';script.defer=true;document.head.append(script);
})();
