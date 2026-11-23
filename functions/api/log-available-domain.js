const MAX_LOGGED_DOMAIN_LENGTH = 25;
const DOMAIN_HOSTNAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const SUPPORTED_LANGS = new Set(['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja']);

const MULTI_PART_EXTENSIONS = [
  '.web.id', '.my.id', '.co.id', '.biz.id', '.or.id', '.ac.id', '.sch.id', '.net.id', '.go.id',
  '.com.br', '.net.br', '.org.br', '.edu.br',
  '.co.jp', '.ne.jp', '.or.jp', '.ac.jp', '.go.jp',
  '.co.uk', '.org.uk', '.me.uk', '.ac.uk', '.gov.uk',
  '.com.au', '.net.au', '.org.au', '.edu.au',
  '.co.nz', '.com.es', '.org.es', '.edu.es', '.com.mx', '.org.mx', '.com.ar', '.com.co', '.com.sg', '.com.my'
];

const ID_NICHE_STEMS = [
  'arsip', 'bayar', 'belajar', 'beli', 'bisnis', 'cari', 'catat', 'cek', 'dagang', 'dana',
  'harga', 'hitung', 'ilmu', 'jaminan', 'jasa', 'jual', 'karya', 'kerja', 'kirim', 'kredit',
  'lapak', 'modal', 'murah', 'nama', 'nego', 'niaga', 'panduan', 'pintar', 'rumah', 'sehat',
  'sewa', 'surat', 'toko', 'usaha', 'warung'
];

const EN_NICHE_STEMS = [
  'agency', 'ai', 'api', 'app', 'base', 'biz', 'bot', 'brand', 'business', 'buy',
  'calc', 'card', 'cart', 'cash', 'cloud', 'club', 'code', 'coin', 'core', 'cost',
  'credit', 'data', 'deal', 'desk', 'dev', 'digital', 'doc', 'docs', 'domain', 'easy',
  'edu', 'fast', 'file', 'fin', 'finance', 'fit', 'fix', 'flow', 'form', 'fund',
  'get', 'go', 'guide', 'health', 'help', 'home', 'host', 'hub', 'info', 'insure',
  'invest', 'job', 'jobs', 'kit', 'lab', 'labs', 'law', 'lead', 'learn', 'link',
  'list', 'loan', 'log', 'mail', 'map', 'market', 'med', 'media', 'meta', 'money',
  'name', 'net', 'news', 'note', 'notes', 'ops', 'order', 'page', 'pay', 'plan',
  'plus', 'pod', 'portal', 'pos', 'price', 'pro', 'rent', 'safe', 'sale', 'scan',
  'score', 'search', 'seo', 'service', 'shop', 'site', 'smart', 'soft', 'startup', 'stat',
  'store', 'studio', 'sync', 'tax', 'tech', 'tool', 'tools', 'track', 'trade', 'trust',
  'vault', 'verify', 'web', 'wiki', 'work', 'works', 'zone'
];

const EXTRA_LANG_NICHE_STEMS = [
  { stem: 'tienda', lang: 'es' },
  { stem: 'loja', lang: 'pt' },
  { stem: 'markt', lang: 'de' },
  { stem: 'preis', lang: 'de' }
];

const ALL_NICHE_STEMS_BY_LANG = [
  ...ID_NICHE_STEMS.map((stem) => ({ stem, lang: 'id' })),
  ...EN_NICHE_STEMS.map((stem) => ({ stem, lang: 'en' })),
  ...EXTRA_LANG_NICHE_STEMS
];

const REGIONAL_CCTLD_EXTENSIONS = new Set([
  '.id', '.ac.id', '.co.id', '.net.id', '.or.id', '.web.id', '.my.id', '.biz.id', '.sch.id', '.go.id',
  '.us', '.uk', '.co.uk', '.org.uk', '.me.uk', '.ac.uk', '.gov.uk', '.ca', '.au', '.com.au', '.net.au', '.org.au', '.edu.au', '.nz', '.co.nz',
  '.es', '.com.es', '.org.es', '.edu.es', '.mx', '.com.mx', '.org.mx', '.ar', '.com.ar', '.com.co',
  '.pt', '.br', '.com.br', '.org.br', '.net.br', '.edu.br',
  '.fr', '.be', '.ch', '.de', '.at', '.ru', '.su',
  '.jp', '.co.jp', '.ac.jp', '.go.jp', '.ne.jp', '.or.jp',
  '.sg', '.com.sg', '.my', '.com.my'
]);

const GLOBAL_SECONDARY_TLD_BASE = {
  '.shop': 72, '.store': 72, '.tech': 72, '.cloud': 72,
  '.site': 70, '.xyz': 70, '.info': 69
};

const LANG_TLD_FIT_TIERS = {
  en: {
    '.com': 98, '.edu': 94, '.gov': 93, '.net': 91, '.org': 88,
    '.co': 86, '.online': 84, '.io': 82, '.ai': 81, '.app': 80, '.dev': 80, '.biz': 78, '.me': 76,
    '.us': 74, '.uk': 74, '.co.uk': 74, '.ca': 74, '.au': 74, '.co.nz': 74, '.nz': 74
  },
  id: {
    '.id': 98, '.com': 95, '.ac.id': 92, '.co.id': 90, '.net.id': 87, '.or.id': 85, '.web.id': 83, '.my.id': 81, '.biz.id': 79,
    '.sch.id': 77, '.go.id': 77, '.net': 76, '.edu': 75, '.org': 74, '.io': 73, '.ai': 72, '.co': 71,
    '.app': 70, '.dev': 70, '.online': 69, '.biz': 67, '.me': 66
  },
  es: {
    '.com': 97, '.es': 95, '.com.mx': 92, '.mx': 91, '.com.ar': 89, '.ar': 88, '.co': 87, '.com.co': 86, '.com.es': 85,
    '.net': 84, '.edu.es': 83, '.edu': 83, '.org.es': 82, '.org': 81,
    '.online': 78, '.io': 77, '.ai': 75, '.app': 75, '.dev': 75, '.biz': 73, '.me': 72
  },
  pt: {
    '.com': 97, '.com.br': 95, '.pt': 93, '.br': 90, '.edu.br': 88, '.edu': 88, '.org.br': 86, '.net.br': 85,
    '.net': 84, '.org': 82, '.co': 80, '.online': 78, '.io': 77, '.ai': 75, '.app': 75, '.dev': 75, '.biz': 73, '.me': 72
  },
  fr: {
    '.fr': 97, '.com': 95, '.be': 91, '.ch': 89, '.ca': 87,
    '.net': 85, '.edu': 84, '.org': 83, '.co': 81, '.online': 79, '.io': 78, '.ai': 76, '.app': 76, '.dev': 76, '.biz': 73, '.me': 72
  },
  de: {
    '.de': 98, '.com': 95, '.at': 91, '.ch': 90,
    '.net': 86, '.edu': 85, '.org': 84, '.co': 81, '.online': 79, '.io': 78, '.ai': 76, '.app': 76, '.dev': 76, '.biz': 73, '.me': 72
  },
  ru: {
    '.ru': 97, '.com': 94, '.su': 89,
    '.net': 86, '.edu': 84, '.org': 83, '.co': 80, '.online': 78, '.io': 77, '.ai': 75, '.app': 75, '.dev': 75, '.biz': 73, '.me': 72
  },
  ja: {
    '.jp': 97, '.co.jp': 95, '.com': 93, '.ac.jp': 90, '.edu': 90, '.go.jp': 89, '.ne.jp': 88, '.or.jp': 86,
    '.net': 84, '.org': 82, '.co': 80, '.online': 78, '.io': 77, '.ai': 75, '.app': 75, '.dev': 75, '.biz': 73, '.me': 72
  }
};

function computeExtensionLangFitScore(extLower, uiLang) {
  const tierMap = LANG_TLD_FIT_TIERS[uiLang] || LANG_TLD_FIT_TIERS.en;
  if (Object.prototype.hasOwnProperty.call(tierMap, extLower)) {
    return tierMap[extLower];
  }
  if (Object.prototype.hasOwnProperty.call(GLOBAL_SECONDARY_TLD_BASE, extLower)) {
    return uiLang === 'en' ? GLOBAL_SECONDARY_TLD_BASE[extLower] : GLOBAL_SECONDARY_TLD_BASE[extLower] - 6;
  }
  if (REGIONAL_CCTLD_EXTENSIONS.has(extLower) || /\.[a-z]{2}$/.test(extLower)) {
    return uiLang === 'en' ? 58 : 56;
  }
  return uiLang === 'en' ? 65 : 61;
}

const SCORE_COLUMNS = [
  'pronunciation_comfort_score',
  'brandability_score',
  'structure_length_score',
  'extension_lang_fit_score',
  'character_cleanliness_score',
  'niche_clarity_score',
  'emd_pmd_score',
  'overall_heuristic_score',
  'scored_at'
];

const COMMERCIAL_SPAM_MODIFIERS = new Set([
  'best', 'cheap', 'cheapest', 'free', 'top', 'super', 'mega', 'ultra',
  'discount', 'deals', 'deal', 'review', 'reviews', 'promo', 'murah',
  'terbaik', 'gratis', 'diskon', 'promo24', '247', '365', 'online', 'official'
]);

let schemaReadyPromise = null;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function normalizeDomain(rawDomain) {
  return String(rawDomain || '').trim().toLowerCase();
}

function normalizeLang(rawLang) {
  const code = String(rawLang || '').trim().toLowerCase();
  return SUPPORTED_LANGS.has(code) ? code : 'en';
}

function extractExtension(domain) {
  const matchedMulti = MULTI_PART_EXTENSIONS.find((ext) => domain.endsWith(ext) && domain.length > ext.length);
  if (matchedMulti) return matchedMulti;
  const dotIdx = domain.indexOf('.');
  return dotIdx > 0 ? domain.slice(dotIdx) : '';
}

function clampScore(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function splitDomainSldAndExt(rawDomain, explicitExt) {
  const domain = normalizeDomain(rawDomain);
  const matchedMulti = MULTI_PART_EXTENSIONS.find((ext) => domain.endsWith(ext) && domain.length > ext.length);
  if (matchedMulti) {
    return {
      sld: domain.slice(0, domain.length - matchedMulti.length),
      ext: matchedMulti
    };
  }
  if (explicitExt && domain.endsWith(explicitExt) && domain.length > explicitExt.length) {
    return {
      sld: domain.slice(0, domain.length - explicitExt.length),
      ext: explicitExt
    };
  }
  const lastDot = domain.lastIndexOf('.');
  if (lastDot > 0) {
    return {
      sld: domain.slice(0, lastDot),
      ext: domain.slice(lastDot)
    };
  }
  return { sld: domain, ext: explicitExt || '' };
}

function analyzeSldStemsAndLang(sld) {
  const tokens = sld.split('-').filter(Boolean);
  const alphaTokens = tokens.map((t) => t.replace(/[^a-z]/g, '')).filter(Boolean);
  let exactStemHits = 0;
  let containedStemHits = 0;
  const langHits = { id: 0, en: 0, es: 0, pt: 0, de: 0 };

  for (let i = 0; i < ALL_NICHE_STEMS_BY_LANG.length; i++) {
    const entry = ALL_NICHE_STEMS_BY_LANG[i];
    const stem = entry.stem;
    const isExact = sld === stem || tokens.includes(stem) || alphaTokens.includes(stem);
    if (isExact) {
      exactStemHits++;
      langHits[entry.lang] = (langHits[entry.lang] || 0) + 2;
    } else if (stem.length >= 4) {
      const hasBoundaryMatch = alphaTokens.some((t) => t.startsWith(stem) || t.endsWith(stem));
      const hasLongMatch = stem.length >= 5 && alphaTokens.some((t) => t.includes(stem));
      if (hasBoundaryMatch || hasLongMatch) {
        containedStemHits++;
        langHits[entry.lang] = (langHits[entry.lang] || 0) + 1;
      }
    }
  }

  let detectedLang = null;
  let bestScore = 0;
  let tie = false;
  for (const code of Object.keys(langHits)) {
    const score = langHits[code];
    if (score > bestScore) {
      bestScore = score;
      detectedLang = code;
      tie = false;
    } else if (score > 0 && score === bestScore) {
      tie = true;
    }
  }
  if (tie) detectedLang = null;

  return {
    tokens,
    exactStemHits,
    containedStemHits,
    detectedLang
  };
}

function normalizeTargetKeywords(rawTargetKeywords) {
  let rawList = [];
  if (Array.isArray(rawTargetKeywords)) {
    rawList = rawTargetKeywords;
  } else if (rawTargetKeywords && typeof rawTargetKeywords === 'object') {
    if (Array.isArray(rawTargetKeywords.keywords)) {
      rawList = rawTargetKeywords.keywords;
    } else {
      rawList = [rawTargetKeywords.kw, rawTargetKeywords.kw2, rawTargetKeywords.kw3];
    }
  } else if (typeof rawTargetKeywords === 'string') {
    rawList = rawTargetKeywords.split(/[\s,;+|/]+/);
  }

  const seen = new Set();
  const normalized = [];
  for (let i = 0; i < rawList.length; i++) {
    const parts = String(rawList[i] || '').toLowerCase().split(/[\s,;+|/]+/);
    for (let j = 0; j < parts.length; j++) {
      const token = parts[j].replace(/[^a-z0-9]/g, '');
      if (token.length >= 2 && !seen.has(token)) {
        seen.add(token);
        normalized.push(token);
        if (normalized.length >= 6) return normalized;
      }
    }
  }
  return normalized;
}

function countNonOverlappingOccurrences(haystack, needle) {
  if (!haystack || !needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    const found = haystack.indexOf(needle, idx);
    if (found === -1) break;
    count++;
    idx = found + needle.length;
  }
  return count;
}

function computeEmdPmdScore(sld, alphaOnly, rawTargetKeywords) {
  const keywords = normalizeTargetKeywords(rawTargetKeywords);
  const sldLen = sld.length;
  const hyphenCount = (sld.match(/-/g) || []).length;
  const digitsCount = (sld.match(/[0-9]/g) || []).length;
  const dashTokens = sld.split('-').filter(Boolean);

  if (keywords.length === 0) {
    return { score: 75, matchType: 'neutral_no_kw' };
  }

  let matchedKwCount = 0;
  let totalOccurrences = 0;
  let maxKwOccurrences = 0;
  let uniqueMatchedChars = 0;
  let combinedMatchedAlpha = 0;
  const cleanAlnum = sld.replace(/[^a-z0-9]/g, '');

  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i];
    const targetText = /[0-9]/.test(kw) ? cleanAlnum : alphaOnly;
    const occ = countNonOverlappingOccurrences(targetText, kw);
    if (occ > 0) {
      matchedKwCount++;
      totalOccurrences += occ;
      if (occ > maxKwOccurrences) maxKwOccurrences = occ;
      uniqueMatchedChars += kw.length;
      combinedMatchedAlpha += kw.length * occ;
    }
  }

  // Check duplicate dash tokens beyond explicit keywords (e.g., buy-shop-shop)
  let duplicateTokenStuffing = false;
  if (dashTokens.length >= 2) {
    const tokenCounts = Object.create(null);
    for (let i = 0; i < dashTokens.length; i++) {
      const tok = dashTokens[i].replace(/[^a-z0-9]/g, '');
      if (tok.length >= 2) {
        tokenCounts[tok] = (tokenCounts[tok] || 0) + 1;
        if (tokenCounts[tok] >= 2) duplicateTokenStuffing = true;
      }
    }
  }

  let spamModifierHits = 0;
  for (const mod of COMMERCIAL_SPAM_MODIFIERS) {
    if (
      dashTokens.includes(mod) ||
      (cleanAlnum.length >= mod.length + 3 && (cleanAlnum.startsWith(mod) || cleanAlnum.endsWith(mod)))
    ) {
      spamModifierHits++;
    }
  }

  if (matchedKwCount === 0) {
    if (duplicateTokenStuffing || hyphenCount >= 2 || sldLen >= 17) {
      return { score: 58, matchType: 'non_match_noisy' };
    }
    return { score: 70, matchType: 'non_match_clean' };
  }

  const coverageRatio = Math.min(1, combinedMatchedAlpha / Math.max(1, cleanAlnum.length));
  const isExactMatch =
    coverageRatio >= 0.92 ||
    (matchedKwCount === keywords.length && cleanAlnum.length <= uniqueMatchedChars + 1);

  // Over-optimization penalties (15-45) for stuffing, forced phrasing, digits, hyphens, or overlong keyword chasing
  if (maxKwOccurrences >= 2 || duplicateTokenStuffing) {
    const penaltyScore = clampScore(34 - (maxKwOccurrences - 2) * 10 - hyphenCount * 4 - (sldLen > 14 ? 6 : 0), 26);
    return { score: Math.max(15, Math.min(42, penaltyScore)), matchType: 'over_optimized_stuffing' };
  }

  if (totalOccurrences >= 3) {
    const penaltyScore = clampScore(
      (hyphenCount >= 1 || sldLen >= 13 ? 30 : 42) - Math.max(0, sldLen - 12) * 2 - hyphenCount * 5,
      30
    );
    return { score: Math.max(15, Math.min(45, penaltyScore)), matchType: 'over_optimized_stuffing' };
  }

  if (hyphenCount >= 1) {
    const penaltyScore = clampScore(
      44 - (hyphenCount - 1) * 12 - Math.max(0, sldLen - 10) * 2 - spamModifierHits * 6 - digitsCount * 4,
      34
    );
    return { score: Math.max(15, Math.min(45, penaltyScore)), matchType: 'over_optimized_forced' };
  }

  if (digitsCount > 0) {
    const penaltyScore = clampScore(42 - digitsCount * 2 - Math.max(0, sldLen - 10) * 2 - spamModifierHits * 5, 36);
    return { score: Math.max(15, Math.min(45, penaltyScore)), matchType: 'over_optimized_forced' };
  }

  if (sldLen >= 15 || (spamModifierHits >= 1 && sldLen >= 11)) {
    const penaltyScore = clampScore(42 - Math.max(0, sldLen - 14) * 3 - spamModifierHits * 5, 32);
    return { score: Math.max(15, Math.min(45, penaltyScore)), matchType: 'over_optimized_long' };
  }

  // Natural & concise PMD (85-95): embeds 1-2 target keywords naturally without stuffing or forced hyphens
  if (!isExactMatch && sldLen <= 12 && matchedKwCount <= 2) {
    let pmdScore = 90;
    if (sldLen <= 9) pmdScore += 4;
    else if (sldLen <= 11) pmdScore += 2;
    else pmdScore -= 3;
    if (matchedKwCount === 2 && sldLen >= 11) pmdScore -= 3;
    if (spamModifierHits >= 1) pmdScore -= 5;
    return {
      score: Math.max(85, Math.min(95, clampScore(pmdScore, 90))),
      matchType: 'natural_pmd'
    };
  }

  // Clean concise EMD (no hyphens/digits/repetition, <= 12 chars)
  if (isExactMatch && sldLen <= 12) {
    const emdScore = sldLen <= 8 ? 80 : 74;
    return { score: emdScore, matchType: 'balanced_emd' };
  }

  // Remaining moderately long compounds (13-14 chars)
  return {
    score: clampScore(45 - Math.max(0, sldLen - 12) * 3, 39),
    matchType: 'over_optimized_long'
  };
}

function computeOverallHeuristicScore(
  pronunciationComfort,
  brandability,
  structure,
  extFit,
  cleanliness,
  nicheClarity,
  emdPmdScore = 75,
  fallback = 50
) {
  let rawOverall =
    pronunciationComfort * 0.22 +
    brandability * 0.20 +
    structure * 0.13 +
    extFit * 0.12 +
    cleanliness * 0.10 +
    nicheClarity * 0.11 +
    emdPmdScore * 0.12;

  // Prevent clean formatting, short length, or .com alone from inflating meaningless & awkward permutations
  if (pronunciationComfort < 72 && nicheClarity < 60) {
    rawOverall -= (72 - pronunciationComfort) * 0.45 + (60 - nicheClarity) * 0.35;
  }

  // Press down keyword-stuffed, forced, or overlong over-optimized EMDs/PMDs
  if (emdPmdScore < 50) {
    rawOverall -= (50 - emdPmdScore) * 0.45;
  }

  return clampScore(rawOverall, fallback);
}

function computeDomainScores(rawDomain, explicitExt, rawLang, rawTargetKeywords) {
  const { sld, ext } = splitDomainSldAndExt(rawDomain, explicitExt);
  const uiLang = normalizeLang(rawLang);
  const sldLen = sld.length;
  const alphaOnly = sld.replace(/[^a-z]/g, '');
  const digitsCount = (sld.match(/[0-9]/g) || []).length;
  const hyphenCount = (sld.match(/-/g) || []).length;
  const isVowelChar = (ch) => ch === 'a' || ch === 'e' || ch === 'i' || ch === 'o' || ch === 'u';
  const stemAnalysis = analyzeSldStemsAndLang(sld);
  const extLower = ext.toLowerCase();
  const isIdContext = stemAnalysis.detectedLang === 'id' ||
    ['.id', '.co.id', '.biz.id', '.web.id', '.my.id'].includes(extLower);

  const isKnownStem = stemAnalysis.exactStemHits >= 1;

  // 1. Pronunciation Comfort Score (0-100): dedicated "radio test" smoothness, vowel-consonant flow & phonetic spelling clarity
  let pronunciationComfort = 58;
  if (alphaOnly.length === 0) {
    pronunciationComfort = 28;
  } else if (alphaOnly.length === 1) {
    pronunciationComfort = 54;
  } else {
    let vowelCount = 0;
    let yCount = 0;
    let maxConsRun = 0;
    let maxVowelRun = 0;
    let curConsRun = 0;
    let curVowelRun = 0;
    let transitions = 0;
    let prevIsVowel = null;

    for (let i = 0; i < alphaOnly.length; i++) {
      const ch = alphaOnly[i];
      const v = isVowelChar(ch);
      const isSyllabicY = ch === 'y' && i > 0 && !isVowelChar(alphaOnly[i - 1]);
      if (v) {
        vowelCount++;
        curVowelRun++;
        curConsRun = 0;
        if (curVowelRun > maxVowelRun) maxVowelRun = curVowelRun;
      } else if (isSyllabicY) {
        yCount++;
        curConsRun = 0;
        curVowelRun = 0;
      } else {
        if (ch === 'y') yCount++;
        curConsRun++;
        curVowelRun = 0;
        if (curConsRun > maxConsRun) maxConsRun = curConsRun;
      }
      const effectiveV = v || (ch === 'y' && i > 0);
      if (prevIsVowel !== null && effectiveV !== prevIsVowel) {
        transitions++;
      }
      prevIsVowel = effectiveV;
    }

    const effectiveVowels = vowelCount + yCount * 0.5;
    const vRatio = effectiveVowels / alphaOnly.length;
    if (vRatio >= 0.30 && vRatio <= 0.56) {
      pronunciationComfort += maxVowelRun >= 2 ? 14 : 16;
    } else if ((vRatio >= 0.20 && vRatio < 0.30) || (vRatio > 0.56 && vRatio <= 0.68)) {
      pronunciationComfort += 8;
    } else if (vowelCount === 0 && yCount === 0) {
      pronunciationComfort -= alphaOnly.length <= 3 ? 12 : 30;
    } else {
      pronunciationComfort -= 10;
    }

    if (maxConsRun <= 2) {
      pronunciationComfort += maxVowelRun >= 2 ? 8 : 8;
    } else if (maxConsRun === 3) {
      pronunciationComfort -= 8;
    } else {
      pronunciationComfort -= 22;
    }

    if (maxVowelRun >= 3) {
      pronunciationComfort -= 18;
    }

    const transitionRatio = transitions / Math.max(1, alphaOnly.length - 1);
    if (maxVowelRun === 1) {
      if (transitionRatio >= 0.62) {
        pronunciationComfort += 10;
      } else if (transitionRatio >= 0.42) {
        pronunciationComfort += 5;
      } else if (transitionRatio < 0.28) {
        pronunciationComfort -= 8;
      }
    } else if (transitionRatio < 0.32) {
      pronunciationComfort -= 6;
    }

    let awkwardPhoneticPenalty = 0;
    const hasStemContext = isKnownStem || stemAnalysis.containedStemHits >= 1;

    // Vowel hiatus & unnatural diphthong checks (e.g., souj -> ouj, soik -> oi + k)
    if (!hasStemContext) {
      if (/(aa|ii|uu)/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 14;
      }
      if (/(oi|oy|eu|iu|uo|oe|ao|eo|ae|ui)/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 12;
      } else if (maxVowelRun === 2) {
        awkwardPhoneticPenalty += 4;
      }
      if (/[aeiou]{2}[jkqptbdgcvwxz](?:$|[bcdfghjklmnpqrstvwxyz])/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 16;
      }
      // Awkward vowel+y glides & non-standard y sequences (e.g., -iy, -uy, -yy)
      if (/(?:iy|uy|yy)/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 42;
      } else if (/[aeo]y$/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 8;
      }
    } else if (/(aa|ii|uu)/.test(alphaOnly)) {
      awkwardPhoneticPenalty += 8;
    }

    // Abrupt / tongue-stopping word endings & awkward permutation codas (e.g., -iw, -uc, -uf)
    if (/[jq]$/.test(alphaOnly)) {
      awkwardPhoneticPenalty += 22;
    } else if (!isKnownStem) {
      if (/[iu]w$/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 44;
      } else if (/[vzx]$/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 14;
      } else if (/w$/.test(alphaOnly) && !/[aeo]w$/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 14;
      } else if (/[aeou]c$/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 40;
      } else if (/ic$/.test(alphaOnly) && stemAnalysis.containedStemHits === 0) {
        awkwardPhoneticPenalty += 10;
      } else if (/[aeiou]f$/.test(alphaOnly) && stemAnalysis.containedStemHits === 0) {
        awkwardPhoneticPenalty += 38;
      } else if (/[aeiou][bg]$/.test(alphaOnly) && stemAnalysis.containedStemHits === 0) {
        awkwardPhoneticPenalty += 32;
      } else if (/[aeiou]p$/.test(alphaOnly) && stemAnalysis.containedStemHits === 0) {
        awkwardPhoneticPenalty += 26;
      } else if (!isIdContext && /[aeiou]h$/.test(alphaOnly) && stemAnalysis.containedStemHits === 0) {
        awkwardPhoneticPenalty += 32;
      }
    }

    if (!isIdContext && !isKnownStem) {
      if (/[iuo]k$/.test(alphaOnly)) {
        awkwardPhoneticPenalty += 14;
      } else if (/k$/.test(alphaOnly) && stemAnalysis.containedStemHits === 0) {
        awkwardPhoneticPenalty += 8;
      }
    }

    pronunciationComfort -= awkwardPhoneticPenalty;

    // Heavy/ambiguous phonetic letters
    const qxzCount = (alphaOnly.match(/[qxz]/g) || []).length;
    const kCount = (alphaOnly.match(/k/g) || []).length;
    pronunciationComfort -= Math.min(15, qxzCount * 5);
    if (!isIdContext && kCount > 0) {
      pronunciationComfort -= Math.min(6, kCount * 2);
    }

    if (/(kk|qq|xx|zz)/.test(alphaOnly)) {
      pronunciationComfort -= 6;
    }

    // Jarring consonant collisions in coined non-dictionary words
    if (
      !isKnownStem &&
      stemAnalysis.containedStemHits === 0 &&
      /(?:[jqxz][bcdfghjklmnpqrstvwxyz]|[bcdfghjklmnpqrstvwxyz][jqx]|(?:bk|bp|bt|bv|bz|cb|cd|cf|cg|cm|cn|cp|cv|cz|db|dc|df|dg|dk|dm|dn|dp|dv|dz|fb|fc|fd|fg|fk|fm|fp|fv|fz|gb|gc|gd|gf|gk|gm|gp|gv|gz|hb|hc|hd|hf|hg|hm|hn|hp|hv|hz|kb|kc|kd|kf|kg|km|kp|kv|kz|pb|pc|pd|pf|pg|pk|pv|pz|tb|tc|td|tf|tg|tk|tv|tz|vb|vc|vd|vf|vg|vh|vk|vl|vm|vn|vp|vr|vs|vt|vw|vz))/.test(alphaOnly)
    ) {
      pronunciationComfort -= 10;
    }

    if (isKnownStem && maxConsRun <= 2 && qxzCount === 0) {
      pronunciationComfort += 10;
    } else if (stemAnalysis.containedStemHits >= 1 && maxConsRun <= 2 && qxzCount === 0 && awkwardPhoneticPenalty === 0) {
      pronunciationComfort += 8;
    } else if (
      awkwardPhoneticPenalty === 0 &&
      qxzCount === 0 &&
      (
        /[aeiou]$|(?:ly|ry|ny|ty|sy)$/.test(alphaOnly) ||
        (isIdContext && /(ng|ny)/.test(alphaOnly) && maxConsRun <= 3)
      )
    ) {
      pronunciationComfort += 4;
    }
  }
  pronunciationComfort = clampScore(pronunciationComfort, 50);

  // 2. Brandability Score (0-100): memorability, identity distinctiveness & commercial brand punchiness
  let brandability = 62;
  if (alphaOnly.length === 0) {
    brandability = 40;
  } else if (alphaOnly.length === 1) {
    brandability = 64;
  } else {
    if (alphaOnly.length >= 4 && alphaOnly.length <= 7) {
      brandability += 14;
    } else if (alphaOnly.length === 3 || alphaOnly.length === 8) {
      brandability += 10;
    } else if (alphaOnly.length === 2) {
      brandability += 8;
    } else if (alphaOnly.length >= 9 && alphaOnly.length <= 11) {
      brandability += 3;
    } else if (alphaOnly.length >= 13) {
      brandability -= Math.min(14, (alphaOnly.length - 12) * 3);
    }

    if (stemAnalysis.exactStemHits === 0 && stemAnalysis.containedStemHits <= 1 && alphaOnly.length >= 4 && alphaOnly.length <= 8) {
      if (pronunciationComfort >= 78) {
        brandability += 10;
      } else if (pronunciationComfort >= 66) {
        brandability += 4;
      }
    } else if (stemAnalysis.exactStemHits >= 1 && alphaOnly.length <= 10) {
      brandability += 8;
    } else if (stemAnalysis.exactStemHits === 1) {
      brandability += 4;
    }

    const uniqueLetters = new Set(alphaOnly.split('')).size;
    const varietyRatio = uniqueLetters / alphaOnly.length;
    if (alphaOnly.length >= 4 && varietyRatio >= 0.55) {
      brandability += 4;
    } else if (alphaOnly.length >= 4 && varietyRatio < 0.35) {
      brandability -= 8;
    }

    if (
      alphaOnly.length >= 4 &&
      alphaOnly.length <= 9 &&
      pronunciationComfort >= 65 &&
      /[aeiorlmn]$|[^aeiouy]y$/.test(alphaOnly)
    ) {
      brandability += 5;
    }

    if (digitsCount === 0 && hyphenCount === 0) {
      brandability += 6;
    } else {
      brandability -= 4;
    }

    // Radio-test usability safeguard: names that fail spontaneous pronunciation lose brand punch
    if (pronunciationComfort < 45) {
      brandability -= 24;
    } else if (pronunciationComfort < 58) {
      brandability -= 18;
    } else if (pronunciationComfort < 68) {
      brandability -= 10;
    } else if (pronunciationComfort < 76) {
      brandability -= 4;
    }
  }
  brandability = clampScore(brandability, 50);

  // 3. Structure & Length Score (0-100): focused on SLD length & moderate word-split structure
  let structure = 50;
  if (sldLen === 1) structure = 90;
  else if (sldLen >= 2 && sldLen <= 4) structure = 96;
  else if (sldLen >= 5 && sldLen <= 7) structure = 90;
  else if (sldLen >= 8 && sldLen <= 10) structure = 82;
  else if (sldLen >= 11 && sldLen <= 13) structure = 68;
  else if (sldLen >= 14 && sldLen <= 17) structure = 52;
  else structure = Math.max(20, 48 - (sldLen - 17) * 3);

  const dashParts = sld.split('-').filter(Boolean);
  if (digitsCount === 0 && hyphenCount === 0) {
    structure += 4;
  } else {
    if (hyphenCount === 1 && dashParts.length === 2 && dashParts.every((p) => p.length >= 2)) {
      structure -= 4;
    } else if (hyphenCount > 0) {
      structure -= Math.min(18, hyphenCount * 9);
    }
    if (digitsCount > 0) {
      structure -= Math.min(12, 4 + digitsCount * 2);
    }
  }
  structure = clampScore(structure, 50);

  // 4. Extension & Language Fit Score (0-100): consistent market-ranked TLD popularity per selected language
  const extFit = clampScore(computeExtensionLangFitScore(extLower, uiLang), 65);

  // 5. Character Cleanliness Score (0-100): purely digits, hyphens & excessive identical char repetition
  let cleanliness = 100;
  if (digitsCount > 0) cleanliness -= 18 + Math.min(24, (digitsCount - 1) * 5);
  if (hyphenCount > 0) cleanliness -= 16 + Math.min(24, (hyphenCount - 1) * 12);
  if (/(.)\1{2,}/.test(sld)) cleanliness -= 14;
  cleanliness = clampScore(cleanliness, 70);

  // 6. Niche Clarity Score (0-100): exact token priority, strict compound boundary, modest/low baseline when no real word meaning
  let nicheClarity = 38;
  if (stemAnalysis.exactStemHits >= 2) {
    nicheClarity = 94;
  } else if (stemAnalysis.exactStemHits === 1 && stemAnalysis.containedStemHits >= 1) {
    nicheClarity = 92;
  } else if (stemAnalysis.exactStemHits === 1) {
    nicheClarity = 90;
  } else if (stemAnalysis.containedStemHits >= 2) {
    nicheClarity = 78;
  } else if (stemAnalysis.containedStemHits === 1) {
    nicheClarity = 73;
  } else if (alphaOnly.length >= 4 && alphaOnly.length <= 9 && digitsCount === 0 && hyphenCount === 0 && pronunciationComfort >= 80) {
    nicheClarity = 58;
  } else if (alphaOnly.length >= 3 && alphaOnly.length <= 10 && digitsCount === 0 && hyphenCount === 0 && pronunciationComfort >= 66) {
    nicheClarity = 48;
  } else {
    nicheClarity = 38;
  }
  nicheClarity = clampScore(nicheClarity, 38);

  // 7. EMD / PMD Over-Optimization Risk Score (0-100)
  const emdPmdResult = computeEmdPmdScore(sld, alphaOnly, rawTargetKeywords);
  const emdPmdScore = clampScore(emdPmdResult.score, 75);

  // 8. Overall Heuristic Score (0-100): weighted composite (weights = 1.00) + penalties for weak phonetics / over-optimization
  const overall = computeOverallHeuristicScore(
    pronunciationComfort,
    brandability,
    structure,
    extFit,
    cleanliness,
    nicheClarity,
    emdPmdScore,
    50
  );

  return {
    pronunciation_comfort_score: pronunciationComfort,
    brandability_score: brandability,
    structure_length_score: structure,
    extension_lang_fit_score: extFit,
    character_cleanliness_score: cleanliness,
    niche_clarity_score: nicheClarity,
    emd_pmd_score: emdPmdScore,
    emd_pmd_match_type: emdPmdResult.matchType,
    overall_heuristic_score: overall
  };
}

async function ensureAvailableDomainsSchema(db) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS available_domains (
          domain TEXT PRIMARY KEY,
          extension TEXT NOT NULL,
          char_length INTEGER NOT NULL,
          lang TEXT NOT NULL DEFAULT 'en',
          check_method TEXT NOT NULL,
          check_source TEXT NOT NULL,
          checked_at INTEGER NOT NULL,
          pronunciation_comfort_score INTEGER,
          brandability_score INTEGER,
          structure_length_score INTEGER,
          extension_lang_fit_score INTEGER,
          character_cleanliness_score INTEGER,
          niche_clarity_score INTEGER,
          emd_pmd_score INTEGER,
          emd_pmd_match_type TEXT,
          overall_heuristic_score INTEGER,
          scored_at INTEGER
        )
      `).run();

      const tableInfoStmt = db.prepare('PRAGMA table_info(available_domains)');
      if (typeof tableInfoStmt.all === 'function') {
        const info = await tableInfoStmt.all();
        const cols = Array.isArray(info && info.results) ? info.results : [];
        const colNames = new Set(cols.map((col) => col && col.name).filter(Boolean));

        if (!colNames.has('lang')) {
          await db.prepare("ALTER TABLE available_domains ADD COLUMN lang TEXT NOT NULL DEFAULT 'en'").run();
        }
        if (colNames.has('checked_at_iso')) {
          try {
            await db.prepare('ALTER TABLE available_domains DROP COLUMN checked_at_iso').run();
          } catch {
            await db.batch([
              db.prepare(`
                CREATE TABLE IF NOT EXISTS available_domains_migrated (
                  domain TEXT PRIMARY KEY,
                  extension TEXT NOT NULL,
                  char_length INTEGER NOT NULL,
                  lang TEXT NOT NULL DEFAULT 'en',
                  check_method TEXT NOT NULL,
                  check_source TEXT NOT NULL,
                  checked_at INTEGER NOT NULL,
                  pronunciation_comfort_score INTEGER,
                  brandability_score INTEGER,
                  structure_length_score INTEGER,
                  extension_lang_fit_score INTEGER,
                  character_cleanliness_score INTEGER,
                  niche_clarity_score INTEGER,
                  emd_pmd_score INTEGER,
                  emd_pmd_match_type TEXT,
                  overall_heuristic_score INTEGER,
                  scored_at INTEGER
                )
              `),
              db.prepare(`
                INSERT INTO available_domains_migrated (
                  domain, extension, char_length, lang, check_method, check_source, checked_at
                )
                SELECT domain, extension, char_length, lang, check_method, check_source, checked_at
                FROM available_domains
              `),
              db.prepare('DROP TABLE available_domains'),
              db.prepare('ALTER TABLE available_domains_migrated RENAME TO available_domains')
            ]);
            colNames.clear();
            ['domain', 'extension', 'char_length', 'lang', 'check_method', 'check_source', 'checked_at', 'emd_pmd_match_type', ...SCORE_COLUMNS]
              .forEach((name) => colNames.add(name));
          }
        }
        for (const scoreCol of SCORE_COLUMNS) {
          if (!colNames.has(scoreCol)) {
            await db.prepare(`ALTER TABLE available_domains ADD COLUMN ${scoreCol} INTEGER`).run();
          }
        }
        if (!colNames.has('emd_pmd_match_type')) {
          await db.prepare('ALTER TABLE available_domains ADD COLUMN emd_pmd_match_type TEXT').run();
        }
      }

      await db.batch([
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_available_domains_checked_at
          ON available_domains (checked_at DESC)
        `),
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_available_domains_extension
          ON available_domains (extension, checked_at DESC)
        `),
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_available_domains_char_length
          ON available_domains (char_length, checked_at DESC)
        `),
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_available_domains_lang
          ON available_domains (lang, checked_at DESC)
        `),
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_available_domains_emd_pmd
          ON available_domains (emd_pmd_score, emd_pmd_match_type, checked_at DESC)
        `)
      ]);
    })().catch((err) => {
      schemaReadyPromise = null;
      throw err;
    });
  }
  return schemaReadyPromise;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env || !env.DB) {
    return jsonResponse(
      { ok: false, logged: false, error: 'D1 database binding (env.DB) is not configured.' },
      503
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, logged: false, error: 'Invalid JSON request body.' }, 400);
  }

  if (!body || typeof body !== 'object') {
    return jsonResponse({ ok: false, logged: false, error: 'Request payload must be a JSON object.' }, 400);
  }

  const domain = normalizeDomain(body.domain);
  const status = String(body.status || '').trim().toLowerCase();

  if (status !== 'available') {
    return jsonResponse(
      { ok: false, logged: false, error: 'Only available domains may be logged.' },
      400
    );
  }

  if (!domain || domain.length > MAX_LOGGED_DOMAIN_LENGTH || !DOMAIN_HOSTNAME_RE.test(domain)) {
    return jsonResponse(
      { ok: false, logged: false, error: `Domain must be a valid hostname with length <= ${MAX_LOGGED_DOMAIN_LENGTH}.` },
      400
    );
  }

  const extension = extractExtension(domain);
  if (!extension) {
    return jsonResponse({ ok: false, logged: false, error: 'Domain must include a valid extension.' }, 400);
  }

  const charLength = domain.length;
  const lang = normalizeLang(body.lang || body.language);
  const rawMethod = String(body.checkMethod || body.method || 'RDAP').trim().toUpperCase();
  const checkMethod = rawMethod === 'NS' ? 'NS' : 'RDAP';
  const rawSource = String(body.checkSource || body.source || 'manual').trim().toLowerCase();
  const checkSource = rawSource === 'auto' ? 'auto' : 'manual';

  const parsedCheckedAt = Number(body.checkedAt);
  const checkedAt = Number.isFinite(parsedCheckedAt) && parsedCheckedAt > 0
    ? Math.floor(parsedCheckedAt)
    : Date.now();
  const checkedAtIso = new Date(checkedAt).toISOString();

  const rawKeywords = body.keywords || body.targetKeywords || [body.kw, body.kw2, body.kw3];
  const computedScores = computeDomainScores(domain, extension, lang, rawKeywords);
  const clientScores = (body.scores && typeof body.scores === 'object') ? body.scores : {};
  const pronunciationComfortScore = clampScore(
    clientScores.pronunciation_comfort_score,
    computedScores.pronunciation_comfort_score
  );
  const brandabilityScore = clampScore(clientScores.brandability_score, computedScores.brandability_score);
  const structureLengthScore = clampScore(clientScores.structure_length_score, computedScores.structure_length_score);
  const extensionLangFitScore = clampScore(clientScores.extension_lang_fit_score, computedScores.extension_lang_fit_score);
  const characterCleanlinessScore = clampScore(clientScores.character_cleanliness_score, computedScores.character_cleanliness_score);
  const nicheClarityScore = clampScore(clientScores.niche_clarity_score, computedScores.niche_clarity_score);
  const emdPmdScore = clampScore(clientScores.emd_pmd_score, computedScores.emd_pmd_score);
  const emdPmdMatchType = typeof clientScores.emd_pmd_match_type === 'string' && clientScores.emd_pmd_match_type.trim()
    ? clientScores.emd_pmd_match_type.trim().slice(0, 40)
    : computedScores.emd_pmd_match_type;
  const overallHeuristicScore = computeOverallHeuristicScore(
    pronunciationComfortScore,
    brandabilityScore,
    structureLengthScore,
    extensionLangFitScore,
    characterCleanlinessScore,
    nicheClarityScore,
    emdPmdScore,
    computedScores.overall_heuristic_score
  );
  const scoredAt = Date.now();

  try {
    await ensureAvailableDomainsSchema(env.DB);

    await env.DB.prepare(`
      INSERT INTO available_domains (
        domain,
        extension,
        char_length,
        lang,
        check_method,
        check_source,
        checked_at,
        pronunciation_comfort_score,
        brandability_score,
        structure_length_score,
        extension_lang_fit_score,
        character_cleanliness_score,
        niche_clarity_score,
        emd_pmd_score,
        emd_pmd_match_type,
        overall_heuristic_score,
        scored_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)
      ON CONFLICT(domain) DO UPDATE SET
        extension = excluded.extension,
        char_length = excluded.char_length,
        lang = excluded.lang,
        check_method = excluded.check_method,
        check_source = excluded.check_source,
        checked_at = excluded.checked_at,
        pronunciation_comfort_score = excluded.pronunciation_comfort_score,
        brandability_score = excluded.brandability_score,
        structure_length_score = excluded.structure_length_score,
        extension_lang_fit_score = excluded.extension_lang_fit_score,
        character_cleanliness_score = excluded.character_cleanliness_score,
        niche_clarity_score = excluded.niche_clarity_score,
        emd_pmd_score = excluded.emd_pmd_score,
        emd_pmd_match_type = excluded.emd_pmd_match_type,
        overall_heuristic_score = excluded.overall_heuristic_score,
        scored_at = excluded.scored_at
    `)
      .bind(
        domain,
        extension,
        charLength,
        lang,
        checkMethod,
        checkSource,
        checkedAt,
        pronunciationComfortScore,
        brandabilityScore,
        structureLengthScore,
        extensionLangFitScore,
        characterCleanlinessScore,
        nicheClarityScore,
        emdPmdScore,
        emdPmdMatchType,
        overallHeuristicScore,
        scoredAt
      )
      .run();

    return jsonResponse({
      ok: true,
      logged: true,
      domain,
      extension,
      charLength,
      lang,
      checkMethod,
      checkSource,
      checkedAt,
      checkedAtIso,
      scoredAt,
      scores: {
        pronunciation_comfort_score: pronunciationComfortScore,
        brandability_score: brandabilityScore,
        structure_length_score: structureLengthScore,
        extension_lang_fit_score: extensionLangFitScore,
        character_cleanliness_score: characterCleanlinessScore,
        niche_clarity_score: nicheClarityScore,
        emd_pmd_score: emdPmdScore,
        emd_pmd_match_type: emdPmdMatchType,
        overall_heuristic_score: overallHeuristicScore
      }
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, logged: false, error: 'Failed to persist available domain log.' },
      500
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return jsonResponse({ ok: false, error: 'Method not allowed. Use POST.' }, 405);
}
