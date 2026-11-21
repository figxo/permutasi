import fs from 'fs';
import path from 'path';
import '../assets/trust-i18n.js';

const trustI18n = globalThis.__TRUST_I18N__;
const EDU_FAQ_BY_LANG = JSON.parse(
  fs.readFileSync(new URL('./edu-faq-i18n.json', import.meta.url), 'utf8')
);

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

const EXT_STRATEGY_BY_LANG = {
  id: {
    title: 'Strategi Ekstensi Domain & Sinyal SERP Google (Target Market & Regional)',
    intro: 'Dalam algoritma dan kebijakan Google Search, pemilihan ekstensi domain memberikan sinyal penargetan geografis (geotargeting) dan otoritas brand yang kuat:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Ekstensi generik global tanpa bias regional khusus. Sangat ideal jika target market Anda lintas negara (internasional) atau untuk authority website umum.',
    locTitle: 'ccTLDs Lokal (.id, .co.id, .my.id)',
    locDesc: 'Memberikan sinyal kuat geotargeting regional ke Google bahwa website ditujukan untuk audiens lokal (misal: Indonesia). Sangat mendongkrak peringkat di SERP lokal.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Ekstensi tematik modern yang memberi sinyal intent spesifik (SaaS, e-commerce, developer tool). Diperlakukan setara dengan gTLD oleh Google dalam hal SERP signal.'
  },
  es: {
    title: 'Estrategia de Extensiones y Señales SERP de Google (Mercado y Región)',
    intro: 'En los algoritmos de Google Search, la elección de la extensión proporciona fuertes señales de segmentación geográfica (geotargeting) y autoridad:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Extensiones genéricas globales sin sesgo regional específico. Ideales para mercados internacionales o sitios de autoridad general.',
    locTitle: 'ccTLDs Locales (.es, .mx, .ar)',
    locDesc: 'Proporcionan fuertes señales de geotargeting regional a Google indicando que el sitio se dirige a audiencias locales, mejorando el ranking SERP local.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Extensiones temáticas modernas que señalan intención específica (SaaS, e-commerce, herramientas de desarrollador). Tratadas igual que gTLDs.'
  },
  pt: {
    title: 'Estratégia de Extensões e Sinais SERP do Google (Mercado & Regional)',
    intro: 'Nos algoritmos e políticas do Google Search, a escolha da extensão fornece fortes sinais de direcionamento geográfico (geotargeting) e autoridade:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Extensões genéricas globais sem viés regional específico. Ideales para mercados internacionais transfronteiriços ou sites de autoridade geral.',
    locTitle: 'ccTLDs Locales (.pt, .com.br)',
    locDesc: 'Fornecem fortes sinais de geotargeting regional ao Google, indicando que o site visa audiências locais. Ótimo para impulsionar rankings SERP locais.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Extensões temáticas modernas que sinalizam intenção específica (SaaS, e-commerce, ferramenta de desenvolvedor). Tratadas igualmente aos gTLDs.'
  },
  fr: {
    title: "Stratégie d'Extension et Signaux SERP de Google (Marché & Région)",
    intro: "Dans les algorithmes de Google Search, le choix de l'extension fournit de forts signaux de ciblage géographique (geotargeting) et d'autorité :",
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: "Extensions génériques mondiales sans biais régional spécifique. Idéales pour le marché international ou les sites d'autorité générale.",
    locTitle: 'ccTLDs Locaux (.fr, .be, .ch)',
    locDesc: 'Fournissent de forts signaux de ciblage géographique régional à Google indiquant que le site cible des audiences locales. Excellent pour les classements SERP locaux.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Extensions thématiques modernes signalant une intention spécifique (SaaS, e-commerce, outil dev). Traitées à égalité avec les gTLDs.'
  },
  de: {
    title: 'Domain-Endungs-Strategie & Google SERP-Signale (Zielmarkt & Region)',
    intro: 'In den Algorithmen der Google-Suche liefert die Wahl der Domain-Endung starke Geotargeting- und Markenautoritätssignale:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Globale generische Endungen ohne regionalen Bias. Ideal für internationale Zielmärkte oder allgemeine Authority-Websites.',
    locTitle: 'Lokale ccTLDs (.de, .at, .ch)',
    locDesc: 'Bieten starke regionale Geotargeting-Signale an Google, dass die Website auf lokale Zielmärkte ausgerichtet ist. Verbessert lokale SERP-Rankings.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Moderne thematische Endungen mit spezifischer Intent-Signalwirkung (SaaS, E-Commerce, Dev-Tool). Werden in SERP-Signalen wie gTLDs behandelt.'
  },
  ru: {
    title: 'Стратегия доменных зон и сигналы SERP Google (Регион и рынок)',
    intro: 'В алгоритмах Google выбор доменной зоны дает мощные сигналы географического таргетинга (geotargeting) и авторитета бренда:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Глобальные общие зоны без специального регионального уклона. Идеально для трансграничных рынков или общих сайтов общего авторитета.',
    locTitle: 'Локальные ccTLDs (.ru, .su, .рф)',
    locDesc: 'Обеспечивают сильные сигналы регионального геотаргетинга для Google, указывая на русскоязычную аудиторию. Отлично повышает позиции в локальной выдаче.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Современные тематические зоны, сигнализирующие о конкретном намерении (SaaS, e-commerce, инструменты разработчика). Равны gTLD.'
  },
  ja: {
    title: 'ドメイン拡張子戦略 & Google SERPシグナル (ターゲット市場 & 地域)',
    intro: 'Google検索アルゴリズムにおいて、ドメイン拡張子の選択は強力なジオターゲティング（地域ターゲティング）とブランド権威のシグナルを提供します:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: '特定の地域バイアスがないグローバルな汎用拡張子。国境を越えた国際市場や一般的な権威サイトに最適です。',
    locTitle: 'ローカル ccTLDs (.jp, .co.jp, .ne.jp)',
    locDesc: 'ウェブサイトが国内オーディエンスをターゲットにしていることをGoogleに強く示す地域ジオターゲティングシグナルを提供します。国内SERPの順位向上に最適です。',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: '特定の意図（SaaS、EC、開発者ツール）を示す現代的なテーマ別拡張子。SERPシグナルではgTLDと同等に扱われます。'
  }
};

const DOMAIN_RISKS_BY_LANG = {
  id: {
    title: 'Peringatan Risiko Penamaan Domain & Google Penalty',
    intro: 'Saat melakukan riset dan pembuatan permutasi domain (khususnya untuk proyek massal atau domain drop/expired), Anda harus mewaspadai beberapa risiko fatal yang dapat memicu penalti dari algoritma Google:',
    emdTitle: 'EMD (Exact Match Domain) Trap',
    emdDesc: 'Menggunakan domain yang persis sama dengan keyword komersial (misal: beli-sepatu-murah.com) tanpa kualitas konten yang memadai rentan terkena Google EMD Update.',
    spamTitle: 'Risiko Konten Otomatis Berkualitas Rendah',
    spamDesc: 'Algoritma mesin pencari memfilter ribuan halaman otomatis berkualitas rendah yang tidak memiliki nilai informasi unik bagi pengguna.',
    backlinkTitle: 'Riwayat Backlink & Reputasi Domain (Domain Bekas)',
    backlinkDesc: 'Jika Anda membeli domain bekas (expired domain), selalu periksa riwayat arsip (Wayback Machine) dan profil tautannya agar tidak mewarisi penalti algoritmik dari situs berkualitas rendah.'
  },
  es: {
    title: 'Riesgos en Nombres de Dominio y Advertencia de Penalización',
    intro: 'Al investigar y generar permutaciones de dominio (especialmente para proyectos masivos o dominios expirados), tenga cuidado con los riesgos fatales:',
    emdTitle: 'Trampa EMD (Exact Match Domain)',
    emdDesc: 'Usar coincidencias exactas de palabras clave comerciales sin contenido de calidad hace que los sitios sean vulnerables a actualizaciones EMD de Google.',
    spamTitle: 'Riesgo de Contenido Automatizado de Baja Calidad',
    spamDesc: 'Los algoritmos de búsqueda filtran páginas automatizadas sin valor original para los usuarios.',
    backlinkTitle: 'Historial de Enlaces y Reputación (Dominios Expirados)',
    backlinkDesc: 'Al comprar dominios expirados, verifique siempre el historial de archivo (Wayback Machine) y perfiles de enlaces para evitar heredar penalizaciones algorítmicas.'
  },
  pt: {
    title: 'Riscos de Nomes de Domínio e Alerta de Penalidade do Google',
    intro: 'Ao pesquisar e gerar permutações de domínio (especialmente para projetos em massa ou dominios expirados/drop), tome cuidado com riscos fatais:',
    emdTitle: 'Armadilha EMD (Exact Match Domain)',
    emdDesc: 'Usar correspondências exatas de palavras-chave comerciais (ex: comprar-sapatos-baratos.pt) sem conteúdo de qualidade torna os sites vulneráveis a atualizações EMD.',
    spamTitle: 'Risco de Conteúdo Automatizado de Baixa Qualidade',
    spamDesc: 'Os sistemas de busca filtram páginas automatizadas sem valor editorial original para os usuários.',
    backlinkTitle: 'Histórico de Links e Reputação (Domínios Expirados)',
    backlinkDesc: 'Ao comprar domínios expirados, sempre verifique o histórico de arquivos (Wayback Machine) e perfis de links para evitar herdar penalizações algorítmicas.'
  },
  fr: {
    title: 'Risques de Noms de Domaine et Alerte de Pénalité Google',
    intro: 'Lors de la recherche et de la génération de permutations de domaine (surtout pour les projets en masse ou les domaines expirés), attention aux risques fatals :',
    emdTitle: 'Piège EMD (Exact Match Domain)',
    emdDesc: 'Utiliser des correspondances exactes de mots-clés commerciaux (ex: acheter-chaussures-pas-cher.fr) sans contenu de qualité expose aux mises à jour EMD.',
    spamTitle: 'Risque de Contenu Automatisé de Faible Qualité',
    spamDesc: 'Les moteurs de recherche filtrent les pages automatisées à faible valeur ajoutée dépourvues de contenu original.',
    backlinkTitle: 'Historique de Liens et Réputation (Domaines Expirés)',
    backlinkDesc: "Lors de l'achat de domaines expirés, vérifiez toujours l'historique d'archive (Wayback Machine) et les profils de liens pour éviter d'hériter de pénalités."
  },
  de: {
    title: 'Domain-Risiken & Google Penalty Warnung',
    intro: 'Bei der Recherche und Generierung von Domain-Permutationen (besonders für große Projekte oder alte/Dropped-Domains) lauern fatale Risiken:',
    emdTitle: 'EMD (Exact Match Domain) Falle',
    emdDesc: 'Die Nutzung exakter kommerzieller Keyword-Matches (z. B. billige-schuhe-kaufen.de) ohne hohe Content-Qualität macht anfällig für EMD-Updates.',
    spamTitle: 'Risiko Minderwertiger Automatisierter Inhalte',
    spamDesc: 'Suchmaschinen filtern automatisch generierte Seiten ohne eigenen redaktionellen Mehrwert für Besucher.',
    backlinkTitle: 'Backlink-Historie & Domain-Reputation (Gebrauchte Domains)',
    backlinkDesc: 'Prüfen Sie beim Kauf gebrauchter Domains immer das Archiv (Wayback Machine) und Backlink-Profile, um keine historischen Abstrafungen zu erben.'
  },
  ru: {
    title: 'Риски нейминга и предупреждение о штрафах Google',
    intro: 'При исследовании и генерации перестановок (особенно для массовых кампаний или перехваченных доменов) опасайтесь фатальных рисков:',
    emdTitle: 'Ловушка EMD (Exact Match Domain)',
    emdDesc: 'Использование точных коммерческих совпадений ключевых слов (например, kupit-obuv-nedorogo.ru) без высокого качества контента уязвимо для EMD-обновлений.',
    spamTitle: 'Риск некачественного автоматического контента',
    spamDesc: 'Поисковые системы отфильтровывают шаблонные автоматические страницы без оригинальной пользы для пользователей.',
    backlinkTitle: 'История ссылок и репутация (Возрастные домены)',
    backlinkDesc: 'При покупке доменов с историей всегда проверяйте архив (Wayback Machine) и профиль ссылок во избежание наследования санкций.'
  },
  ja: {
    title: 'ドメイン命名のリスク & Googleペナルティの警告',
    intro: 'ドメインの置換や生成（特に大規模プロジェクトや中古ドメインの場合）を行う際は、アルゴリズムペナルティを引き起こす致命的なリスクに注意してください:',
    emdTitle: 'EMD（完全一致ドメイン）の罠',
    emdDesc: '高品質なコンテンツなしで商用キーワードと完全に一致するドメイン（例: best-cheap-shoes.jp）を使用すると、GoogleのEMDアップデートの対象になりやすくなります。',
    spamTitle: '低品質な自動生成コンテンツのリスク',
    spamDesc: '検索エンジンは、独自の有益な情報を持たない大量の低品質ページをフィルタリングします。',
    backlinkTitle: '被リンク履歴とドメイン評価 (中古ドメイン)',
    backlinkDesc: '中古ドメインを取得する際は、過去のアーカイブ履歴（Wayback Machine）と被リンクプロファイルを必ず確認してください。'
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
  return html.replace(regex, (_m, open, _tag, _body, close) => `${open}${escapeHtmlText(text)}${close}`);
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
  html = html.replace(/<a\s+([^>]*?)href="(\/|\/(?:index|about|privacy-policy|terms|disclaimer|contact)\.html)"([^>]*)>/gi, (full, pre, href, post) => {
    if (/data-trust-edition="/i.test(pre) || /data-trust-edition="/i.test(post)) {
      return full;
    }
    if (href === '/') {
      const homeHref = lang === 'en' ? '/' : `/${lang}/`;
      return `<a ${pre}href="${homeHref}"${post}>`;
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

  const extStrat = EXT_STRATEGY_BY_LANG[lang];
  if (extStrat) {
    html = html.replace(
      /(<article\s+id="extensionStrategySection"[^>]*\sdata-rendered-lang=")en(")/i,
      `$1${escapeHtmlAttr(lang)}$2`
    );
    html = setElementInnerTextById(html, 'uiExtStratTitle', extStrat.title);
    html = setElementInnerTextById(html, 'uiExtStratIntro', extStrat.intro);
    html = setElementInnerTextById(html, 'uiExtGTitle', extStrat.gTitle);
    html = setElementInnerTextById(html, 'uiExtGDesc', extStrat.gDesc);
    html = setElementInnerTextById(html, 'uiExtLocTitle', extStrat.locTitle);
    html = setElementInnerTextById(html, 'uiExtLocDesc', extStrat.locDesc);
    html = setElementInnerTextById(html, 'uiExtNTitle', extStrat.nTitle);
    html = setElementInnerTextById(html, 'uiExtNDesc', extStrat.nDesc);
  }

  const riskPack = DOMAIN_RISKS_BY_LANG[lang];
  if (riskPack) {
    html = html.replace(
      /(<article\s+id="domainRisksSection"[^>]*\sdata-rendered-lang=")en(")/i,
      `$1${escapeHtmlAttr(lang)}$2`
    );
    html = setElementInnerTextById(html, 'uiRiskTitle', riskPack.title);
    html = setElementInnerTextById(html, 'uiRiskIntro', riskPack.intro);
    html = setElementInnerTextById(html, 'uiRiskEmdTitle', riskPack.emdTitle);
    html = setElementInnerTextById(html, 'uiRiskEmdDesc', riskPack.emdDesc);
    html = setElementInnerTextById(html, 'uiRiskSpamTitle', riskPack.spamTitle);
    html = setElementInnerTextById(html, 'uiRiskSpamDesc', riskPack.spamDesc);
    html = setElementInnerTextById(html, 'uiRiskBacklinkTitle', riskPack.backlinkTitle);
    html = setElementInnerTextById(html, 'uiRiskBacklinkDesc', riskPack.backlinkDesc);
  }

  const eduFaqPack = EDU_FAQ_BY_LANG[lang];
  if (eduFaqPack) {
    for (const secId of ['keywordStrategySection', 'domainExamplesSection', 'faqSection']) {
      html = html.replace(
        new RegExp(`(<(?:article|section)\\s+id="${secId}"[^>]*\\sdata-rendered-lang=")en(")`, 'i'),
        `$1${escapeHtmlAttr(lang)}$2`
      );
    }

    const aboveFoldByLang = {
      id: {
        title: 'Generator Ide Nama Domain "domain"',
        sub: 'Gabungkan kata kunci untuk menemukan ide nama domain yang singkat dan siap pakai dalam hitungan detik.',
        genTitle: 'Buat Ide Nama Domain',
        extLabel: 'Ekstensi Domain (mis. .com, .id):',
        genBtn: 'Buat Nama Domain',
        advLabel: 'Kata Kunci Tambahan & Opsi Lanjutan',
        editOptionsShortcut: 'Ubah Kata Kunci & Pola',
        wordPermLabel: 'Acak Urutan Kata Kunci',
        wordPermDesc: 'Otomatis acak urutan kata kunci untuk variasi nama lebih banyak.',
        wordPermBadge: 'Susunan: 1 · Variasi: 1',
        wordPermSizeLabel: 'Jumlah Kata',
        wordPermFormatLabel: 'Pemisah',
        wordPermDashLabel: 'Pakai Dash (-)',
        wordPermNoDashLabel: 'Tanpa Dash'
      },
      es: {
        title: 'Generador de Dominios "domain"',
        sub: 'Combina tus palabras clave y encuentra ideas de dominios cortos y listos para usar al instante.',
        genTitle: 'Crear Ideas de Dominio',
        extLabel: 'Extensiones (ej. .com, .es):',
        genBtn: 'Generar Nombres de Dominio',
        advLabel: 'Más Palabras y Opciones Extra',
        editOptionsShortcut: 'Editar Palabras y Patrón',
        wordPermLabel: 'Combinar Orden de Palabras',
        wordPermDesc: 'Mezcla tus palabras clave automáticamente para crear más ideas.',
        wordPermBadge: 'Órdenes: 1 · Ideas: 1',
        wordPermSizeLabel: 'Cantidad de palabras',
        wordPermFormatLabel: 'Separador',
        wordPermDashLabel: 'Con Guion (-)',
        wordPermNoDashLabel: 'Sin Guion'
      },
      pt: {
        title: 'Gerador de Domínios "domain"',
        sub: 'Combine suas palavras-chave e encontre ideias de domínios curtos e prontos para usar em segundos.',
        genTitle: 'Criar Ideias de Domínio',
        extLabel: 'Extensões (ex. .com, .pt):',
        genBtn: 'Gerar Nomes de Domínio',
        advLabel: 'Mais Palavras e Opções Extras',
        editOptionsShortcut: 'Editar Palavras e Padrão',
        wordPermLabel: 'Combinar Ordem das Palavras',
        wordPermDesc: 'Misture suas palavras-chave automaticamente para gerar mais ideias.',
        wordPermBadge: 'Ordens: 1 · Ideias: 1',
        wordPermSizeLabel: 'Nº de palavras',
        wordPermFormatLabel: 'Separador',
        wordPermDashLabel: 'Com Hífen (-)',
        wordPermNoDashLabel: 'Sem Hífen'
      },
      fr: {
        title: 'Générateur de Domaines « domain »',
        sub: 'Combinez vos mots-clés pour trouver des idées de domaines courts et prêts à l’emploi en quelques secondes.',
        genTitle: 'Créer des Idées de Domaine',
        extLabel: 'Extensions (ex. .com, .fr) :',
        genBtn: 'Générer des Noms de Domaine',
        advLabel: 'Plus de Mots et Options Avancées',
        editOptionsShortcut: 'Modifier Mots & Modèles',
        wordPermLabel: 'Mélanger l’ordre des mots',
        wordPermDesc: 'Mélange vos mots-clés automatiquement pour créer plus d’idées.',
        wordPermBadge: 'Ordres : 1 · Idées : 1',
        wordPermSizeLabel: 'Nombre de mots',
        wordPermFormatLabel: 'Séparateur',
        wordPermDashLabel: 'Avec Tiret (-)',
        wordPermNoDashLabel: 'Sans Tiret'
      },
      de: {
        title: '„domain“ Domainnamen-Generator',
        sub: 'Kombinieren Sie Ihre Keywords und finden Sie in Sekunden kurze, sofort nutzbare Domain-Ideen.',
        genTitle: 'Domain-Ideen erstellen',
        extLabel: 'Endungen (z. B. .com, .de):',
        genBtn: 'Domainnamen generieren',
        advLabel: 'Weitere Keywords & Optionen',
        editOptionsShortcut: 'Keywords & Muster ändern',
        wordPermLabel: 'Wörter automatisch kombinieren',
        wordPermDesc: 'Kombiniert Ihre Keywords automatisch zu weiteren Namensideen.',
        wordPermBadge: 'Muster: 1 · Ideen: 1',
        wordPermSizeLabel: 'Wortanzahl',
        wordPermFormatLabel: 'Trennzeichen',
        wordPermDashLabel: 'Mit Bindestrich (-)',
        wordPermNoDashLabel: 'Ohne Bindestrich'
      },
      ru: {
        title: 'Генератор доменов «domain»',
        sub: 'Объединяйте ключевые слова и за секунды находите короткие, готовые к использованию доменные имена.',
        genTitle: 'Создать идеи доменов',
        extLabel: 'Доменные зоны (напр. .com, .ru):',
        genBtn: 'Подобрать домены',
        advLabel: 'Доп. слова и настройки',
        editOptionsShortcut: 'Изменить слова и шаблон',
        wordPermLabel: 'Перемешать порядок слов',
        wordPermDesc: 'Автоматически меняет порядок слов для новых вариантов.',
        wordPermBadge: 'Сочетаний: 1 · Идей: 1',
        wordPermSizeLabel: 'Число слов',
        wordPermFormatLabel: 'Разделитель',
        wordPermDashLabel: 'С дефисом (-)',
        wordPermNoDashLabel: 'Без дефиса'
      },
      ja: {
        title: '「domain」ドメイン名ジェネレーター',
        sub: 'キーワードを組み合わせるだけで、短くて使いやすいドメイン候補を数秒で見つけられます。',
        genTitle: 'ドメイン候補を作成',
        extLabel: 'ドメイン拡張子 (例: .com, .jp):',
        genBtn: 'ドメイン名を生成',
        advLabel: '追加キーワードと詳細設定',
        editOptionsShortcut: 'キーワード・パターンを変更',
        wordPermLabel: 'キーワードの組み合わせ設定',
        wordPermDesc: 'キーワードの順番を自動で組み合わせて候補を増やします。',
        wordPermBadge: '並び: 1 · 候補: 1',
        wordPermSizeLabel: '単語数',
        wordPermFormatLabel: '区切り',
        wordPermDashLabel: 'ハイフンあり (-)',
        wordPermNoDashLabel: 'ハイフンなし'
      }
    };
    const atf = aboveFoldByLang[lang] || {};

    const eduMap = {
      uiHeaderTitle: atf.title,
      uiHeaderSub: atf.sub,
      uiSectionGenTitle: atf.genTitle,
      uiExtLabel: atf.extLabel,
      uiGenBtn: atf.genBtn,
      uiAdvGenBtn: atf.genBtn,
      uiAdvOptionsLabel: atf.advLabel,
      uiEditOptionsShortcutLabel: atf.editOptionsShortcut,
      uiWordPermLabel: atf.wordPermLabel,
      uiWordPermDesc: atf.wordPermDesc,
      wordPermCountBadge: atf.wordPermBadge,
      uiWordPermSizeLabel: atf.wordPermSizeLabel,
      uiWordPermFormatLabel: atf.wordPermFormatLabel,
      uiWordPermDashLabel: atf.wordPermDashLabel,
      uiWordPermNoDashLabel: atf.wordPermNoDashLabel,
      uiStratTitle: eduFaqPack.stratTitle,
      uiStratKwTitle: eduFaqPack.stratKwTitle,
      uiStratKw1: eduFaqPack.stratKw1,
      uiStratKw2: eduFaqPack.stratKw2,
      uiStratKw3: eduFaqPack.stratKw3,
      uiStratBpTitle: eduFaqPack.stratBpTitle,
      uiStratBp1: eduFaqPack.stratBp1,
      uiStratBp2: eduFaqPack.stratBp2,
      uiStratBp3: eduFaqPack.stratBp3,
      uiStratBp4: eduFaqPack.stratBp4,
      uiTipsCheckTitle: eduFaqPack.tipsCheckTitle,
      uiTipsCheck1: eduFaqPack.tipsCheck1,
      uiTipsCheck2: eduFaqPack.tipsCheck2,
      uiTipsCheck3: eduFaqPack.tipsCheck3,
      uiTipsAvoidTitle: eduFaqPack.tipsAvoidTitle,
      uiTipsAvoid1: eduFaqPack.tipsAvoid1,
      uiTipsAvoid2: eduFaqPack.tipsAvoid2,
      uiTipsAvoid3: eduFaqPack.tipsAvoid3,
      uiTipsCureTitle: eduFaqPack.tipsCureTitle,
      uiTipsCure1: eduFaqPack.tipsCure1,
      uiTipsCure2: eduFaqPack.tipsCure2,
      uiTipsCure3: eduFaqPack.tipsCure3,
      uiBadExTitle: eduFaqPack.badExTitle,
      uiGoodExTitle: eduFaqPack.goodExTitle,
      uiFaqTitle: eduFaqPack.faqTitle,
      uiFaqSub: eduFaqPack.faqSub
    };

    for (let i = 1; i <= 4; i++) {
      eduMap[`uiBad${i}Title`] = eduFaqPack[`bad${i}Title`];
      eduMap[`uiBad${i}ExLabel`] = eduFaqPack.exampleLabel;
      eduMap[`uiBad${i}Ex`] = eduFaqPack[`bad${i}Ex`];
      eduMap[`uiBad${i}Reason`] = eduFaqPack[`bad${i}Reason`];
      eduMap[`uiGood${i}Title`] = eduFaqPack[`good${i}Title`];
      eduMap[`uiGood${i}ExLabel`] = eduFaqPack.exampleLabel;
      eduMap[`uiGood${i}Ex`] = eduFaqPack[`good${i}Ex`];
      eduMap[`uiGood${i}Reason`] = eduFaqPack[`good${i}Reason`];
    }

    if (Array.isArray(eduFaqPack.faqs)) {
      eduFaqPack.faqs.forEach((item, idx) => {
        eduMap[`uiFaqQ${idx}`] = item.q;
        eduMap[`uiFaqA${idx}`] = item.a;
      });
    }

    for (const [id, text] of Object.entries(eduMap)) {
      if (text !== undefined) {
        html = setElementInnerTextById(html, id, text);
      }
    }
  }

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
