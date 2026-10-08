const express = require('express');
const { requireCustomer } = require('../middleware/requireCustomer');
const { toProfile } = require('../utils/serialize');

const router = express.Router();

/**
 * Profile and saved addresses for the signed-in customer. Identity always
 * comes from the bearer token - nothing here trusts a client supplied id.
 */

router.get('/profile', requireCustomer, async (req, res, next) => {
  try {
    res.status(200).json({ profile: toProfile(req.customer) });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', requireCustomer, async (req, res, next) => {
  try {
    const body = req.body || {};
    const customer = req.customer;

    if (body.name !== undefined) customer.name = body.name;
    if (body.email !== undefined) customer.email = body.email;
    if (body.phone !== undefined) customer.phone = body.phone;
    if (body.address !== undefined) customer.address = body.address;
    if (body.preferences !== undefined) customer.preferences = body.preferences;

    await customer.save();
    res.status(200).json({ profile: toProfile(customer) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'That email is already in use.' });
    }
    next(error);
  }
});

router.get('/addresses', requireCustomer, async (req, res, next) => {
  try {
    res.status(200).json({ addresses: req.customer.addresses || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/addresses', requireCustomer, async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.line1) {
      return res.status(400).json({ error: 'line1 is required.' });
    }

    const address = {
      label: body.label || 'Home',
      line1: body.line1,
      city: body.city || '',
      pincode: body.pincode || '',
      isDefault: Boolean(body.isDefault),
    };

    if (address.isDefault) {
      req.customer.addresses.forEach((item) => {
        item.isDefault = false;
      });
    }
    req.customer.addresses.push(address);
    await req.customer.save();

    res.status(201).json({ addresses: req.customer.addresses });
  } catch (error) {
    next(error);
  }
});

router.put('/addresses/:idx', requireCustomer, async (req, res, next) => {
  try {
    const index = Number(req.params.idx);
    if (!Number.isInteger(index) || index < 0 || index >= req.customer.addresses.length) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    const body = req.body || {};
    const current = req.customer.addresses[index];
    const next = {
      label: body.label ?? current.label,
      line1: body.line1 ?? current.line1,
      city: body.city ?? current.city,
      pincode: body.pincode ?? current.pincode,
      isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : current.isDefault,
    };

    if (next.isDefault) {
      req.customer.addresses.forEach((item, i) => {
        if (i !== index) item.isDefault = false;
      });
    }

    req.customer.addresses.set(index, next);
    await req.customer.save();

    res.status(200).json({ addresses: req.customer.addresses });
  } catch (error) {
    next(error);
  }
});

router.delete('/addresses/:idx', requireCustomer, async (req, res, next) => {
  try {
    const index = Number(req.params.idx);
    if (!Number.isInteger(index) || index < 0 || index >= req.customer.addresses.length) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    req.customer.addresses.splice(index, 1);
    await req.customer.save();

    res.status(200).json({ addresses: req.customer.addresses });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
