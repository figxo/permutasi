const MAX_LOGGED_DOMAIN_LENGTH = 25;
const DOMAIN_HOSTNAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

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

function extractExtension(domain) {
  const dotIdx = domain.indexOf('.');
  return dotIdx > 0 ? domain.slice(dotIdx) : '';
}

async function ensureAvailableDomainsSchema(db) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await db.batch([
        db.prepare(`
          CREATE TABLE IF NOT EXISTS available_domains (
            domain TEXT PRIMARY KEY,
            extension TEXT NOT NULL,
            char_length INTEGER NOT NULL,
            check_method TEXT NOT NULL,
            check_source TEXT NOT NULL,
            checked_at INTEGER NOT NULL,
            checked_at_iso TEXT NOT NULL
          )
        `),
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
  const rawMethod = String(body.checkMethod || body.method || 'RDAP').trim().toUpperCase();
  const checkMethod = rawMethod === 'NS' ? 'NS' : 'RDAP';
  const rawSource = String(body.checkSource || body.source || 'manual').trim().toLowerCase();
  const checkSource = rawSource === 'auto' ? 'auto' : 'manual';

  const parsedCheckedAt = Number(body.checkedAt);
  const checkedAt = Number.isFinite(parsedCheckedAt) && parsedCheckedAt > 0
    ? Math.floor(parsedCheckedAt)
    : Date.now();
  const checkedAtIso = new Date(checkedAt).toISOString();

  try {
    await ensureAvailableDomainsSchema(env.DB);

    await env.DB.prepare(`
      INSERT INTO available_domains (
        domain,
        extension,
        char_length,
        check_method,
        check_source,
        checked_at,
        checked_at_iso
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(domain) DO UPDATE SET
        extension = excluded.extension,
        char_length = excluded.char_length,
        check_method = excluded.check_method,
        check_source = excluded.check_source,
        checked_at = excluded.checked_at,
        checked_at_iso = excluded.checked_at_iso
    `)
      .bind(domain, extension, charLength, checkMethod, checkSource, checkedAt, checkedAtIso)
      .run();

    return jsonResponse({
      ok: true,
      logged: true,
      domain,
      extension,
      charLength,
      checkMethod,
      checkSource,
      checkedAt,
      checkedAtIso
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
