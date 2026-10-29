import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DRAFT_KEY, validateReport, addDraft, readDrafts, sourceDirectory, sectionFromHash, hashForSection, publicUrl, escapeText } from '../dist/newsroom.mjs';

const report = { title: 'Observación del recorrido', place: 'Sector centro', observedOn: '2026-01-15', details: 'Observé un cambio de recorrido. Falta confirmar si es temporal.', sourceUrl: 'https://example.org/aviso', localConsent: 'on' };
const storage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };

test('navegación reconoce los cinco destinos y conserva mapa y mercados', () => {
  for (const section of ['news', 'territory', 'pulse', 'sources', 'contribute', 'map', 'markets']) assert.equal(sectionFromHash(hashForSection(section)), section);
  assert.equal(sectionFromHash(''), 'news');
  assert.equal(sectionFromHash('#access_token=auth-callback'), 'news');
});

test('no se guarda sin consentimiento ni con fechas inexistentes o futuras', () => {
  assert.throws(() => validateReport({ ...report, localConsent: '' }), /Confirma/);
  assert.throws(() => validateReport({ ...report, observedOn: '2099-01-01' }, '2026-10-29'), /fecha válida/);
  assert.throws(() => validateReport({ ...report, observedOn: '2026-02-30' }), /fecha válida/);
  assert.throws(() => validateReport({ ...report, details: '   ' }), /descripción/);
});

test('borradores se conservan entre lecturas, siempre locales y sin verificar', () => {
  const local = storage();
  const draft = addDraft(local, { ...report, status: 'verified', visibility: 'public' });
  assert.equal(draft.status, 'unverified');
  assert.equal(draft.visibility, 'local-only');
  assert.deepEqual(readDrafts(local), [draft]);
  assert.equal(readDrafts(storage()).length, 0);
});

test('almacenamiento corrupto o lleno no destruye borradores ni informa éxito', () => {
  const local = storage();
  local.setItem(DRAFT_KEY, '{corrupto');
  assert.throws(() => addDraft(local, report), SyntaxError);
  assert.equal(local.getItem(DRAFT_KEY), '{corrupto');
  const full = { getItem: () => '[]', setItem: () => { throw new Error('QuotaExceededError'); } };
  assert.throws(() => addDraft(full, report), /QuotaExceededError/);
});

test('directorio atribuye publicaciones, agrupa por fuente y rechaza enlaces ejecutables', () => {
  const directory = sourceDirectory([
    { source: 'Medio A', sourceUrl: 'https://example.org/a' },
    { source: 'Medio A', sourceUrl: 'https://example.org/b' },
    { source: 'Medio B', sourceUrl: 'https://other.example/c' },
    { source: 'Falso', sourceUrl: 'javascript:alert(1)' }
  ]);
  assert.equal(directory.length, 2);
  assert.equal(directory[0].count, 2);
  assert.equal(directory[0].href, 'https://example.org/a');
});

test('texto no confiable y referencias no pueden insertar scripts o credenciales', () => {
  assert.equal(publicUrl('javascript:alert(1)'), '');
  assert.equal(publicUrl('https://user:secret@example.org/'), '');
  assert.throws(() => validateReport({ ...report, sourceUrl: 'data:text/html,bad' }), /enlace/);
  assert.equal(escapeText('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
