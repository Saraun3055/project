const crypto = require('crypto');
const { Buffer } = require('buffer');

/**
 * Authentication helpers for restaurant owner accounts.
 *
 * Passwords are stored as salted PBKDF2-HMAC-SHA256 digests in the format:
 *   pbkdf2$sha256$<iterations>$<saltHex>$<hashHex>
 *
 * Sessions are signed with a real HS256 JWT (header.payload.signature) so the
 * restaurant dashboard can authenticate every request with a bearer token.
 */

const PBKDF2_ITERATIONS = 120000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha256';

const JWT_ALGORITHM = 'HS256';
const JWT_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const loadSecret = () => process.env.RESTAURANT_JWT_SECRET || 'foodexpress-dev-restaurant-secret';

const base64url = (input) => Buffer.from(input).toString('base64url');

const signJwt = (payload, options = {}) => {
  const secret = options.secret || loadSecret();
  const issuedAt = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: options.iat ?? issuedAt,
    exp: options.exp ?? issuedAt + (options.ttlSeconds ?? JWT_TTL_SECONDS),
  };

  const header = base64url(JSON.stringify({ alg: JWT_ALGORITHM, typ: 'JWT' }));
  const claims = base64url(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${claims}`)
    .digest('base64url');

  return { token: `${header}.${claims}.${signature}`, payload: body };
};

const verifyJwt = (token, options = {}) => {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, claims, signature] = parts;
  const secret = options.secret || loadSecret();
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${claims}`)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return null;
  }
  return payload;
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const derived = crypto
    .pbkdf2Sync(String(password), salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString('hex');
  return `pbkdf2$${PBKDF2_DIGEST}$${PBKDF2_ITERATIONS}$${salt}$${derived}`;
};

const verifyPassword = (password, storedHash) => {
  if (typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2') return false;

  const [, digest, iterationsText, salt, expected] = parts;
  const iterations = Number(iterationsText);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const derived = crypto
    .pbkdf2Sync(String(password), salt, iterations, expected.length / 2, digest)
    .toString('hex');

  const derivedBuffer = Buffer.from(derived);
  const expectedBuffer = Buffer.from(expected);
  if (derivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, expectedBuffer);
};

const extractBearerToken = (req) => {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  if (typeof header !== 'string' || !header.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length ? token : null;
};

/**
 * Express middleware guarding restaurant-owner endpoints. Attaches the decoded
 * claims to `req.restaurant` and resolves the live restaurant record so routes
 * never trust client supplied restaurant ids.
 */
const requireRestaurant = (loadRestaurants) => async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing restaurant session token.' });
  }

  const claims = verifyJwt(token);
  if (!claims) {
    return res.status(401).json({ error: 'Session token is invalid or has expired.' });
  }

  if (claims.role !== 'restaurant' || !claims.restaurantId) {
    return res.status(403).json({ error: 'This account cannot access the restaurant dashboard.' });
  }

  try {
    const restaurants = await loadRestaurants();
    const restaurant = restaurants.find((item) => item.id === claims.restaurantId);
    if (!restaurant) {
      return res.status(401).json({ error: 'Restaurant account no longer exists.' });
    }
    req.restaurant = restaurant;
    req.restaurantClaims = claims;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Redacts owner credentials before a restaurant record is sent to a customer.
 * Owner login email and the Stripe Connect account id are never public.
 */
const toPublicRestaurant = (restaurant) => {
  if (!restaurant) return null;
  const {
    password_hash: _hash,
    email: _email,
    stripe_account_id: _stripe,
    ...safe
  } = restaurant;
  return safe;
};

/**
 * The signed-in owner's own view: includes their login email and Stripe Connect
 * account, but still never the password hash.
 */
const toOwnerRestaurant = (restaurant) => {
  if (!restaurant) return null;
  const { password_hash: _hash, ...safe } = restaurant;
  return safe;
};

module.exports = {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  extractBearerToken,
  requireRestaurant,
  toPublicRestaurant,
  toOwnerRestaurant,
  JWT_TTL_SECONDS,
};
