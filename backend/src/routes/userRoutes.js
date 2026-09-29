const express = require('express');
const { readProfiles, writeProfiles } = require('../dataStore');

const router = express.Router();

router.get('/profile', async (req, res, next) => {
  try {
    const profiles = await readProfiles();
    const customerId = req.query.customerId;
    const email = String(req.query.email ?? '').trim().toLowerCase();
    const profile = customerId
      ? profiles.find((p) => p.id === customerId)
      : email
        ? profiles.find((p) => String(p.email ?? '').trim().toLowerCase() === email)
        : profiles[0];
    res.status(200).json({ profile: profile || null });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const profiles = await readProfiles();
    const body = req.body || {};
    const customerId = body.customerId || profiles[0].id;
    const index = profiles.findIndex((p) => p.id === customerId);

    if (index === -1) {
      return res.status(404).json({ error: `Profile ${customerId} not found.` });
    }

    profiles[index] = {
      ...profiles[index],
      name: body.name ?? profiles[index].name,
      email: body.email ?? profiles[index].email,
      phone: body.phone ?? profiles[index].phone,
      address: body.address ?? profiles[index].address,
    };

    await writeProfiles(profiles);
    res.status(200).json({ profile: profiles[index] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;