import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  STATIC_HTML_PAGES,
  SUPPORTED_LANGUAGES,
  loadSiteConfig,
  renderLocalizedPage,
  buildAdsTxt,
  buildRobotsTxt,
  buildSitemapXml
} from './scripts/site-builder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

function sendRenderedPage(res, pageFile, lang = 'en') {
  const srcPath = path.join(__dirname, pageFile);
  if (!fs.existsSync(srcPath)) {
    return res.status(404).end();
  }
  const config = loadSiteConfig(__dirname);
  const rawHtml = fs.readFileSync(srcPath, 'utf8');
  const html = renderLocalizedPage(rawHtml, pageFile, lang, config);
  res.type('html').send(html);
}

app.get('/', (req, res) => {
  const queryLang = String(req.query?.lang || '').toLowerCase();
  const lang = SUPPORTED_LANGUAGES.includes(queryLang) ? queryLang : 'en';
  return sendRenderedPage(res, 'index.html', lang);
});

for (const pageFile of STATIC_HTML_PAGES) {
  const cleanSlug = pageFile.replace(/\.html$/i, '');
  app.get([`/${pageFile}`, `/${cleanSlug}`], (req, res) => {
    const queryLang = String(req.query?.lang || '').toLowerCase();
    const lang = SUPPORTED_LANGUAGES.includes(queryLang) ? queryLang : 'en';
    return sendRenderedPage(res, pageFile, lang);
  });
}

app.get(['/en', '/en/'], (_req, res) => res.redirect(301, '/'));
for (const pageFile of STATIC_HTML_PAGES) {
  const cleanSlug = pageFile.replace(/\.html$/i, '');
  const dest = pageFile === 'index.html' ? '/' : `/${pageFile}`;
  app.get([`/en/${pageFile}`, `/en/${cleanSlug}`], (_req, res) => res.redirect(301, dest));
}

for (const lang of SUPPORTED_LANGUAGES) {
  if (lang === 'en') continue;
  app.get([`/${lang}`, `/${lang}/`], (_req, res) => sendRenderedPage(res, 'index.html', lang));
  for (const pageFile of STATIC_HTML_PAGES) {
    const cleanSlug = pageFile.replace(/\.html$/i, '');
    app.get([`/${lang}/${pageFile}`, `/${lang}/${cleanSlug}`], (_req, res) => {
      return sendRenderedPage(res, pageFile, lang);
    });
  }
}

app.get('/robots.txt', (_req, res) => {
  const config = loadSiteConfig(__dirname);
  if (!config.seo.generateRobotsTxt) {
    return res.status(404).end();
  }
  res.type('text/plain').send(buildRobotsTxt(config));
});

app.get('/sitemap.xml', (_req, res) => {
  const config = loadSiteConfig(__dirname);
  if (!config.seo.generateSitemapXml) {
    return res.status(404).end();
  }
  res.type('application/xml').send(buildSitemapXml(config));
});

app.get('/ads.txt', (_req, res) => {
  const config = loadSiteConfig(__dirname);
  const adsTxt = buildAdsTxt(config);
  if (!adsTxt) {
    return res.status(404).type('text/plain').send('AdSense publisherId is not configured in site.config.json\n');
  }
  res.type('text/plain').send(adsTxt);
});

app.post('/api/log-available-domain', express.json({ limit: '8kb' }), (req, res) => {
  const domain = String(req.body?.domain || '').trim().toLowerCase();
  const status = String(req.body?.status || '').trim().toLowerCase();
  const lang = SUPPORTED_LANGUAGES.includes(String(req.body?.lang || '').trim().toLowerCase())
    ? String(req.body.lang).trim().toLowerCase()
    : 'en';
  if (status !== 'available' || !domain || domain.length > 25) {
    return res.status(400).json({ ok: false, logged: false, error: 'Only available domains <= 25 chars are accepted.' });
  }
  return res.status(202).json({
    ok: true,
    logged: false,
    skipped: true,
    domain,
    lang,
    reason: 'Local Express preview (persists to Cloudflare D1 via functions/api/log-available-domain.js in production)'
  });
});

app.use(express.static(path.join(__dirname), { index: false }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
