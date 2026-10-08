const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { extractBearerToken } = require('../utils/authUtils');

const secret = () => process.env.CUSTOMER_JWT_SECRET || 'foodexpress-dev-customer-secret';

/** Decodes a customer token without hitting the database. */
const verifyCustomerToken = (token) => {
  try {
    const claims = jwt.verify(token, secret());
    if (claims.role !== 'customer' && claims.role !== 'admin') return null;
    return claims;
  } catch {
    return null;
  }
};

/**
 * Verifies a customer bearer token and attaches the live Customer document to
 * `req.customer`. Routes read `req.customer.id` (the legacy string id) rather
 * than trusting anything the client sends.
 */
const requireCustomer = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing customer session token.' });
    }

    const claims = verifyCustomerToken(token);
    if (!claims) {
      return res.status(401).json({ error: 'Session token is invalid or has expired.' });
    }

    const customer = await Customer.findOne({ $or: [{ id: claims.sub }, { email: claims.email }] });
    if (!customer) {
      return res.status(401).json({ error: 'Customer account no longer exists.' });
    }

    req.customer = customer;
    req.customerClaims = claims;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Same as `requireCustomer` but only resolves the caller when a token is
 * actually present. Missing tokens fall through so legacy endpoints that
 * accept a `customerId` in the body keep working; a *bad* token is still
 * rejected rather than silently downgraded to anonymous.
 */
const optionalCustomer = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next();

    const claims = verifyCustomerToken(token);
    if (!claims) {
      return res.status(401).json({ error: 'Session token is invalid or has expired.' });
    }

    const customer = await Customer.findOne({ $or: [{ id: claims.sub }, { email: claims.email }] });
    if (!customer) {
      return res.status(401).json({ error: 'Customer account no longer exists.' });
    }

    req.customer = customer;
    req.customerClaims = claims;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Same as `requireCustomer` but additionally requires the `admin` role, used
 * by the dish / category CRUD endpoints.
 */
const requireAdmin = (req, res, next) => {
  const run = () => {
    if (!req.customer || req.customer.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access is required.' });
    }
    return next();
  };

  if (req.customer) return run();
  return requireCustomer(req, res, run);
};

module.exports = { requireCustomer, optionalCustomer, requireAdmin, verifyCustomerToken };
