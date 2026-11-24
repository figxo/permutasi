import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CLAIMED_AUTH_FILE = path.resolve(ROOT_DIR, '.admin-auth.json');

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET
  ? Buffer.from(process.env.ADMIN_SESSION_SECRET, 'utf8')
  : crypto.randomBytes(32);

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 10;

const failedAttemptsByIp = new Map();
const revokedTokenIds = new Set();

function readClaimedHash() {
  if (!CLAIMED_AUTH_FILE.startsWith(ROOT_DIR + path.sep)) {
    return null;
  }
  if (!fs.existsSync(CLAIMED_AUTH_FILE)) {
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(CLAIMED_AUTH_FILE, 'utf8'));
    if (data && typeof data.salt === 'string' && typeof data.hash === 'string') {
      return { salt: data.salt, hash: data.hash };
    }
  } catch {
    return null;
  }
  return null;
}

export function getAdminAuthState() {
  const envPass = String(process.env.ADMIN_PASSWORD || '').trim();
  if (envPass) {
    return { mode: 'env', configured: true, needsSetup: false };
  }
  const claimed = readClaimedHash();
  if (claimed) {
    return { mode: 'claimed', configured: true, needsSetup: false };
  }
  return { mode: 'unconfigured', configured: false, needsSetup: true };
}

export function verifyAdminPassword(candidate) {
  const password = String(candidate || '');
  if (!password) return false;

  const envPass = String(process.env.ADMIN_PASSWORD || '').trim();
  if (envPass) {
    const a = crypto.createHash('sha256').update(password).digest();
    const b = crypto.createHash('sha256').update(envPass).digest();
    return crypto.timingSafeEqual(a, b);
  }

  const claimed = readClaimedHash();
  if (!claimed) return false;
  try {
    const derived = crypto.scryptSync(password, claimed.salt, 64);
    const stored = Buffer.from(claimed.hash, 'hex');
    if (derived.length !== stored.length) return false;
    return crypto.timingSafeEqual(derived, stored);
  } catch {
    return false;
  }
}

export function claimInitialAdminPassword(newPassword) {
  const state = getAdminAuthState();
  if (!state.needsSetup) {
    return { ok: false, status: 409, error: 'Admin password is already configured.' };
  }
  const password = String(newPassword || '');
  if (password.length < 8 || password.length > 128) {
    return { ok: false, status: 400, error: 'Password must be between 8 and 128 characters.' };
  }
  if (!CLAIMED_AUTH_FILE.startsWith(ROOT_DIR + path.sep)) {
    return { ok: false, status: 500, error: 'Invalid credential store path.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  const payload = JSON.stringify({
    algorithm: 'scrypt',
    salt,
    hash,
    createdAt: new Date().toISOString()
  }, null, 2) + '\n';

  try {
    fs.writeFileSync(CLAIMED_AUTH_FILE, payload, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  } catch (err) {
    if (err && err.code === 'EEXIST') {
      return { ok: false, status: 409, error: 'Admin password was already claimed.' };
    }
    throw err;
  }
  return { ok: true };
}

export function issueSessionToken() {
  const jti = crypto.randomBytes(16).toString('hex');
  const payload = {
    sub: 'lexicon-admin',
    jti,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return {
    token: `${encoded}.${sig}`,
    expiresAt: payload.exp
  };
}

export function verifySessionToken(token) {
  const raw = String(token || '').trim();
  const dotIdx = raw.indexOf('.');
  if (dotIdx <= 0) return null;

  const encoded = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);
  if (!encoded || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload || payload.sub !== 'lexicon-admin' || typeof payload.exp !== 'number') {
      return null;
    }
    if (Date.now() > payload.exp) return null;
    if (payload.jti && revokedTokenIds.has(payload.jti)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function revokeSessionToken(token) {
  const payload = verifySessionToken(token);
  if (payload && payload.jti) {
    revokedTokenIds.add(payload.jti);
  }
}

export function checkLoginRateLimit(ip) {
  const key = String(ip || 'unknown');
  const now = Date.now();
  const entry = failedAttemptsByIp.get(key);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    return { allowed: true };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((RATE_WINDOW_MS - (now - entry.windowStart)) / 1000)
    };
  }
  return { allowed: true };
}

export function recordFailedLogin(ip) {
  const key = String(ip || 'unknown');
  const now = Date.now();
  const entry = failedAttemptsByIp.get(key);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    failedAttemptsByIp.set(key, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

export function clearFailedLogins(ip) {
  failedAttemptsByIp.delete(String(ip || 'unknown'));
}

export function requireAdminAuth(req, res, next) {
  const authHeader = String(req.headers.authorization || '');
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Unauthorized: Bearer token required.' });
  }
  const token = authHeader.slice(7).trim();
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'Unauthorized: Invalid or expired session.' });
  }
  req.adminSession = session;
  req.adminToken = token;
  return next();
}
