/**
 * Domain Permutation & Research Generator - Google Apps Script Backend
 * Supports Full Word-Order Permutations (recursive combinatorial algorithm),
 * Dash & No-Dash variations, RFC 1035 domain validation, and 8-language URL sync.
 */

var SUPPORTED_LANGUAGES = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];

var DEFAULT_EXTENSIONS_BY_LANG = {
  en: '.com, .net, .io, .org',
  id: '.com, .net, .id, .my.id, .web.id',
  es: '.com, .net, .es, .org',
  pt: '.com, .net, .pt, .com.br',
  fr: '.com, .net, .fr, .org',
  de: '.com, .net, .de, .org',
  ru: '.com, .net, .ru, .org',
  ja: '.com, .net, .jp, .co.jp'
};

var TITLE_TPL_BY_LANG = {
  en: '{kw} Domain Permutation Generator for Research & Portfolios',
  id: 'Generator Permutasi Domain {kw} untuk Riset & Portofolio',
  es: 'Generador de Permutaciones de Dominio {kw} para Investigación y Portafolios',
  pt: 'Gerador de Permutações de Domínio {kw} para Pesquisa e Portfólios',
  fr: 'Générateur de Permutations de Domaine {kw} pour Recherche & Portefeuilles',
  de: '{kw} Domain-Permutations-Generator für Recherche & Portfolios',
  ru: 'Генератор перестановок доменов {kw} для исследований и портфелей',
  ja: '{kw} ドメイン置換ジェネレータ (リサーチ・ポートフォリオ)'
};

var PERM_VOWELS = ['a', 'i', 'u', 'e', 'o'];
var PERM_CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
var PERM_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var PERM_DASHES = ['-', ''];

/**
 * Web App entry point for Google Apps Script.
 * Reads ?lang=, ?kw=, ?kw2=, ?kw3= parameters and injects them safely into index.html
 * without breaking standalone static/Node serving of index.html.
 *
 * @param {GoogleAppsScript.Events.DoGet} e
 * @return {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var rawLang = String(params.lang || 'en').toLowerCase().trim();
  var lang = SUPPORTED_LANGUAGES.indexOf(rawLang) !== -1 ? rawLang : 'en';

  var kw = String(params.kw || params.keyword || '').trim();
  var kw2 = String(params.kw2 || params.keyword2 || '').trim();
  var kw3 = String(params.kw3 || params.keyword3 || '').trim();

  var activeDisplay = [kw || 'business', kw2, kw3].filter(function(item) {
    return Boolean(item);
  }).join(' ');

  var initPayload = {
    lang: lang,
    kw: kw,
    kw2: kw2,
    kw3: kw3
  };

  var rawHtml = HtmlService.createHtmlOutputFromFile('index').getContent();
  var safeJson = JSON.stringify(initPayload)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  var bootstrapScript = '<script>window.__GAS_INIT_PARAMS__ = ' + safeJson + ';</script>\n</head>';
  var hydratedHtml = rawHtml.replace('</head>', bootstrapScript);

  var titleTpl = TITLE_TPL_BY_LANG[lang] || TITLE_TPL_BY_LANG.en;
  var dynamicTitle = titleTpl.replace(/\{kw\}/g, activeDisplay);

  return HtmlService.createHtmlOutput(hydratedHtml)
    .setTitle(dynamicTitle)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Normalizes and sanitizes a keyword token for domain label generation.
 *
 * @param {string} str
 * @return {string}
 */
function sanitizeKeywordToken(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

/**
 * Recursive combinatorial algorithm (backtracking) to generate all unique
 * word-order permutations of the provided array of keywords.
 *
 * Example: ['calc', 'pro', 'hub'] -> 6 unique orderings.
 *
 * @param {string[]} words
 * @return {string[][]}
 */
function permuteWords(words) {
  var result = [];
  var seenKeys = Object.create(null);

  function backtrack(current, remaining) {
    if (remaining.length === 0) {
      var key = current.join('\u0000');
      if (!seenKeys[key]) {
        seenKeys[key] = true;
        result.push(current.slice());
      }
      return;
    }

    for (var i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      var nextRemaining = remaining.slice(0, i).concat(remaining.slice(i + 1));
      backtrack(current, nextRemaining);
      current.pop();
    }
  }

  if (words && words.length > 0) {
    backtrack([], words);
  }

  return result;
}

/**
 * Builds dash-separated and/or joined (no-dash) variations for configurable
 * word-order combinations (3-word, 2-word subsets, and/or 1-word individual variants).
 *
 * @param {string[]} activeKeywords
 * @param {Object=} options
 * @return {{ orderCount: number, variants: string[] }}
 */
function buildWordOrderVariants(activeKeywords, options) {
  var opts = options || {};
  var include3Words = opts.include3Words !== false;
  var include2Words = opts.include2Words !== false;
  var include1Word = opts.include1Word !== false;
  var includeDash = opts.includeDash !== false;
  var includeNoDash = opts.includeNoDash !== false;

  var allOrders = [];
  var seenOrderKeys = Object.create(null);

  function addOrderList(orderList) {
    for (var i = 0; i < orderList.length; i++) {
      var order = orderList[i];
      var key = order.join('\u0000');
      if (!seenOrderKeys[key]) {
        seenOrderKeys[key] = true;
        allOrders.push(order);
      }
    }
  }

  if (activeKeywords && activeKeywords.length > 0) {
    // 1. 3-word (full) permutations when 3+ keywords are active
    if (include3Words && activeKeywords.length >= 3) {
      addOrderList(permuteWords(activeKeywords));
    }

    // 2. 2-word permutations / subsets when 2+ keywords are active
    if (include2Words && activeKeywords.length >= 2) {
      if (activeKeywords.length === 2) {
        addOrderList(permuteWords(activeKeywords));
      } else {
        for (var i = 0; i < activeKeywords.length; i++) {
          for (var j = i + 1; j < activeKeywords.length; j++) {
            addOrderList(permuteWords([activeKeywords[i], activeKeywords[j]]));
          }
        }
      }
    }

    // 3. 1-word individual keyword variants (kw1, kw2, kw3)
    if (include1Word) {
      for (var s = 0; s < activeKeywords.length; s++) {
        addOrderList([[activeKeywords[s]]]);
      }
    }
  }

  var variants = [];
  var seen = Object.create(null);

  if (includeDash || includeNoDash) {
    for (var k = 0; k < allOrders.length; k++) {
      var order = allOrders[k];
      var pair = [];
      if (order.length === 1) {
        pair.push(order[0]);
      } else {
        if (includeDash) pair.push(order.join('-'));
        if (includeNoDash) pair.push(order.join(''));
      }

      for (var m = 0; m < pair.length; m++) {
        var candidate = pair[m];
        if (candidate && !seen[candidate]) {
          seen[candidate] = true;
          variants.push(candidate);
        }
      }
    }
  }

  return {
    orderCount: allOrders.length,
    variants: variants
  };
}

/**
 * Validates and sanitizes a single domain label + extension against RFC 1035:
 * - Only lowercase a-z, 0-9, and hyphen (-)
 * - No leading or trailing hyphens on any label
 * - Each label between 1 and 63 characters
 * - Total domain length <= 253 characters
 *
 * @param {string} pattern
 * @param {string} ext
 * @return {string|null}
 */
function validateRfc1035Domain(pattern, ext) {
  if (!pattern || !ext) return null;

  var cleanExt = String(ext).trim().toLowerCase();
  if (!cleanExt) return null;
  if (cleanExt.charAt(0) !== '.') {
    cleanExt = '.' + cleanExt;
  }

  var extLabelsRaw = cleanExt.slice(1).split('.');
  if (extLabelsRaw.length === 0) return null;

  var sanitizedExtLabels = [];
  for (var i = 0; i < extLabelsRaw.length; i++) {
    var extLabel = extLabelsRaw[i].replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    if (!extLabel || extLabel.length > 63 || !/[a-z0-9]/.test(extLabel)) {
      return null;
    }
    sanitizedExtLabels.push(extLabel);
  }

  var patLabelsRaw = String(pattern).toLowerCase().split('.');
  var sanitizedPatLabels = [];
  for (var j = 0; j < patLabelsRaw.length; j++) {
    var cleanLabel = patLabelsRaw[j].replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    if (!cleanLabel || cleanLabel.length > 63) {
      return null;
    }
    sanitizedPatLabels.push(cleanLabel);
  }

  var finalDomain = sanitizedPatLabels.join('.') + '.' + sanitizedExtLabels.join('.');
  if (finalDomain.length > 253) {
    return null;
  }

  return finalDomain;
}

/**
 * Expands localized permutation formula placeholders ([primary], [secondary],
 * [tertiary], [vowel], [consonant], [number], [dash], and legacy/localized aliases).
 *
 * @param {string} formula
 * @param {string} kw1
 * @param {string} kw2
 * @param {string} kw3
 * @return {string[]}
 */
function expandFormulaPatterns(formula, kw1, kw2, kw3) {
  var trimmed = String(formula || '').trim();
  if (!trimmed) return [];

  var placeholderMap = {
    '[primary]': [kw1],
    '[keyword]': [kw1],
    '[palabra_clave]': [kw1],
    '[palavra_chave]': [kw1],
    '[mot_cle]': [kw1],
    '[schlüsselwort]': [kw1],
    '[ключевое_слово]': [kw1],
    '[キーワード]': [kw1],
    '[secondary]': [kw2],
    '[keyword2]': [kw2],
    '[palabra_clave2]': [kw2],
    '[palavra_chave2]': [kw2],
    '[mot_cle2]': [kw2],
    '[schlüsselwort2]': [kw2],
    '[ключевое_слово2]': [kw2],
    '[キーワード2]': [kw2],
    '[tertiary]': [kw3],
    '[keyword3]': [kw3],
    '[palabra_clave3]': [kw3],
    '[palavra_chave3]': [kw3],
    '[mot_cle3]': [kw3],
    '[schlüsselwort3]': [kw3],
    '[ключевое_слово3]': [kw3],
    '[キーワード3]': [kw3],
    '[vokal]': PERM_VOWELS,
    '[vowel]': PERM_VOWELS,
    '[vocal]': PERM_VOWELS,
    '[vogal]': PERM_VOWELS,
    '[voyelle]': PERM_VOWELS,
    '[гласная]': PERM_VOWELS,
    '[母音]': PERM_VOWELS,
    '[konsonan]': PERM_CONSONANTS,
    '[consonant]': PERM_CONSONANTS,
    '[consonante]': PERM_CONSONANTS,
    '[consoante]': PERM_CONSONANTS,
    '[consonne]': PERM_CONSONANTS,
    '[konsonant]': PERM_CONSONANTS,
    '[согласная]': PERM_CONSONANTS,
    '[子音]': PERM_CONSONANTS,
    '[angka]': PERM_NUMBERS,
    '[number]': PERM_NUMBERS,
    '[número]': PERM_NUMBERS,
    '[nombre]': PERM_NUMBERS,
    '[nummer]': PERM_NUMBERS,
    '[цифра]': PERM_NUMBERS,
    '[数字]': PERM_NUMBERS,
    '[dash]': PERM_DASHES
  };

  var keys = Object.keys(placeholderMap);

  function expand(currentFormula) {
    var matchIdx = -1;
    var matchedKey = null;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var idx = currentFormula.indexOf(key);
      if (idx !== -1 && (matchIdx === -1 || idx < matchIdx)) {
        matchIdx = idx;
        matchedKey = key;
      }
    }

    if (matchedKey === null) {
      return [currentFormula.replace(/\+/g, '').replace(/\s+/g, '')];
    }

    var results = [];
    var values = placeholderMap[matchedKey];
    for (var j = 0; j < values.length; j++) {
      var nextFormula = currentFormula.replace(matchedKey, values[j]);
      var expanded = expand(nextFormula);
      for (var k = 0; k < expanded.length; k++) {
        results.push(expanded[k]);
      }
    }
    return results;
  }

  return expand(trimmed);
}

/**
 * Server-side Domain Permutation & RFC 1035 Validation endpoint for Google Apps Script.
 * Callable from frontend via google.script.run.generateDomainPermutations(payload).
 *
 * @param {Object} payload
 * @return {Object}
 */
function generateDomainPermutations(payload) {
  var MAX_DOMAINS = 200;

  var data = payload || {};
  var rawLang = String(data.lang || 'en').toLowerCase().trim();
  var lang = SUPPORTED_LANGUAGES.indexOf(rawLang) !== -1 ? rawLang : 'en';

  var kw1 = sanitizeKeywordToken(data.kw || '');
  var kw2 = sanitizeKeywordToken(data.kw2 || '');
  var kw3 = sanitizeKeywordToken(data.kw3 || '');

  var activeKeywords = [kw1, kw2, kw3].filter(function(item) {
    return Boolean(item);
  });

  var rawExts = data.extensions;
  var extCandidates = [];
  if (Array.isArray(rawExts)) {
    extCandidates = rawExts.map(function(e) { return String(e).trim().toLowerCase(); }).filter(Boolean);
  } else {
    var extSource = String(rawExts || DEFAULT_EXTENSIONS_BY_LANG[lang] || '.com, .net, .io, .org');
    extCandidates = extSource.split(',').map(function(e) { return e.trim().toLowerCase(); }).filter(Boolean);
  }

  var extSeen = Object.create(null);
  var extList = [];
  for (var e = 0; e < extCandidates.length; e++) {
    var normalizedExt = extCandidates[e].charAt(0) === '.' ? extCandidates[e] : '.' + extCandidates[e];
    if (!extSeen[normalizedExt]) {
      extSeen[normalizedExt] = true;
      extList.push(normalizedExt);
    }
  }
  extSeen = null;

  var includeFullWordPermutations = data.includeFullWordPermutations !== false;
  var wordPermOptions = {
    include3Words: data.include3Words !== false,
    include2Words: data.include2Words !== false,
    include1Word: data.include1Word !== false,
    includeDash: data.includeDash !== false,
    includeNoDash: data.includeNoDash !== false
  };
  var formula = data.formula !== undefined ? String(data.formula).trim() : '';

  var rawPatterns = [];
  var patternSeen = Object.create(null);

  function pushPattern(pat) {
    if (pat && !patternSeen[pat]) {
      patternSeen[pat] = true;
      rawPatterns.push(pat);
    }
  }

  var wordOrderCount = 0;
  var wordVariantsCount = 0;

  if (includeFullWordPermutations && activeKeywords.length > 0) {
    var wordOrderResult = buildWordOrderVariants(activeKeywords, wordPermOptions);
    wordOrderCount = wordOrderResult.orderCount;
    wordVariantsCount = wordOrderResult.variants.length;
    for (var i = 0; i < wordOrderResult.variants.length; i++) {
      pushPattern(wordOrderResult.variants[i]);
    }
  }

  if (formula) {
    var formulaPatterns = expandFormulaPatterns(formula, kw1, kw2, kw3);
    for (var j = 0; j < formulaPatterns.length; j++) {
      pushPattern(formulaPatterns[j]);
    }
  }

  patternSeen = null;

  var domains = [];
  var domainSeen = Object.create(null);

  for (var p = 0; p < rawPatterns.length; p++) {
    for (var eIdx = 0; eIdx < extList.length; eIdx++) {
      var validDomain = validateRfc1035Domain(rawPatterns[p], extList[eIdx]);
      if (validDomain && !domainSeen[validDomain]) {
        domainSeen[validDomain] = true;
        domains.push(validDomain);
      }
    }
  }

  domainSeen = null;

  // Always prioritize shortest domains first in the response
  domains.sort(function(a, b) {
    return a.length - b.length;
  });

  var totalGenerated = domains.length;
  var truncated = false;

  if (domains.length > MAX_DOMAINS) {
    truncated = true;
    domains = domains.slice(0, MAX_DOMAINS);
  }

  return {
    ok: true,
    lang: lang,
    activeKeywords: activeKeywords,
    wordOrderCount: wordOrderCount,
    wordVariantsCount: wordVariantsCount,
    domains: domains,
    total: domains.length,
    totalGenerated: totalGenerated,
    maxDomains: MAX_DOMAINS,
    truncated: truncated
  };
}

/**
 * Returns supported language codes and default extensions.
 *
 * @return {Object}
 */
function getSupportedLanguages() {
  return {
    languages: SUPPORTED_LANGUAGES.slice(),
    defaultExtensions: DEFAULT_EXTENSIONS_BY_LANG
  };
}
