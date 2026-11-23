const MAX_LOGGED_DOMAIN_LENGTH = 25;
const DOMAIN_HOSTNAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const SUPPORTED_LANGS = new Set(['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja']);

const MULTI_PART_EXTENSIONS = [
  '.web.id', '.my.id', '.co.id', '.biz.id', '.or.id', '.ac.id', '.sch.id', '.net.id',
  '.com.br', '.net.br', '.org.br',
  '.co.jp', '.ne.jp', '.or.jp', '.ac.jp',
  '.co.uk', '.org.uk', '.me.uk',
  '.com.au', '.net.au', '.org.au',
  '.co.nz', '.com.es', '.org.es', '.com.mx', '.com.sg', '.com.my'
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

const CCTLD_FIT_SPECS = {
  '.id': { base: 84, targetLang: 'id', alignBonus: 10 },
  '.co.id': { base: 80, targetLang: 'id', alignBonus: 10 },
  '.biz.id': { base: 80, targetLang: 'id', alignBonus: 10 },
  '.web.id': { base: 78, targetLang: 'id', alignBonus: 10 },
  '.my.id': { base: 78, targetLang: 'id', alignBonus: 10 },
  '.uk': { base: 82, targetLang: 'en', alignBonus: 6 },
  '.co.uk': { base: 82, targetLang: 'en', alignBonus: 6 },
  '.us': { base: 82, targetLang: 'en', alignBonus: 6 },
  '.ca': { base: 82, targetLang: 'en', alignBonus: 6 },
  '.au': { base: 82, targetLang: 'en', alignBonus: 6 },
  '.es': { base: 80, targetLang: 'es', alignBonus: 10 },
  '.com.es': { base: 80, targetLang: 'es', alignBonus: 10 },
  '.mx': { base: 80, targetLang: 'es', alignBonus: 10 },
  '.pt': { base: 80, targetLang: 'pt', alignBonus: 10 },
  '.com.br': { base: 80, targetLang: 'pt', alignBonus: 10 },
  '.br': { base: 80, targetLang: 'pt', alignBonus: 10 },
  '.fr': { base: 80, targetLang: 'fr', alignBonus: 10 },
  '.de': { base: 80, targetLang: 'de', alignBonus: 10 },
  '.ru': { base: 80, targetLang: 'ru', alignBonus: 10 },
  '.jp': { base: 80, targetLang: 'ja', alignBonus: 10 },
  '.co.jp': { base: 80, targetLang: 'ja', alignBonus: 10 }
};

const SCORE_COLUMNS = [
  'brandability_score',
  'structure_length_score',
  'extension_lang_fit_score',
  'character_cleanliness_score',
  'niche_clarity_score',
  'overall_heuristic_score',
  'scored_at'
];

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

function computeDomainScores(rawDomain, explicitExt, rawLang) {
  const { sld, ext } = splitDomainSldAndExt(rawDomain, explicitExt);
  const uiLang = normalizeLang(rawLang);
  const sldLen = sld.length;
  const alphaOnly = sld.replace(/[^a-z]/g, '');
  const digitsCount = (sld.match(/[0-9]/g) || []).length;
  const hyphenCount = (sld.match(/-/g) || []).length;
  const isVowelChar = (ch) => ch === 'a' || ch === 'e' || ch === 'i' || ch === 'o' || ch === 'u';

  // 1. Brandability Score (0-100): phonetic pronouncability & rhythm on alphaOnly (no digit/hyphen double penalty)
  let brandability = 60;
  if (alphaOnly.length === 0) {
    brandability = 35;
  } else if (alphaOnly.length === 1) {
    brandability = 55;
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
      if (v) {
        vowelCount++;
        curVowelRun++;
        curConsRun = 0;
        if (curVowelRun > maxVowelRun) maxVowelRun = curVowelRun;
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
    if (vRatio >= 0.25 && vRatio <= 0.58) {
      brandability += 18;
    } else if ((vRatio >= 0.15 && vRatio < 0.25) || (vRatio > 0.58 && vRatio <= 0.72)) {
      brandability += 8;
    } else if (vowelCount === 0 && yCount === 0) {
      brandability -= alphaOnly.length <= 3 ? 10 : 26;
    } else {
      brandability -= 10;
    }

    if (maxConsRun <= 2) {
      brandability += 10;
    } else if (maxConsRun === 3) {
      brandability -= 6;
    } else {
      brandability -= 18;
    }

    if (maxVowelRun >= 3) brandability -= 10;

    const transitionRatio = transitions / Math.max(1, alphaOnly.length - 1);
    if (transitionRatio >= 0.55) brandability += 10;
    else if (transitionRatio >= 0.35) brandability += 4;

    const qxzCount = (alphaOnly.match(/[qxz]/g) || []).length;
    const kCount = (alphaOnly.match(/k/g) || []).length;
    brandability -= Math.min(14, qxzCount * 4);
    brandability -= Math.min(6, kCount * 2);

    if (alphaOnly.length >= 3 && alphaOnly.length <= 8) {
      brandability += 8;
    }
  }
  brandability = clampScore(brandability, 50);

  // 2. Structure & Length Score (0-100): focused on SLD length & moderate word-split structure
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

  // Analyze SLD stems & language once for both Extension/Lang Fit & Niche Clarity
  const stemAnalysis = analyzeSldStemsAndLang(sld);

  // 3. Extension & Language Fit Score (0-100): .com universal top + SLD-first ccTLD alignment
  const extLower = ext.toLowerCase();
  let extFit = 68;
  if (extLower === '.com') extFit = 96;
  else if (extLower === '.ai') extFit = 90;
  else if (extLower === '.io') extFit = 88;
  else if (extLower === '.app' || extLower === '.dev') extFit = 86;
  else if (extLower === '.net') extFit = 86;
  else if (extLower === '.org' || extLower === '.co') extFit = 84;
  else if (CCTLD_FIT_SPECS[extLower]) {
    const spec = CCTLD_FIT_SPECS[extLower];
    if (stemAnalysis.detectedLang === spec.targetLang) {
      extFit = spec.base + spec.alignBonus;
    } else if (stemAnalysis.detectedLang !== null && stemAnalysis.detectedLang !== spec.targetLang) {
      extFit = spec.base - 4;
    } else {
      // Pure brandable/neutral SLD: gentle UI language fallback without harsh swing
      extFit = uiLang === spec.targetLang ? spec.base + 4 : spec.base;
    }
  } else if (extLower === '.shop' || extLower === '.store' || extLower === '.tech' || extLower === '.cloud') {
    extFit = 78;
  } else if (extLower === '.xyz' || extLower === '.online' || extLower === '.site' || extLower === '.me') {
    extFit = 76;
  } else if (extLower === '.biz' || extLower === '.info') {
    extFit = 68;
  }
  extFit = clampScore(extFit, 68);

  // 4. Character Cleanliness Score (0-100): primary home for digit/hyphen/repetition penalties
  let cleanliness = 100;
  if (digitsCount > 0) cleanliness -= 18 + Math.min(24, (digitsCount - 1) * 5);
  if (hyphenCount > 0) cleanliness -= 16 + Math.min(24, (hyphenCount - 1) * 12);
  if (/(.)\1{2,}/.test(sld)) cleanliness -= 14;
  if (/(kk|qq|xx|zz)/.test(sld)) cleanliness -= 6;
  cleanliness = clampScore(cleanliness, 70);

  // 5. Niche Clarity Score (0-100): exact token priority, strict compound boundary, fair pure-brand baseline
  let nicheClarity = 64;
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
  } else if (alphaOnly.length >= 3 && alphaOnly.length <= 9 && brandability >= 72) {
    nicheClarity = 72;
  } else if (digitsCount === 0 && hyphenCount === 0) {
    nicheClarity = 64;
  } else {
    nicheClarity = 58;
  }
  nicheClarity = clampScore(nicheClarity, 58);

  // 6. Overall Heuristic Score (0-100)
  const overall = clampScore(
    brandability * 0.28 +
    structure * 0.22 +
    extFit * 0.18 +
    cleanliness * 0.18 +
    nicheClarity * 0.14,
    50
  );

  return {
    brandability_score: brandability,
    structure_length_score: structure,
    extension_lang_fit_score: extFit,
    character_cleanliness_score: cleanliness,
    niche_clarity_score: nicheClarity,
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
          brandability_score INTEGER,
          structure_length_score INTEGER,
          extension_lang_fit_score INTEGER,
          character_cleanliness_score INTEGER,
          niche_clarity_score INTEGER,
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
                  brandability_score INTEGER,
                  structure_length_score INTEGER,
                  extension_lang_fit_score INTEGER,
                  character_cleanliness_score INTEGER,
                  niche_clarity_score INTEGER,
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
            ['domain', 'extension', 'char_length', 'lang', 'check_method', 'check_source', 'checked_at', ...SCORE_COLUMNS]
              .forEach((name) => colNames.add(name));
          }
        }
        for (const scoreCol of SCORE_COLUMNS) {
          if (!colNames.has(scoreCol)) {
            await db.prepare(`ALTER TABLE available_domains ADD COLUMN ${scoreCol} INTEGER`).run();
          }
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

  const computedScores = computeDomainScores(domain, extension, lang);
  const clientScores = (body.scores && typeof body.scores === 'object') ? body.scores : {};
  const brandabilityScore = clampScore(clientScores.brandability_score, computedScores.brandability_score);
  const structureLengthScore = clampScore(clientScores.structure_length_score, computedScores.structure_length_score);
  const extensionLangFitScore = clampScore(clientScores.extension_lang_fit_score, computedScores.extension_lang_fit_score);
  const characterCleanlinessScore = clampScore(clientScores.character_cleanliness_score, computedScores.character_cleanliness_score);
  const nicheClarityScore = clampScore(clientScores.niche_clarity_score, computedScores.niche_clarity_score);
  const overallHeuristicScore = clampScore(
    brandabilityScore * 0.28 +
    structureLengthScore * 0.22 +
    extensionLangFitScore * 0.18 +
    characterCleanlinessScore * 0.18 +
    nicheClarityScore * 0.14,
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
        brandability_score,
        structure_length_score,
        extension_lang_fit_score,
        character_cleanliness_score,
        niche_clarity_score,
        overall_heuristic_score,
        scored_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
      ON CONFLICT(domain) DO UPDATE SET
        extension = excluded.extension,
        char_length = excluded.char_length,
        lang = excluded.lang,
        check_method = excluded.check_method,
        check_source = excluded.check_source,
        checked_at = excluded.checked_at,
        brandability_score = excluded.brandability_score,
        structure_length_score = excluded.structure_length_score,
        extension_lang_fit_score = excluded.extension_lang_fit_score,
        character_cleanliness_score = excluded.character_cleanliness_score,
        niche_clarity_score = excluded.niche_clarity_score,
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
        brandabilityScore,
        structureLengthScore,
        extensionLangFitScore,
        characterCleanlinessScore,
        nicheClarityScore,
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
        brandability_score: brandabilityScore,
        structure_length_score: structureLengthScore,
        extension_lang_fit_score: extensionLangFitScore,
        character_cleanliness_score: characterCleanlinessScore,
        niche_clarity_score: nicheClarityScore,
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
