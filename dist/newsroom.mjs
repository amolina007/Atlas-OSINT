export const DRAFT_KEY = 'atlas-citizen-drafts-v1';
const views = { news: 'newsroom', territory: 'territory', pulse: 'pulse', sources: 'sources', contribute: 'contribute', map: 'map', markets: 'markets' };

export function sectionFromHash(hash) {
  return Object.keys(views).find(key => `#${views[key]}` === hash) || 'news';
}

export function hashForSection(section) {
  return `#${views[section] || views.news}`;
}

export function escapeText(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function publicUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function sourceDirectory(articles) {
  const sources = new Map();
  for (const article of articles) {
    const href = publicUrl(article.sourceUrl);
    if (!href) continue;
    const host = new URL(href).hostname;
    const name = String(article.source || host);
    const key = `${name.toLocaleLowerCase()}|${host}`;
    const source = sources.get(key) || { name, host, href, count: 0 };
    source.count++;
    sources.set(key, source);
  }
  return [...sources.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validateReport(input, today = localDate()) {
  const report = Object.fromEntries(['title', 'place', 'observedOn', 'details', 'sourceUrl'].map(key => [key, String(input[key] || '').trim()]));
  if (report.title.length < 8 || report.title.length > 140) throw new Error('El título debe tener entre 8 y 140 caracteres.');
  if (!report.place || report.place.length > 100) throw new Error('Indica una comuna o sector de hasta 100 caracteres.');
  const parsed = new Date(`${report.observedOn}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(report.observedOn) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== report.observedOn || report.observedOn > today) throw new Error('Indica una fecha válida que no esté en el futuro.');
  if (report.details.length < 30 || report.details.length > 4000) throw new Error('La descripción debe tener entre 30 y 4000 caracteres.');
  if (report.sourceUrl.length > 1000 || (report.sourceUrl && !publicUrl(report.sourceUrl))) throw new Error('El enlace debe ser una dirección pública http o https sin credenciales.');
  if (!input.localConsent) throw new Error('Confirma que deseas guardar el borrador en este dispositivo.');
  return { ...report, sourceUrl: publicUrl(report.sourceUrl), status: 'unverified', visibility: 'local-only' };
}

export function readDrafts(storage) {
  const value = storage.getItem(DRAFT_KEY);
  if (!value) return [];
  const drafts = JSON.parse(value);
  if (!Array.isArray(drafts)) throw new Error('No se pudo leer el archivo de borradores de este navegador.');
  return drafts.filter(draft => draft && typeof draft.id === 'string' && typeof draft.title === 'string' && typeof draft.details === 'string' && draft.visibility === 'local-only').slice(0, 50);
}

export function addDraft(storage, report) {
  const drafts = readDrafts(storage);
  if (drafts.length >= 50) throw new Error('Alcanzaste 50 borradores. Descarga y elimina alguno antes de guardar otro.');
  const draft = { ...validateReport(report), id: globalThis.crypto.randomUUID(), createdAt: new Date().toISOString() };
  storage.setItem(DRAFT_KEY, JSON.stringify([draft, ...drafts]));
  return draft;
}

export function initNewsroom({ navigate }) {
  const byId = id => document.getElementById(id);
  const form = byId('citizenReportForm');
  const status = byId('citizenReportStatus');
  const draftList = byId('citizenDrafts');
  const date = byId('citizenDate');
  date.max = localDate();

  function renderDrafts() {
    let drafts;
    try { drafts = readDrafts(window.localStorage); }
    catch {
      draftList.innerHTML = '<div class="community-empty"><h2>Borradores no disponibles</h2><p>No se pudo leer el almacenamiento local. No se sobrescribieron tus datos.</p></div>';
      return;
    }
    draftList.innerHTML = drafts.length ? drafts.map(draft => `<article class="citizen-draft"><span class="citizen-badge">Sin verificar · Solo en este navegador</span><h2>${escapeText(draft.title)}</h2><p class="community-caption">${escapeText(draft.place)} · ${escapeText(draft.observedOn)}</p><p class="citizen-description">${escapeText(draft.details)}</p>${publicUrl(draft.sourceUrl) ? `<a href="${escapeText(publicUrl(draft.sourceUrl))}" target="_blank" rel="noopener noreferrer">Referencia aportada ↗</a>` : ''}<div class="community-actions"><button type="button" data-download-draft="${escapeText(draft.id)}">Descargar</button><button type="button" data-delete-draft="${escapeText(draft.id)}">Eliminar</button></div></article>`).join('') : '<div class="community-empty"><span aria-hidden="true">◎</span><h2>Tu primera mirada empieza aquí.</h2><p>Todavía no has guardado borradores. Un buen aporte distingue lo observado de lo que falta por comprobar.</p><button type="button" id="firstCitizenDraft">Preparar mi aporte</button></div>';
    byId('firstCitizenDraft')?.addEventListener('click', () => navigate('contribute'));
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      addDraft(window.localStorage, Object.fromEntries(new FormData(form)));
      form.reset();
      renderDrafts();
      status.textContent = 'Borrador guardado en este navegador. Puedes revisarlo en Pulso. No se ha enviado ni publicado.';
    } catch (error) {
      status.textContent = error instanceof SyntaxError ? 'No se pudieron leer tus borradores anteriores. No se sobrescribieron.' : error.name === 'QuotaExceededError' || error.name === 'SecurityError' ? 'El navegador no permite guardar el borrador. El texto sigue en el formulario.' : error.message;
    }
  });

  draftList.addEventListener('click', event => {
    const button = event.target.closest('[data-delete-draft], [data-download-draft]');
    if (!button) return;
    try {
      const drafts = readDrafts(window.localStorage);
      const id = button.dataset.deleteDraft || button.dataset.downloadDraft;
      const draft = drafts.find(item => item.id === id);
      if (!draft) return;
      if (button.dataset.deleteDraft) {
        if (!window.confirm('¿Eliminar este borrador de este navegador?')) return;
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts.filter(item => item.id !== id)));
        renderDrafts();
        return;
      }
      const blob = new Blob([JSON.stringify({ ...draft, note: 'Reporte sin verificar. Borrador local; no enviado ni publicado.' }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `atlas-aporte-${draft.observedOn}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      const message = document.createElement('p');
      message.setAttribute('role', 'status');
      message.textContent = 'No se pudo completar la acción. Tu borrador no se ha modificado.';
      draftList.append(message);
    }
  });

  function renderSources(articles, feedState = 'ready') {
    const directory = sourceDirectory(articles);
    byId('newsSourceDirectory').innerHTML = directory.length ? directory.map(source => `<article class="source-entry"><div><h3>${escapeText(source.name)}</h3><p>${escapeText(source.host)} · ${source.count} ${source.count === 1 ? 'publicación' : 'publicaciones'}</p></div><a href="${escapeText(source.href)}" target="_blank" rel="noopener noreferrer" aria-label="Ver una publicación de ${escapeText(source.name)}">Ver origen ↗</a></article>`).join('') : `<p class="community-caption">${feedState === 'loading' ? 'Consultando las fuentes del noticiero…' : 'No hay publicaciones disponibles en esta consulta. Intenta actualizar desde Hoy.'}</p>`;
  }
  renderDrafts();
  renderSources([], 'loading');
  return { renderDrafts, renderSources };
}
