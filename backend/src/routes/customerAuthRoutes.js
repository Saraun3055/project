const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { requireCustomer } = require('../middleware/requireCustomer');
const { toProfile } = require('../utils/serialize');

const router = express.Router();

const BCRYPT_ROUNDS = 10;
const JWT_TTL = '12h';

const secret = () => process.env.CUSTOMER_JWT_SECRET || 'foodexpress-dev-customer-secret';

const issueToken = (customer) =>
  jwt.sign(
    {
      sub: customer.id,
      email: customer.email,
      role: customer.role || 'customer',
    },
    secret(),
    { expiresIn: JWT_TTL }
  );

const makeCustomerId = () => `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * POST /api/auth/register
 * Creates a customer account with a bcrypt hashed password and hands back a
 * signed JWT so the client can call the protected routes immediately.
 */
router.post('/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const phone = String(req.body?.phone ?? '').trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const customer = await Customer.create({
      id: makeCustomerId(),
      name,
      email,
      phone,
      passwordHash,
      role: 'customer',
      address: '',
      addresses: [],
    });

    return res.status(201).json({
      token: issueToken(customer),
      expiresInSeconds: 60 * 60 * 12,
      customer: toProfile(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    return next(error);
  }
});

/**
 * POST /api/auth/login
 * One generic failure message so the endpoint never reveals which emails exist.
 */
router.post('/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    return res.status(200).json({
      token: issueToken(customer),
      expiresInSeconds: 60 * 60 * 12,
      customer: toProfile(customer),
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/auth/me
 * Rehydrates the signed-in customer on app start.
 */
router.get('/auth/me', requireCustomer, (req, res) => {
  res.status(200).json({ customer: toProfile(req.customer) });
});

module.exports = router;
