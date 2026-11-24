import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const LEXICON_DIR = path.resolve(__dirname, 'lexicon');
export const LEXICON_LANGS = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];
export const ALL_LEXICON_KEYS = [...LEXICON_LANGS, 'short-exact'];

const WORD_RE = /^[a-z]{3,32}$/;
const SHORT_WORD_RE = /^[a-z]{2}$/;
const SUFFIX_WORD_RE = /^[a-z]{2,12}$/;
const TAG_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;

function resolveLexiconFile(key) {
  if (!ALL_LEXICON_KEYS.includes(key)) {
    throw new Error(`Unsupported lexicon key: ${key}`);
  }
  const resolved = path.resolve(LEXICON_DIR, `${key}.json`);
  if (!resolved.startsWith(LEXICON_DIR + path.sep)) {
    throw new Error('Invalid lexicon file path');
  }
  return resolved;
}

export function validateLexiconEntry(key, rawWord, rawBody) {
  const isShortExact = key === 'short-exact';
  const word = String(rawWord || '').trim().toLowerCase();
  const body = rawBody && typeof rawBody === 'object' ? rawBody : {};

  const weight = Number(body.weight);
  if (!Number.isFinite(weight) || weight < 0.1 || weight > 20) {
    throw new Error('Weight must be a number between 0.1 and 20.');
  }
  const roundedWeight = Math.round(weight * 10) / 10;

  const rawTags = Array.isArray(body.tags)
    ? body.tags
    : String(body.tags || '').split(',');
  const tags = [];
  for (const t of rawTags) {
    const cleanTag = String(t || '').trim().toLowerCase();
    if (!cleanTag) continue;
    if (!TAG_RE.test(cleanTag)) {
      throw new Error(`Invalid tag format "${cleanTag}". Use lowercase letters, numbers, and hyphens.`);
    }
    if (!tags.includes(cleanTag)) tags.push(cleanTag);
  }
  if (tags.length === 0 || tags.length > 5) {
    throw new Error('Provide between 1 and 5 valid tags.');
  }

  if (isShortExact) {
    if (!SHORT_WORD_RE.test(word)) {
      throw new Error('Short-exact tokens must be exactly 2 lowercase ASCII letters (a-z).');
    }
    const rawLangs = Array.isArray(body.langs) ? body.langs : [];
    const langs = [];
    for (const l of rawLangs) {
      const cleanLang = String(l || '').trim().toLowerCase();
      if (LEXICON_LANGS.includes(cleanLang) && !langs.includes(cleanLang)) {
        langs.push(cleanLang);
      }
    }
    if (langs.length === 0) {
      throw new Error('Select at least 1 language for a short-exact token.');
    }
    return {
      word,
      tuple: [roundedWeight, tags, langs]
    };
  }

  const suffixOnly = Boolean(body.suffixOnly);
  if (suffixOnly) {
    if (!SUFFIX_WORD_RE.test(word)) {
      throw new Error('Suffix-only tokens must be 2 to 12 lowercase ASCII letters (a-z).');
    }
  } else if (!WORD_RE.test(word)) {
    throw new Error('Lexicon words must be 3 to 32 lowercase ASCII letters (a-z).');
  }

  const tuple = suffixOnly
    ? [roundedWeight, tags, { suffixOnly: true }]
    : [roundedWeight, tags];

  return { word, tuple };
}

export function readLexiconFile(key) {
  const filePath = resolveLexiconFile(key);
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

export function readAllLexicons() {
  const shortExact = readLexiconFile('short-exact');
  const byLang = {};
  for (const lang of LEXICON_LANGS) {
    byLang[lang] = readLexiconFile(lang);
  }
  return { shortExact, byLang };
}

export function sortLexiconObject(obj) {
  const sorted = {};
  for (const k of Object.keys(obj).sort((a, b) => a.localeCompare(b))) {
    sorted[k] = obj[k];
  }
  return sorted;
}

export function writeBundleModule(shortExact, byLang) {
  const bundlePath = path.resolve(LEXICON_DIR, 'bundle.js');
  if (!bundlePath.startsWith(LEXICON_DIR + path.sep)) {
    throw new Error('Invalid bundle path');
  }
  const content = [
    '// Auto-generated from lib/lexicon/*.json — keeps Node.js ESM and Cloudflare Pages Functions in sync.',
    `export const SHORT_EXACT = ${JSON.stringify(sortLexiconObject(shortExact), null, 2)};`,
    '',
    `export const LEXICON_BY_LANG = ${JSON.stringify(
      Object.fromEntries(LEXICON_LANGS.map((l) => [l, sortLexiconObject(byLang[l] || {})])),
      null,
      2
    )};`,
    ''
  ].join('\n');
  fs.writeFileSync(bundlePath, content, 'utf8');
}

export function writeLexiconFile(key, data) {
  const filePath = resolveLexiconFile(key);
  const sorted = sortLexiconObject(data);
  fs.mkdirSync(LEXICON_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  const { shortExact, byLang } = readAllLexicons();
  writeBundleModule(shortExact, byLang);
  return sorted;
}

export function buildMergedLexicon(shortExact, byLang) {
  const merged = {};
  for (const lang of LEXICON_LANGS) {
    const langEntries = byLang[lang] || {};
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
  return {
    SHORT_EXACT: shortExact || {},
    LEXICON_8LANG: merged
  };
}
