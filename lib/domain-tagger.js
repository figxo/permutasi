import { SHORT_EXACT as BUNDLED_SHORT_EXACT, LEXICON_BY_LANG } from './lexicon/bundle.js';

const MULTI_PART_EXTS = [
  '.web.id', '.my.id', '.co.id', '.biz.id', '.or.id', '.ac.id', '.sch.id', '.net.id', '.go.id',
  '.com.br', '.net.br', '.org.br', '.edu.br',
  '.co.jp', '.ne.jp', '.or.jp', '.ac.jp', '.go.jp',
  '.co.uk', '.org.uk', '.me.uk', '.ac.uk', '.gov.uk',
  '.com.au', '.net.au', '.org.au', '.edu.au',
  '.co.nz', '.com.es', '.org.es', '.edu.es', '.com.mx', '.org.mx', '.com.ar', '.com.co', '.com.sg', '.com.my'
];

const LEXICON_LANG_ORDER = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];

export function mergeLexiconsByLang(byLang = LEXICON_BY_LANG) {
  const merged = {};
  for (const lang of LEXICON_LANG_ORDER) {
    const langEntries = (byLang && byLang[lang]) || {};
    for (const [word, entry] of Object.entries(langEntries)) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const weight = Number(entry[0]);
      const tags = Array.isArray(entry[1]) ? entry[1] : [];
      const opts = entry[2] && typeof entry[2] === 'object' && !Array.isArray(entry[2]) ? entry[2] : null;

      if (!merged[word]) {
        merged[word] = opts
          ? [weight, [...tags], [lang], { ...opts }]
          : [weight, [...tags], [lang]];
      } else {
        const existing = merged[word];
        existing[0] = Math.max(existing[0], weight);
        for (const tg of tags) {
          if (!existing[1].includes(tg)) existing[1].push(tg);
        }
        if (!existing[2].includes(lang)) {
          existing[2].push(lang);
        }
        if (opts && opts.suffixOnly) {
          existing[3] = { ...(existing[3] || {}), suffixOnly: true };
        }
      }
    }
  }
  return merged;
}

// 2-character tokens only match as standalone/hyphen-delimited tokens, never inside compound words
export const SHORT_EXACT = BUNDLED_SHORT_EXACT;

// Merged 8-language lexicon (id, en, es, pt, fr, ja, ru, de — ASCII/Latin)
// Entry format: word -> [weight, tags[], langs[], options?]
export const LEXICON_8LANG = mergeLexiconsByLang(LEXICON_BY_LANG);

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

function segmentAlpha(chunk, shortExactMap = SHORT_EXACT, lexiconMap = LEXICON_8LANG) {
  const n = chunk.length;
  if (!n) return { tokens: [], matchedChars: 0 };

  if (shortExactMap[chunk]) {
    return {
      tokens: [{ text: chunk, known: true, meta: shortExactMap[chunk] }],
      matchedChars: n
    };
  }

  const whole = lexiconMap[chunk];
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
      const meta = lexiconMap[sub];
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

export function generateDomainTags({
  domain = '',
  sld = '',
  extension = '',
  uiLang = 'en',
  shortExactMap = SHORT_EXACT,
  lexiconMap = LEXICON_8LANG
}) {
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
      const seg = segmentAlpha(part, shortExactMap, lexiconMap);
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
