import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');
const origin = 'https://zaid-portfolio-phi.vercel.app';
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'The page must have one primary heading');

const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
for (const [, value] of html.matchAll(/\bsrcset="([^"]+)"/g)) {
  references.push(...value.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]));
}
for (const [, value] of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) references.push(value);
const checked = new Set();
for (const reference of references) {
  if (/^(data:|mailto:|tel:)/.test(reference)) continue;
  const url = new URL(reference, origin);
  if (url.origin !== origin) continue;
  if (url.hash && url.pathname === '/') {
    assert(ids.includes(decodeURIComponent(url.hash.slice(1))), `Missing anchor: ${reference}`);
  }
  if (url.pathname === '/') continue;
  const filename = resolve(root, '.' + decodeURIComponent(url.pathname));
  assert(filename.startsWith(root + '/'), `Reference escapes dist: ${reference}`);
  await access(filename);
  checked.add(filename);
}

for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
  const expression = new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]+"`, 's');
  assert(expression.test(html), `Missing ${property}`);
}
assert(
  html.includes(`rel="canonical" href="${origin}/"`),
  'Canonical must match the live homepage',
);
const image = html.match(/property="og:image"\s+content="([^"]+)"/s)?.[1];
await access(resolve(root, '.' + new URL(image).pathname));

if (process.argv.includes('--external')) {
  const external = [
    ...new Set(references.filter((href) => href.startsWith('https://github.com/'))),
  ];
  for (const url of external) {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    assert(response.ok, `${url}: HTTP ${response.status}`);
  }
  console.log(`Checked ${external.length} external GitHub links.`);
}
console.log(`Checked ${checked.size} local assets, fragment targets, and sharing metadata.`);
