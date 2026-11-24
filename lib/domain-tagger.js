// Deterministic 8-language (ASCII/Latin) SLD segmentation and tagging module.
// Kept outside /functions/ so Cloudflare Pages does not expose it as a public HTTP route.

const MULTI_PART_EXTS = [
  '.web.id', '.my.id', '.co.id', '.biz.id', '.or.id', '.ac.id', '.sch.id', '.net.id', '.go.id',
  '.com.br', '.net.br', '.org.br', '.edu.br',
  '.co.jp', '.ne.jp', '.or.jp', '.ac.jp', '.go.jp',
  '.co.uk', '.org.uk', '.me.uk', '.ac.uk', '.gov.uk',
  '.com.au', '.net.au', '.org.au', '.edu.au',
  '.co.nz', '.com.es', '.org.es', '.edu.es', '.com.mx', '.org.mx', '.com.ar', '.com.co', '.com.sg', '.com.my'
];

// 2-character tokens only match as standalone/hyphen-delimited tokens, never inside compound words
export const SHORT_EXACT = {
  ai: [4.5, ['ai-tech'], ['en']],
  go: [3.6, ['tools'], ['en']],
  ui: [4.0, ['tools'], ['en']],
  ux: [4.0, ['tools'], ['en']],
  id: [4.0, ['domain-naming'], ['en', 'id']]
};

// Wave-1 8-language lexicon (id, en, es, pt, fr, ja, ru, de — ASCII/Latin)
// Entry format: word -> [weight, tags[], langs[], options?]
export const LEXICON_8LANG = {
  // --- BUSINESS ---
  business:   [7.5, ['business'], ['en']],
  startup:    [7.0, ['business'], ['en']],
  agency:     [6.5, ['business'], ['en']],
  venture:    [6.5, ['business'], ['en']],
  corp:       [4.8, ['business'], ['en']],
  firm:       [4.8, ['business'], ['en']],
  bisnis:     [6.5, ['business'], ['id']],
  usaha:      [6.0, ['business'], ['id']],
  niaga:      [6.0, ['business'], ['id']],
  dagang:     [6.0, ['business'], ['id']],
  kantor:     [6.0, ['business'], ['id']],
  mitra:      [5.5, ['business'], ['id']],
  karya:      [5.5, ['business'], ['id']],
  negocio:    [7.0, ['business'], ['es', 'pt']],
  negocios:   [7.5, ['business'], ['es', 'pt']],
  empresa:    [7.0, ['business'], ['es', 'pt']],
  comercio:   [7.0, ['business', 'ecommerce'], ['es', 'pt']],
  agencia:    [6.5, ['business'], ['es', 'pt']],
  firma:      [5.5, ['business'], ['pt', 'es', 'de', 'id']],
  entreprise: [7.5, ['business'], ['fr']],
  affaires:   [7.0, ['business'], ['fr']],
  agence:     [6.5, ['business'], ['fr']],
  bureau:     [6.0, ['business'], ['fr', 'en']],
  handel:     [6.0, ['business', 'ecommerce'], ['de']],
  buero:      [5.5, ['business'], ['de']],
  betrieb:    [6.5, ['business'], ['de']],
  kaisha:     [6.5, ['business'], ['ja']],
  kigyo:      [6.0, ['business'], ['ja']],
  bijinesu:   [7.0, ['business'], ['ja']],
  shigoto:    [6.5, ['business'], ['ja']],
  biznes:     [6.5, ['business'], ['ru']],
  kompaniya:  [7.5, ['business'], ['ru']],
  agentstvo:  [7.5, ['business'], ['ru']],

  // --- TOOLS ---
  tool:        [5.5, ['tools'], ['en']],
  tools:       [6.0, ['tools'], ['en']],
  calc:        [5.5, ['calculator', 'tools'], ['en']],
  calcu:       [6.0, ['calculator', 'tools'], ['en']],
  utils:       [5.8, ['tools'], ['en']],
  helper:      [6.2, ['tools'], ['en']],
  maker:       [5.8, ['tools'], ['en']],
  checker:     [6.5, ['tools'], ['en']],
  scan:        [5.2, ['tools'], ['en']],
  kit:         [3.6, ['tools'], ['en']],
  box:         [3.8, ['tools', 'business'], ['en']],
  hub:         [3.8, ['tools', 'business'], ['en']],
  alat:        [5.5, ['tools'], ['id']],
  hitung:      [6.2, ['calculator', 'tools'], ['id']],
  cek:         [3.6, ['tools'], ['id']],
  catat:       [5.5, ['tools'], ['id']],
  panduan:     [6.5, ['tools'], ['id']],
  herramienta: [8.0, ['tools'], ['es']],
  util:        [5.2, ['tools'], ['es', 'pt']],
  guia:        [5.2, ['tools'], ['es', 'pt']],
  ferramenta:  [8.0, ['tools'], ['pt']],
  painel:      [6.0, ['tools'], ['pt']],
  outil:       [6.0, ['tools'], ['fr']],
  outils:      [6.5, ['tools'], ['fr']],
  guide:       [5.5, ['tools'], ['fr', 'en']],
  werkzeug:    [7.5, ['tools'], ['de']],
  rechner:     [6.8, ['calculator', 'tools'], ['de']],
  hilfe:       [5.5, ['tools'], ['de']],
  tsuru:       [5.8, ['tools'], ['ja']],
  dougu:       [5.8, ['tools'], ['ja']],
  keisan:      [6.5, ['calculator', 'tools'], ['ja']],
  kalkul:      [6.5, ['calculator', 'tools'], ['ru']],
  servis:      [6.0, ['tools'], ['ru']],
  pomosh:      [6.0, ['tools'], ['ru']],

  // --- ECOMMERCE ---
  shop:     [5.5, ['ecommerce'], ['en', 'de']],
  store:    [6.0, ['ecommerce'], ['en']],
  cart:     [5.2, ['ecommerce'], ['en']],
  market:   [6.2, ['ecommerce'], ['en']],
  deal:     [5.2, ['ecommerce'], ['en']],
  deals:    [5.8, ['ecommerce'], ['en']],
  buy:      [3.6, ['ecommerce'], ['en']],
  sale:     [5.2, ['ecommerce'], ['en']],
  order:    [5.5, ['ecommerce'], ['en']],
  pay:      [3.6, ['ecommerce'], ['en']],
  toko:     [5.5, ['ecommerce'], ['id']],
  lapak:    [5.8, ['ecommerce'], ['id']],
  warung:   [6.2, ['ecommerce'], ['id']],
  jual:     [5.2, ['ecommerce'], ['id']],
  beli:     [5.2, ['ecommerce'], ['id']],
  bayar:    [5.5, ['ecommerce'], ['id']],
  harga:    [5.5, ['ecommerce'], ['id']],
  murah:    [5.5, ['ecommerce'], ['id']],
  tienda:   [6.5, ['ecommerce'], ['es']],
  mercado:  [6.5, ['ecommerce'], ['es', 'pt']],
  compra:   [6.0, ['ecommerce'], ['es', 'pt']],
  venta:    [5.8, ['ecommerce'], ['es']],
  precio:   [6.0, ['ecommerce'], ['es']],
  loja:     [5.5, ['ecommerce'], ['pt']],
  venda:    [5.8, ['ecommerce'], ['pt']],
  preco:    [5.8, ['ecommerce'], ['pt']],
  boutique: [7.5, ['ecommerce'], ['fr']],
  achat:    [5.8, ['ecommerce'], ['fr']],
  vente:    [5.8, ['ecommerce'], ['fr']],
  marche:   [6.0, ['ecommerce'], ['fr']],
  prix:     [5.2, ['ecommerce'], ['fr']],
  markt:    [5.8, ['ecommerce'], ['de']],
  kauf:     [5.2, ['ecommerce'], ['de']],
  preis:    [5.8, ['ecommerce'], ['de']],
  laden:    [5.5, ['ecommerce'], ['de']],
  verkauf:  [6.8, ['ecommerce'], ['de']],
  mise:     [5.5, ['ecommerce'], ['ja']],
  tenpo:    [5.8, ['ecommerce'], ['ja']],
  uriba:    [5.8, ['ecommerce'], ['ja']],
  kaimono:  [6.8, ['ecommerce'], ['ja']],
  magazin:  [7.0, ['ecommerce'], ['ru']],
  rynok:    [5.8, ['ecommerce'], ['ru']],
  kupit:    [5.8, ['ecommerce'], ['ru']],
  tovar:    [5.8, ['ecommerce'], ['ru']],
  tsena:    [5.8, ['ecommerce'], ['ru']],

  // --- DOMAIN-NAMING ---
  domain:   [7.0, ['domain-naming'], ['en']],
  dom:      [3.6, ['domain-naming'], ['en', 'ru']],
  name:     [5.5, ['domain-naming', 'naming'], ['en', 'de']],
  brand:    [5.8, ['domain-naming'], ['en']],
  site:     [5.2, ['domain-naming'], ['en', 'fr']],
  web:      [3.8, ['domain-naming'], ['en', 'es', 'pt', 'fr', 'de', 'id']],
  host:     [5.2, ['domain-naming'], ['en']],
  nama:     [5.5, ['naming'], ['id']],
  situs:    [5.5, ['domain-naming'], ['id']],
  merek:    [5.8, ['domain-naming'], ['id']],
  ide:      [3.6, ['naming', 'ideas'], ['id']],
  nombre:   [6.5, ['naming'], ['es']],
  dominio:  [7.0, ['domain-naming'], ['es', 'pt']],
  marca:    [5.8, ['domain-naming'], ['es', 'pt']],
  sitio:    [5.5, ['domain-naming'], ['es']],
  nome:     [5.5, ['naming'], ['pt']],
  nom:      [3.6, ['naming'], ['fr']],
  domaine:  [7.0, ['domain-naming'], ['fr']],
  marque:   [6.2, ['domain-naming'], ['fr']],
  idee:     [5.5, ['ideas'], ['fr', 'de']],
  marke:    [5.8, ['domain-naming'], ['de']],
  seite:    [5.5, ['domain-naming'], ['de']],
  namae:    [6.0, ['naming'], ['ja']],
  domein:   [6.5, ['domain-naming'], ['ja']],
  saito:    [5.8, ['domain-naming'], ['ja']],
  burando:  [6.8, ['domain-naming'], ['ja']],
  imya:     [5.5, ['naming'], ['ru']],
  domen:    [5.8, ['domain-naming'], ['ru']],
  brend:    [5.8, ['domain-naming'], ['ru']],
  sayt:     [5.5, ['domain-naming'], ['ru']],
  nazvanie: [7.5, ['naming'], ['ru']],

  // --- MODIFIERS, FAMILY, GEO & POSSESSIVE SUFFIXES ---
  cloud:     [6.0, ['cloud-tech'], ['en']],
  free:      [5.5, ['free-offer'], ['en']],
  pro:       [3.4, ['business'], ['en', 'es', 'pt', 'fr']],
  gratis:    [6.5, ['free-offer'], ['es', 'pt', 'de', 'id']],
  muryou:    [6.8, ['free-offer'], ['ja']],
  besplatno: [7.8, ['free-offer'], ['ru']],
  auto:      [5.5, ['auto-mobility'], ['en', 'de', 'es', 'pt', 'fr', 'ru']],
  casa:      [5.5, ['real-estate'], ['es', 'pt']],
  maison:    [6.5, ['real-estate'], ['fr']],
  bayi:      [6.0, ['parenting-baby'], ['id']],
  anak:      [5.5, ['parenting-baby', 'people-family'], ['id']],
  orangtua:  [8.5, ['people-family', 'parenting-baby'], ['id']],
  ortu:      [5.5, ['people-family', 'parenting-baby'], ['id']],
  akachan:   [7.2, ['parenting-baby'], ['ja']],
  kota:      [5.5, ['geo-local'], ['id']],
  kabupaten: [8.5, ['geo-local'], ['id']],
  provinsi:  [8.0, ['geo-local'], ['id']],
  bangsa:    [6.5, ['civic-nation'], ['id']],
  gorod:     [6.0, ['geo-local'], ['ru']],
  ku:        [2.2, ['personal'], ['id'], { suffixOnly: true }],
  mu:        [2.2, ['personal'], ['id'], { suffixOnly: true }]
};

const EXT_LANG_HINT = {
  '.id': 'id', '.co.id': 'id', '.web.id': 'id', '.my.id': 'id', '.biz.id': 'id',
  '.ac.id': 'id', '.or.id': 'id', '.net.id': 'id', '.sch.id': 'id', '.go.id': 'id',
  '.es': 'es', '.com.es': 'es', '.mx': 'es', '.com.mx': 'es', '.ar': 'es', '.com.ar': 'es', '.com.co': 'es',
  '.pt': 'pt', '.br': 'pt', '.com.br': 'pt', '.net.br': 'pt', '.org.br': 'pt',
  '.fr': 'fr', '.be': 'fr',
  '.de': 'de', '.at': 'de',
  '.jp': 'ja', '.co.jp': 'ja', '.ne.jp': 'ja', '.or.jp': 'ja',
  '.ru': 'ru', '.su': 'ru',
  '.uk': 'en', '.co.uk': 'en', '.us': 'en', '.au': 'en', '.com.au': 'en', '.nz': 'en', '.co.nz': 'en', '.ca': 'en'
};

const MODIFIER_TAGS = new Set(['free-offer', 'personal', 'ideas']);
const SPLIT_PENALTY = 1.2;

export function extractSldAndExt(domain) {
  const clean = String(domain || '').trim().toLowerCase();
  const multi = MULTI_PART_EXTS.find((ext) => clean.endsWith(ext) && clean.length > ext.length);
  if (multi) return { sld: clean.slice(0, -multi.length), extension: multi };
  const idx = clean.lastIndexOf('.');
  return idx > 0 ? { sld: clean.slice(0, idx), extension: clean.slice(idx) } : { sld: clean, extension: '' };
}

function segmentAlpha(chunk) {
  const n = chunk.length;
  if (!n) return { tokens: [], matchedChars: 0 };

  if (SHORT_EXACT[chunk]) {
    return {
      tokens: [{ text: chunk, known: true, meta: SHORT_EXACT[chunk] }],
      matchedChars: n
    };
  }

  const whole = LEXICON_8LANG[chunk];
  if (whole && !(whole[3] && whole[3].suffixOnly)) {
    return {
      tokens: [{ text: chunk, known: true, meta: whole }],
      matchedChars: n
    };
  }

  const dp = Array(n + 1).fill(null);
  dp[0] = { score: 0, tokens: [] };

  for (let i = 0; i < n; i++) {
    if (!dp[i]) continue;

    for (let j = i + 2; j <= n; j++) {
      const sub = chunk.slice(i, j);
      const meta = LEXICON_8LANG[sub];
      if (!meta) continue;

      const isSuffixOnly = Boolean(meta[3] && meta[3].suffixOnly);
      if (sub.length < 3 && !isSuffixOnly) continue;

      if (isSuffixOnly) {
        const prev = dp[i].tokens[dp[i].tokens.length - 1];
        const prevIsSuffix = Boolean(prev && prev.meta && prev.meta[3] && prev.meta[3].suffixOnly);
        if (!prev || !prev.known || prevIsSuffix || prev.text.length < 3 || j !== n) continue;
      }

      const splitCost = dp[i].tokens.length > 0 ? SPLIT_PENALTY : 0;
      const nextScore = dp[i].score + meta[0] - splitCost;
      if (!dp[j] || nextScore > dp[j].score) {
        dp[j] = {
          score: nextScore,
          tokens: [...dp[i].tokens, { text: sub, known: true, meta }]
        };
      }
    }

    const unkScore = dp[i].score - 1.6;
    if (!dp[i + 1] || unkScore > dp[i + 1].score) {
      const prevTokens = dp[i].tokens;
      const last = prevTokens[prevTokens.length - 1];
      const merged = last && !last.known
        ? [...prevTokens.slice(0, -1), { text: last.text + chunk[i], known: false, meta: null }]
        : [...prevTokens, { text: chunk[i], known: false, meta: null }];
      dp[i + 1] = { score: unkScore, tokens: merged };
    }
  }

  const cleaned = dp[n].tokens.map((t, idx, arr) => {
    const prev = arr[idx - 1];
    const next = arr[idx + 1];
    if (t.known && t.text.length <= 3 && prev && !prev.known && next && !next.known) {
      return { text: t.text, known: false, meta: null };
    }
    return t;
  });

  const finalTokens = [];
  let matchedChars = 0;
  for (const t of cleaned) {
    if (t.known) {
      finalTokens.push(t);
      matchedChars += t.text.length;
    } else {
      const last = finalTokens[finalTokens.length - 1];
      if (last && !last.known) last.text += t.text;
      else finalTokens.push({ ...t });
    }
  }
  return { tokens: finalTokens, matchedChars };
}

function resolveLangTag(knownTokens, extHint, uiLang) {
  if (!knownTokens.length) return null;

  let common = [...knownTokens[0].meta[2]];
  for (let i = 1; i < knownTokens.length; i++) {
    const allowed = new Set(knownTokens[i].meta[2]);
    common = common.filter((l) => allowed.has(l));
  }

  if (common.length === 1) return common[0];
  if (common.length >= 2) {
    if (extHint && common.includes(extHint)) return extHint;
    if (uiLang && common.includes(uiLang)) return uiLang;
    return 'multilingual';
  }
  return 'multilingual';
}

export function generateDomainTags({ domain = '', sld = '', extension = '', uiLang = 'en' }) {
  const parsed = domain ? extractSldAndExt(domain) : { sld, extension };
  const cleanSld = String(sld || parsed.sld || '').trim().toLowerCase();
  const cleanExt = String(extension || parsed.extension || '').trim().toLowerCase();
  const extHint = EXT_LANG_HINT[cleanExt] || null;

  const parts = cleanSld.split('-').filter(Boolean).flatMap((p) => p.match(/[a-z]+|[0-9]+/g) || []);
  const allTokens = [];
  let totalAlpha = 0;
  let matchedAlpha = 0;
  let hasNumber = false;

  for (const part of parts) {
    if (/^[0-9]+$/.test(part)) {
      hasNumber = true;
      allTokens.push({ text: part, known: false, isNumber: true, meta: null });
    } else {
      totalAlpha += part.length;
      const seg = segmentAlpha(part);
      matchedAlpha += seg.matchedChars;
      allTokens.push(...seg.tokens);
    }
  }

  const coverage = totalAlpha > 0 ? matchedAlpha / totalAlpha : 0;
  const rawKnown = allTokens.filter((t) => t.known);
  const hasAnchorWord = rawKnown.some((t) => t.text.length >= 4 && !(t.meta[3] && t.meta[3].suffixOnly));
  const isReliable = rawKnown.length > 0 && (coverage >= 0.60 || (hasAnchorWord && coverage >= 0.40));
  const knownTokens = isReliable ? rawKnown : [];

  const topicScores = new Map();
  const modifierTags = new Set();

  if (knownTokens.length > 0) {
    for (const t of knownTokens) {
      for (const tg of t.meta[1]) {
        if (MODIFIER_TAGS.has(tg)) modifierTags.add(tg);
        else topicScores.set(tg, (topicScores.get(tg) || 0) + t.meta[0]);
      }
    }
  } else {
    topicScores.set('brandable', 1);
  }

  const sldLang = resolveLangTag(knownTokens, extHint, String(uiLang || 'en').toLowerCase());
  const marketTag = (extHint && extHint !== 'en' && extHint !== sldLang) ? `${extHint}-tld` : null;

  const tags = [];
  const push = (tg) => {
    if (tg && !tags.includes(tg) && tags.length < 6) tags.push(tg);
  };

  [...topicScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([tg]) => push(tg));
  [...modifierTags].slice(0, 2).forEach(push);
  push(sldLang);
  push(marketTag);
  if (hasNumber) push('numeric');
  if (cleanSld.length <= 3) push('short');
  if (knownTokens.length >= 2) push('compound');

  return {
    sld: cleanSld,
    extension: cleanExt,
    tokens: allTokens.map((t) => t.text),
    coverage: Number(coverage.toFixed(2)),
    tags,
    tagsJson: JSON.stringify(tags)
  };
}
