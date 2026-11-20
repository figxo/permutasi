import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  STATIC_HTML_PAGES,
  loadSiteConfig,
  renderLocalizedPage,
  buildCloudflareRedirects,
  buildCloudflareHeaders,
  buildAdsTxt,
  buildRobotsTxt,
  buildSitemapXml
} from './site-builder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const config = loadSiteConfig(rootDir);

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

for (const pageFile of STATIC_HTML_PAGES) {
  const srcPath = path.join(rootDir, pageFile);
  if (!fs.existsSync(srcPath)) continue;
  const rawHtml = fs.readFileSync(srcPath, 'utf8');

  for (const lang of config.languages) {
    const builtHtml = renderLocalizedPage(rawHtml, pageFile, lang, config);
    const outPath = lang === 'en'
      ? path.join(distDir, pageFile)
      : path.join(distDir, lang, pageFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, builtHtml, 'utf8');
    console.log(`Generated ${lang === 'en' ? `dist/${pageFile}` : `dist/${lang}/${pageFile}`}`);
  }
}

if (config.seo.generateRobotsTxt) {
  fs.writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt(config), 'utf8');
  console.log('Generated dist/robots.txt');
}

if (config.seo.generateSitemapXml) {
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemapXml(config), 'utf8');
  console.log('Generated dist/sitemap.xml');
}

const adsTxt = buildAdsTxt(config);
if (adsTxt) {
  fs.writeFileSync(path.join(distDir, 'ads.txt'), adsTxt, 'utf8');
  console.log('Generated dist/ads.txt');
}

fs.writeFileSync(path.join(distDir, '_redirects'), buildCloudflareRedirects(), 'utf8');
console.log('Generated dist/_redirects');

fs.writeFileSync(path.join(distDir, '_headers'), buildCloudflareHeaders(), 'utf8');
console.log('Generated dist/_headers');

const assetsSrcDir = path.join(rootDir, 'assets');
if (fs.existsSync(assetsSrcDir)) {
  const assetsDestDir = path.join(distDir, 'assets');
  fs.cpSync(assetsSrcDir, assetsDestDir, { recursive: true });
  console.log('Copied dist/assets');
}

console.log(`Static build complete for ${config.siteUrl}`);
