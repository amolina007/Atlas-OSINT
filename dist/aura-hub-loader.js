/* Un solo panel: Core dev en desarrollo; Core publicado en producción. */
(() => {
  'use strict';
  if (window.AuraHub || document.querySelector('script[data-aura-hub-core]')) return;
  const host = window.location.hostname;
  const dev = /^dev--[a-z0-9-]+\.netlify\.app$/.test(host) || /^[a-f0-9]{12,}--atlas-osint\.netlify\.app$/.test(host) || /^dev(?:\.[a-z0-9-]+)?\.convergenciaaura\.cl$/.test(host) || ['localhost', '127.0.0.1', 'verde-dev-convergencia-aura.netlify.app', 'planvecinal-dev-convergencia-aura.netlify.app'].includes(host);
  const script = document.createElement('script');
  script.src = dev ? '/aura-core-dev/aura-hub.js' : '/aura-core/aura-hub.js';
  script.defer = true;
  script.setAttribute('data-aura-hub-core', '');
  document.head.append(script);
})();

/* Site display identity: dev only; global Aura identity remains unchanged. */
(() => {
  const host=location.hostname;
  const dev = /(^|[.-])dev([.-]|$)/i.test(host) || /^[a-f0-9]{12,}--atlas-osint\.netlify\.app$/i.test(host) || ['localhost','127.0.0.1'].includes(host);
  if (!dev || window.AuraSiteProfile || document.querySelector('script[data-site-profile-core]')) return;
  const script=document.createElement('script');script.src='/aura-core-dev/aura-site-profile.js?atlas-profile=20261118';script.dataset.site='atlas';script.dataset.siteProfileCore='';script.defer=true;document.head.append(script);
})();
