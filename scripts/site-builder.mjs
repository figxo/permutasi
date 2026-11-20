import fs from 'fs';
import path from 'path';
import '../assets/trust-i18n.js';

const trustI18n = globalThis.__TRUST_I18N__;

export const HEAD_MARKER_START = '<!-- SITE_CONFIG:HEAD_START -->';
export const HEAD_MARKER_END = '<!-- SITE_CONFIG:HEAD_END -->';

export const SUPPORTED_LANGUAGES = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];

export const STATIC_HTML_PAGES = [
  'index.html',
  'about.html',
  'privacy-policy.html',
  'terms.html',
  'disclaimer.html',
  'contact.html'
];

export const TRUST_PAGE_PATHS = [
  'about.html',
  'privacy-policy.html',
  'terms.html',
  'disclaimer.html',
  'contact.html'
];

const PAGE_FILE_TO_TYPE = {
  'about.html': 'about',
  'privacy-policy.html': 'privacy',
  'terms.html': 'terms',
  'disclaimer.html': 'disclaimer',
  'contact.html': 'contact'
};

const INDEX_SEO_BY_LANG = {
  en: {
    title: 'Domain Name — Domain Permutation Generator for Research & Portfolio',
    desc: 'Instantly generate domain name combination matrices for keyword domain with RFC 1035 validation and global SEO optimization.',
    keywords: 'domain, domain permutation, domain name generator, domain research, SEO, RFC 1035',
    ogLocale: 'en_US',
    ogSiteName: 'Domain Name — domainname.web.id',
    headline: '"domain" Domain Permutation Generator & Bulk Checker',
    about: 'Domain Name Research Utility, SEO Domain Strategy, and RFC 1035 DNS Validation'
  },
  id: {
    title: 'Generator Permutasi Domain domain untuk Riset & Portofolio',
    desc: 'Buat ratusan ide permutasi nama domain untuk keyword domain secara instan dengan validasi RFC 1035 dan optimasi SEO global.',
    keywords: 'domain, permutasi domain, generator nama domain, riset domain, SEO, RFC 1035',
    ogLocale: 'id_ID',
    ogSiteName: 'Domain Name — domainname.web.id (Indonesia)',
    headline: 'Generator Permutasi Domain & Bulk Checker "domain"',
    about: 'Utilitas Riset Nama Domain, Strategi SEO Domain, dan Validasi DNS RFC 1035'
  },
  es: {
    title: 'Generador de Permutaciones de Dominio domain para Investigación',
    desc: 'Genere matrices de combinación de dominios para la palabra clave domain con validación RFC 1035 y optimización SEO global.',
    keywords: 'domain, permutación de dominios, generador de dominios, investigación de dominios, SEO, RFC 1035',
    ogLocale: 'es_ES',
    ogSiteName: 'Domain Name — domainname.web.id (Español)',
    headline: 'Generador de Permutaciones de Dominio "domain" y Verificador',
    about: 'Utilidad de Investigación de Dominios, Estrategia SEO y Validación DNS RFC 1035'
  },
  pt: {
    title: 'Gerador de Permutações de Domínio domain para Pesquisa',
    desc: 'Gere matrizes de combinação de domínios para a palavra-chave domain com validação RFC 1035 e otimização SEO global.',
    keywords: 'domain, permutação de domínios, gerador de domínios, pesquisa de domínios, SEO, RFC 1035',
    ogLocale: 'pt_BR',
    ogSiteName: 'Domain Name — domainname.web.id (Português)',
    headline: 'Gerador de Permutações de Domínio "domain" e Verificador',
    about: 'Utilitário de Pesquisa de Domínios, Estratégia SEO e Validação DNS RFC 1035'
  },
  fr: {
    title: 'Générateur de Permutations de Domaines domain pour Recherche',
    desc: 'Générez des matrices de combinaison de domaines pour le mot-clé domain avec validation RFC 1035 et optimisation SEO globale.',
    keywords: 'domain, permutation de domaines, générateur de domaines, recherche de domaines, SEO, RFC 1035',
    ogLocale: 'fr_FR',
    ogSiteName: 'Domain Name — domainname.web.id (Français)',
    headline: 'Générateur de Permutations de Domaines "domain" et Vérificateur',
    about: 'Utilitaire de Recherche de Domaines, Stratégie SEO et Validation DNS RFC 1035'
  },
  de: {
    title: 'domain Domain Permutationsgenerator für Recherche & Portfolio',
    desc: 'Generieren Sie Domain-Kombinationsmatrizen für das Schlüsselwort domain mit RFC 1035-Validierung und globaler SEO-Optimierung.',
    keywords: 'domain, Domain-Permutation, Domain-Generator, Domain-Recherche, SEO, RFC 1035',
    ogLocale: 'de_DE',
    ogSiteName: 'Domain Name — domainname.web.id (Deutsch)',
    headline: '"domain" Domain Permutationsgenerator & Bulk Checker',
    about: 'Domain-Recherche-Tool, SEO-Domain-Strategie und RFC-1035-DNS-Validierung'
  },
  ru: {
    title: 'Генератор перестановок доменов domain для исследований',
    desc: 'Создавайте матрицы комбинаций доменных имен для ключевого слова domain с проверкой RFC 1035 и глобальной SEO-оптимизацией.',
    keywords: 'domain, перестановка доменов, генератор доменов, исследование доменов, SEO, RFC 1035',
    ogLocale: 'ru_RU',
    ogSiteName: 'Domain Name — domainname.web.id (Русский)',
    headline: 'Генератор перестановок доменов "domain" и массовая проверка',
    about: 'Инструмент анализа доменных имен, SEO-стратегия и проверка DNS RFC 1035'
  },
  ja: {
    title: 'domain ドメイン置換ジェネレータ (リサーチ & ポートフォリオ)',
    desc: 'RFC 1035検証とグローバルSEO最適化を備えたキーワード「domain」のドメイン名組み合わせマトリックスを生成します。',
    keywords: 'domain, ドメイン置換, ドメイン生成, ドメインリサーチ, SEO, RFC 1035',
    ogLocale: 'ja_JP',
    ogSiteName: 'Domain Name — domainname.web.id (日本語)',
    headline: '「domain」ドメイン置換ジェネレータ & 一括チェック',
    about: 'ドメイン名リサーチツール、SEOドメイン戦略、RFC 1035 DNS検証'
  }
};

const DEFAULT_CONFIG = {
  siteUrl: 'https://domainname.web.id',
  contactEmail: 'admin@domainname.web.id',
  languages: ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'],
  googleAnalytics: {
    measurementId: ''
  },
  googleSearchConsole: {
    verificationToken: ''
  },
  googleAdSense: {
    publisherId: '',
    directSellerId: 'f08c47fec0942fa0',
    enableAutoAdsScript: true,
    generateAdsTxt: true
  },
  otherVerifications: {
    bingMsvalidate: '',
    yandexVerification: '',
    ahrefsSiteVerification: ''
  },
  seo: {
    generateRobotsTxt: true,
    generateSitemapXml: true
  }
};

export function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function normalizeSiteUrl(rawUrl) {
  const trimmed = String(rawUrl || DEFAULT_CONFIG.siteUrl).trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmed)) {
    return DEFAULT_CONFIG.siteUrl;
  }
  return trimmed;
}

export function normalizeContactEmail(rawEmail) {
  const trimmed = String(rawEmail || DEFAULT_CONFIG.contactEmail).trim();
  if (/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(trimmed)) {
    return trimmed;
  }
  return DEFAULT_CONFIG.contactEmail;
}

export function normalizeVerificationToken(rawValue) {
  const val = String(rawValue || '').trim();
  if (!val) return '';
  const contentMatch = val.match(/content\s*=\s*["']([^"']+)["']/i);
  if (contentMatch) {
    return contentMatch[1].trim();
  }
  return val;
}

export function normalizeAdSenseIds(rawPublisherId) {
  const val = String(rawPublisherId || '').trim();
  if (!val) return { clientId: '', adsTxtPubId: '' };
  const match = val.match(/(?:ca-)?(pub-\d{10,24})/i);
  if (match) {
    const pubId = match[1].toLowerCase();
    return {
      clientId: `ca-${pubId}`,
      adsTxtPubId: pubId
    };
  }
  return { clientId: '', adsTxtPubId: '' };
}

export function normalizeGaMeasurementId(rawId) {
  const val = String(rawId || '').trim();
  if (!val) return '';
  if (/^(G|GT|AW|DC)-[A-Z0-9-]+$/i.test(val)) {
    return val.toUpperCase();
  }
  return '';
}

export function loadSiteConfig(rootDir) {
  const configPath = path.join(rootDir, 'site.config.json');
  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    fileConfig = JSON.parse(raw);
  }

  const rawLanguages = Array.isArray(fileConfig.languages) && fileConfig.languages.length > 0
    ? fileConfig.languages
    : DEFAULT_CONFIG.languages;
  const languages = rawLanguages.filter((l) => SUPPORTED_LANGUAGES.includes(l));

  return {
    siteUrl: normalizeSiteUrl(process.env.SITE_URL || fileConfig.siteUrl || DEFAULT_CONFIG.siteUrl),
    contactEmail: normalizeContactEmail(process.env.CONTACT_EMAIL || fileConfig.contactEmail || DEFAULT_CONFIG.contactEmail),
    languages: languages.length > 0 ? languages : DEFAULT_CONFIG.languages,
    googleAnalytics: {
      measurementId: normalizeGaMeasurementId(
        process.env.GA_MEASUREMENT_ID || fileConfig.googleAnalytics?.measurementId || ''
      )
    },
    googleSearchConsole: {
      verificationToken: normalizeVerificationToken(
        process.env.GSC_VERIFICATION || fileConfig.googleSearchConsole?.verificationToken || ''
      )
    },
    googleAdSense: {
      publisherId: String(
        process.env.ADSENSE_CLIENT_ID || fileConfig.googleAdSense?.publisherId || ''
      ).trim(),
      directSellerId: String(
        process.env.ADSENSE_DIRECT_SELLER_ID || fileConfig.googleAdSense?.directSellerId || DEFAULT_CONFIG.googleAdSense.directSellerId
      ).trim(),
      enableAutoAdsScript: process.env.ADSENSE_ENABLE_AUTO_ADS !== undefined
        ? String(process.env.ADSENSE_ENABLE_AUTO_ADS).trim().toLowerCase() === 'true'
        : fileConfig.googleAdSense?.enableAutoAdsScript !== false,
      generateAdsTxt: fileConfig.googleAdSense?.generateAdsTxt !== false
    },
    otherVerifications: {
      bingMsvalidate: normalizeVerificationToken(
        process.env.BING_VERIFICATION || fileConfig.otherVerifications?.bingMsvalidate || ''
      ),
      yandexVerification: normalizeVerificationToken(
        process.env.YANDEX_VERIFICATION || fileConfig.otherVerifications?.yandexVerification || ''
      ),
      ahrefsSiteVerification: normalizeVerificationToken(
        process.env.AHREFS_SITE_VERIFICATION || fileConfig.otherVerifications?.ahrefsSiteVerification || ''
      )
    },
    seo: {
      generateRobotsTxt: fileConfig.seo?.generateRobotsTxt !== false,
      generateSitemapXml: fileConfig.seo?.generateSitemapXml !== false
    }
  };
}

export function buildHeadTags(config) {
  const lines = [];

  if (config.googleSearchConsole.verificationToken) {
    lines.push(
      `    <meta name="google-site-verification" content="${escapeHtmlAttr(config.googleSearchConsole.verificationToken)}">`
    );
  }

  if (config.otherVerifications.bingMsvalidate) {
    lines.push(
      `    <meta name="msvalidate.01" content="${escapeHtmlAttr(config.otherVerifications.bingMsvalidate)}">`
    );
  }

  if (config.otherVerifications.yandexVerification) {
    lines.push(
      `    <meta name="yandex-verification" content="${escapeHtmlAttr(config.otherVerifications.yandexVerification)}">`
    );
  }

  if (config.otherVerifications.ahrefsSiteVerification) {
    lines.push(
      `    <meta name="ahrefs-site-verification" content="${escapeHtmlAttr(config.otherVerifications.ahrefsSiteVerification)}">`
    );
  }

  const adsense = normalizeAdSenseIds(config.googleAdSense.publisherId);
  if (adsense.clientId) {
    lines.push(
      `    <meta name="google-adsense-account" content="${escapeHtmlAttr(adsense.clientId)}">`
    );
    if (config.googleAdSense.enableAutoAdsScript) {
      lines.push(
        `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsense.clientId)}" crossorigin="anonymous"></script>`
      );
    }
  }

  const gaId = config.googleAnalytics.measurementId;
  if (gaId) {
    const safeGaJson = JSON.stringify(gaId).replace(/</g, '\\u003c');
    lines.push(`    <!-- Google Analytics (GA4) -->`);
    lines.push(
      `    <script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}"></script>`
    );
    lines.push(
      `    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${safeGaJson});</script>`
    );
  }

  if (lines.length === 0) {
    return `${HEAD_MARKER_START}\n    <!-- Configure GA4, GSC, or AdSense IDs in site.config.json or Cloudflare Environment Variables -->\n    ${HEAD_MARKER_END}`;
  }

  return `${HEAD_MARKER_START}\n${lines.join('\n')}\n    ${HEAD_MARKER_END}`;
}

export function renderStaticHtml(rawHtml, config, _options = {}) {
  const headBlock = buildHeadTags(config);

  let html = rawHtml;
  const markerRegex = /<!-- SITE_CONFIG:HEAD_START -->[\s\S]*?<!-- SITE_CONFIG:HEAD_END -->/;

  if (markerRegex.test(html)) {
    html = html.replace(markerRegex, headBlock);
  } else {
    html = html.replace('</head>', `    ${headBlock}\n</head>`);
  }

  if (config.siteUrl && config.siteUrl !== DEFAULT_CONFIG.siteUrl) {
    html = html.replace(/https:\/\/domainname\.web\.id/g, escapeHtmlAttr(config.siteUrl));
  }

  if (config.contactEmail && config.contactEmail !== DEFAULT_CONFIG.contactEmail) {
    html = html.replace(/admin@domainname\.web\.id/g, escapeHtmlAttr(config.contactEmail));
  }

  return html;
}

function setElementInnerTextById(html, id, text) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(<([a-z0-9]+)[^>]*\\bid="${escapedId}"[^>]*>)([\\s\\S]*?)(<\\/\\2>)`, 'i');
  return html.replace(regex, `$1${escapeHtmlText(text)}$4`);
}

function updateSelectedLangOption(html, lang) {
  let out = html.replace(/(<option\s+value="[a-z-]+")\s+selected(?=>)/gi, '$1');
  const targetRegex = new RegExp(`(<option\\s+value="${lang}")(?=>)`, 'i');
  out = out.replace(targetRegex, '$1 selected');
  return out;
}

function localizeTrustPageHtml(rawHtml, pageFile, lang, config) {
  const pageType = PAGE_FILE_TO_TYPE[pageFile];
  if (!pageType || lang === 'en') {
    return renderStaticHtml(rawHtml, config);
  }

  const pack = trustI18n.getPagePack(pageType, lang);
  const chrome = trustI18n.CHROME[lang];
  if (!pack || !chrome) {
    return renderStaticHtml(rawHtml, config);
  }

  const siteUrl = config.siteUrl;
  const contactEmail = config.contactEmail;
  const canonicalUrl = `${siteUrl}${trustI18n.localizeInternalHref(pageFile, lang)}`;
  const ogLocale = trustI18n.OG_LOCALE[lang] || 'en_US';

  let html = renderStaticHtml(rawHtml, config);

  html = html.replace(/<html\s+lang="en"/i, `<html lang="${escapeHtmlAttr(lang)}"`);
  html = html.replace(/data-page-lang="en"/i, `data-page-lang="${escapeHtmlAttr(lang)}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlText(pack.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*">/i,
    `<meta name="description" content="${escapeHtmlAttr(pack.desc)}">`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*">/i,
    `<link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}">`
  );
  html = html.replace(
    /<meta\s+property="og:locale"\s+content="[^"]*">/i,
    `<meta property="og:locale" content="${escapeHtmlAttr(ogLocale)}">`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*">/i,
    `<meta property="og:title" content="${escapeHtmlAttr(pack.title)}">`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*">/i,
    `<meta property="og:description" content="${escapeHtmlAttr(pack.desc)}">`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*">/i,
    `<meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}">`
  );

  const jsonLdObj = trustI18n.buildTrustJsonLd(
    pageType,
    lang,
    siteUrl,
    contactEmail,
    pack.title,
    pack.desc,
    pageFile
  );
  const safeJsonLd = JSON.stringify(jsonLdObj, null, 2).replace(/</g, '\\u003c');
  html = html.replace(
    /<script type="application\/ld\+json" id="schemaJsonLd">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json" id="schemaJsonLd">\n    ${safeJsonLd}\n    </script>`
  );

  html = updateSelectedLangOption(html, lang);

  const mainHtml = trustI18n.buildTrustMainHtml(pageType, lang, contactEmail);
  if (mainHtml) {
    html = html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/i, `$1\n${mainHtml}\n    $2`);
  }

  // Update header & footer chrome labels
  const labelMap = {
    navGen: chrome.navGenerator,
    navAbout: chrome.navAbout,
    navPrivacy: chrome.navPrivacy,
    navTerms: chrome.navTerms,
    navDisclaimer: chrome.navDisclaimer,
    navContact: chrome.navContact,
    navOpenTool: chrome.openTool,
    footerSlogan: chrome.footerSlogan,
    footerEditionsTitle: chrome.footerEditions,
    footerLegalTitle: chrome.footerLegal,
    footerAbout: chrome.footerAbout,
    footerPrivacy: chrome.footerPrivacy,
    footerTerms: chrome.footerTerms,
    footerDisclaimer: chrome.footerDisclaimer,
    footerContact: chrome.footerContact,
    footerCopyright: chrome.copyright
  };
  for (const [id, text] of Object.entries(labelMap)) {
    html = setElementInnerTextById(html, id, text);
  }

  // Localize internal header/footer navigation links (except data-trust-edition pills)
  html = html.replace(/<a\s+([^>]*?)href="(\/(?:index|about|privacy-policy|terms|disclaimer|contact)\.html)"([^>]*)>/gi, (full, pre, href, post) => {
    if (/data-trust-edition="/i.test(pre) || /data-trust-edition="/i.test(post)) {
      return full;
    }
    return `<a ${pre}href="${trustI18n.localizeInternalHref(href, lang)}"${post}>`;
  });

  // Update active state on footer data-trust-edition pills
  html = html.replace(
    /<a\s+href="([^"]*)"\s+data-trust-edition="([a-z-]+)"([^>]*)>/gi,
    (_m, href, code) => {
      const isCurrent = code === lang;
      const cls = isCurrent
        ? 'px-2.5 py-1.5 text-xs rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold transition-colors'
        : 'px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
      const ariaAttr = isCurrent ? ' aria-current="page"' : '';
      return `<a href="${escapeHtmlAttr(href)}" data-trust-edition="${escapeHtmlAttr(code)}" hreflang="${escapeHtmlAttr(code)}" lang="${escapeHtmlAttr(code)}"${ariaAttr} class="${cls}">`;
    }
  );

  return html;
}

function localizeIndexHtml(rawHtml, lang, config) {
  if (!lang || lang === 'en' || !INDEX_SEO_BY_LANG[lang]) {
    return renderStaticHtml(rawHtml, config);
  }

  const seo = INDEX_SEO_BY_LANG[lang];
  const siteUrl = config.siteUrl;
  const canonicalUrl = `${siteUrl}/${lang}/`;

  let html = renderStaticHtml(rawHtml, config);
  html = html.replace(/<html\s+lang="en"/i, `<html lang="${escapeHtmlAttr(lang)}"`);
  html = html.replace(
    /<title id="metaTitle">[\s\S]*?<\/title>/i,
    `<title id="metaTitle">${escapeHtmlText(seo.title)}</title>`
  );
  html = html.replace(
    /<meta name="description" id="metaDesc" content="[^"]*">/i,
    `<meta name="description" id="metaDesc" content="${escapeHtmlAttr(seo.desc)}">`
  );
  html = html.replace(
    /<meta name="keywords" id="metaKeywords" content="[^"]*">/i,
    `<meta name="keywords" id="metaKeywords" content="${escapeHtmlAttr(seo.keywords)}">`
  );
  html = html.replace(
    /<link rel="canonical" id="canonicalLink" href="[^"]*">/i,
    `<link rel="canonical" id="canonicalLink" href="${escapeHtmlAttr(canonicalUrl)}">`
  );
  html = html.replace(
    /<meta property="og:locale" id="ogLocale" content="[^"]*">/i,
    `<meta property="og:locale" id="ogLocale" content="${escapeHtmlAttr(seo.ogLocale)}">`
  );
  html = html.replace(
    /<meta property="og:site_name" id="ogSiteName" content="[^"]*">/i,
    `<meta property="og:site_name" id="ogSiteName" content="${escapeHtmlAttr(seo.ogSiteName)}">`
  );
  html = html.replace(
    /<meta property="og:title" id="ogTitle" content="[^"]*">/i,
    `<meta property="og:title" id="ogTitle" content="${escapeHtmlAttr(seo.title)}">`
  );
  html = html.replace(
    /<meta property="og:description" id="ogDesc" content="[^"]*">/i,
    `<meta property="og:description" id="ogDesc" content="${escapeHtmlAttr(seo.desc)}">`
  );
  html = html.replace(
    /<meta property="og:url" id="ogUrl" content="[^"]*">/i,
    `<meta property="og:url" id="ogUrl" content="${escapeHtmlAttr(canonicalUrl)}">`
  );
  html = html.replace(
    /<meta name="twitter:title" id="twitterTitle" content="[^"]*">/i,
    `<meta name="twitter:title" id="twitterTitle" content="${escapeHtmlAttr(seo.title)}">`
  );
  html = html.replace(
    /<meta name="twitter:description" id="twitterDesc" content="[^"]*">/i,
    `<meta name="twitter:description" id="twitterDesc" content="${escapeHtmlAttr(seo.desc)}">`
  );

  const schemaObj = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software-application`,
        url: canonicalUrl,
        name: seo.title,
        alternateName: seo.ogSiteName,
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Modern Web Browser.',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: seo.about,
        inLanguage: lang,
        availableLanguage: SUPPORTED_LANGUAGES,
        isAccessibleForFree: true,
        keywords: seo.keywords,
        description: seo.desc,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: seo.title,
        headline: seo.headline,
        description: seo.desc,
        inLanguage: lang,
        isAccessibleForFree: true,
        about: {
          '@type': 'Thing',
          name: seo.about
        },
        publisher: {
          '@type': 'Organization',
          name: 'Domain Name',
          url: `${siteUrl}/`,
          email: config.contactEmail
        },
        mainEntity: {
          '@id': `${canonicalUrl}#software-application`
        }
      }
    ]
  };
  const safeSchema = JSON.stringify(schemaObj, null, 2).replace(/</g, '\\u003c');
  html = html.replace(
    /<script type="application\/ld\+json" id="schemaJsonLd">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json" id="schemaJsonLd">\n    ${safeSchema}\n    </script>`
  );

  html = html.replace(
    /<a\s+href="([^"]*)"\s+hreflang="([a-z-]+)"\s+lang="([a-z-]+)"\s+data-footer-lang="([a-z-]+)"\s+onclick="([^"]*)"[^>]*>/gi,
    (_m, href, _hl, _l, code, onclickVal) => {
      const isCurrent = code === lang;
      const cls = isCurrent
        ? 'px-2.5 py-1.5 text-xs rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold transition-colors'
        : 'px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
      const ariaAttr = isCurrent ? ' aria-current="page"' : '';
      return `<a href="${escapeHtmlAttr(href)}" hreflang="${escapeHtmlAttr(code)}" lang="${escapeHtmlAttr(code)}" data-footer-lang="${escapeHtmlAttr(code)}" onclick="${escapeHtmlAttr(onclickVal)}"${ariaAttr} class="${cls}">`;
    }
  );

  html = updateSelectedLangOption(html, lang);
  html = html.replace('</head>', `    <script>window.__STATIC_PAGE_LANG__ = ${JSON.stringify(lang)};</script>\n</head>`);
  return html;
}

export function renderLocalizedPage(rawHtml, pageFile, lang, config) {
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  if (pageFile === 'index.html') {
    return localizeIndexHtml(rawHtml, targetLang, config);
  }
  return localizeTrustPageHtml(rawHtml, pageFile, targetLang, config);
}

export function buildCloudflareRedirects() {
  return [
    '/en / 301',
    '/en/ / 301',
    '/en/* /:splat 301',
    ''
  ].join('\n');
}

export function buildCloudflareHeaders() {
  return [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: SAMEORIGIN',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=86400, stale-while-revalidate=604800',
    '',
    '/sitemap.xml',
    '  Cache-Control: public, max-age=3600',
    '',
    '/robots.txt',
    '  Cache-Control: public, max-age=3600',
    '',
    '/ads.txt',
    '  Cache-Control: public, max-age=3600',
    ''
  ].join('\n');
}

export function buildAdsTxt(config) {
  if (!config.googleAdSense.generateAdsTxt) return '';
  const adsense = normalizeAdSenseIds(config.googleAdSense.publisherId);
  if (!adsense.adsTxtPubId) return '';
  const sellerId = config.googleAdSense.directSellerId || 'f08c47fec0942fa0';
  return `google.com, ${adsense.adsTxtPubId}, DIRECT, ${sellerId}\n`;
}

export function buildRobotsTxt(config) {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${config.siteUrl}/sitemap.xml`,
    ''
  ].join('\n');
}

export function buildSitemapXml(config) {
  const baseUrl = config.siteUrl;
  const langs = config.languages;
  const today = new Date().toISOString().slice(0, 10);

  const buildAlternates = (pageFile) => {
    const links = langs.map((lang) => {
      const href = pageFile === 'index.html'
        ? (lang === 'en' ? `${baseUrl}/` : `${baseUrl}/${lang}/`)
        : `${baseUrl}${trustI18n.localizeInternalHref(pageFile, lang)}`;
      return `    <xhtml:link rel="alternate" hreflang="${escapeHtmlAttr(lang)}" href="${escapeHtmlAttr(href)}" />`;
    });
    const xDefaultHref = pageFile === 'index.html' ? `${baseUrl}/` : `${baseUrl}/${pageFile}`;
    links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(xDefaultHref)}" />`);
    return links.join('\n');
  };

  const urls = [];

  for (const lang of langs) {
    urls.push({
      loc: lang === 'en' ? `${baseUrl}/` : `${baseUrl}/${lang}/`,
      priority: lang === 'en' ? '1.0' : '0.9',
      alternates: buildAlternates('index.html')
    });
  }

  for (const pagePath of TRUST_PAGE_PATHS) {
    const alternates = buildAlternates(pagePath);
    for (const lang of langs) {
      urls.push({
        loc: `${baseUrl}${trustI18n.localizeInternalHref(pagePath, lang)}`,
        priority: lang === 'en' ? '0.6' : '0.5',
        alternates
      });
    }
  }

  const urlBlocks = urls.map((entry) => [
    '  <url>',
    `    <loc>${escapeHtmlAttr(entry.loc)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    `    <priority>${entry.priority}</priority>`,
    entry.alternates,
    '  </url>'
  ].join('\n')).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlBlocks,
    '</urlset>',
    ''
  ].join('\n');
}
