// Writes public/sitemap.xml from the pinned catalog before `vite build` copies
// public/ into dist/. No dependencies; safe to run anywhere Node runs.
import { readFile, writeFile } from 'node:fs/promises'

const origin = 'https://cipherandchalk.vercel.app'
const projectRoot = new URL('../', import.meta.url)
const catalog = JSON.parse(
  await readFile(
    new URL('src/data/cmmc-213-catalog.json', projectRoot),
    'utf8',
  ),
)
const edition = 'cmmc-2-13-sep-2024'
const toKey = (id) => id.toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g, '-')
const xmlEscape = (value) => value.replaceAll('&', '&amp;')

const pages = [
  ['/', '1.0'],
  ['/learn?view=discover&collection=references', '0.9'],
  ['/practice', '0.8'],
  ['/glossary', '0.7'],
  ['/coverage', '0.7'],
  ['/about', '0.5'],
  ['/disclaimer', '0.3'],
]
for (const control of catalog.controls) {
  pages.push([
    `/learn?view=lesson&framework=cmmc&edition=${edition}&control=${toKey(control.id)}`,
    '0.6',
  ])
}

const entries = pages
  .map(([path, priority]) => {
    const loc = xmlEscape(origin + path)
    return `  <url><loc>${loc}</loc><priority>${priority}</priority></url>`
  })
  .join('\n')
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entries,
  '</urlset>',
  '',
].join('\n')
await writeFile(new URL('public/sitemap.xml', projectRoot), xml)
console.log(`sitemap: ${pages.length} URLs`)
