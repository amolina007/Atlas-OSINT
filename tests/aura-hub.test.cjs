const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const loader = readFileSync(resolve(__dirname, '../dist/aura-hub-loader.js'), 'utf8');
for (const [host, expected] of [
  ['dev--atlas-osint.netlify.app', '/aura-core-dev/aura-hub.js'],
  ['atlas.convergenciaaura.cl', '/aura-core/aura-hub.js'],
  ['localhost', '/aura-core-dev/aura-hub.js'],
  ['dev--atlas-osint.netlify.app.example.org', '/aura-core/aura-hub.js'],
]) test(`panel de ${host} usa el proxy correcto`, () => {
  let appended;
  runInNewContext(loader, {
    window: { location: { hostname: host } },
    document: { querySelector: () => null,
      createElement: () => ({ setAttribute() {} }),
      head: { append: script => { appended = script; } } },
  });
  assert.equal(appended.src, expected);
  const redirects = readFileSync(resolve(__dirname, '../dist/_redirects'), 'utf8');
  const line = redirects.split('\n').find(line => line.startsWith(`${expected} `));
  assert.ok(line, 'la ruta del loader debe estar publicada');
  const [, upstream, status] = line.split(/\s+/);
  assert.equal(upstream, expected.includes('-dev/')
    ? 'https://dev--convergencia-aura-core.netlify.app/js/aura-hub.js'
    : 'https://core.convergenciaaura.cl/js/aura-hub.js');
  assert.equal(status, '200');
});
