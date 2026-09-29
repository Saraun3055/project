/**
 * Seeds restaurant owner accounts (email, password hash, Stripe Connect account)
 * onto the existing `restaurants.json` catalogue.
 *
 * Safe to re-run: restaurants that already have credentials are left untouched.
 * Demo password for every seeded account: Passw0rd!
 *
 *   node scripts/seedRestaurantAccounts.js
 */
const path = require('path');
const fs = require('fs').promises;
const { hashPassword } = require('../src/utils/authUtils');

const DATA_FILE = path.join(__dirname, '..', 'data', 'restaurants.json');
const DEMO_PASSWORD = 'Passw0rd!';

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 14);

// Approximate Bengaluru coordinates so the delivery simulator can build a route.
const COORDINATES = {
  rest1: { lat: 12.9784, lng: 77.6408 },
  rest2: { lat: 12.9352, lng: 77.6245 },
  rest3: { lat: 12.9116, lng: 77.6474 },
  rest4: { lat: 12.9698, lng: 77.7500 },
  rest5: { lat: 12.9719, lng: 77.6412 },
  rest6: { lat: 12.9250, lng: 77.5186 },
  rest7: { lat: 12.9756, lng: 77.6068 },
  rest8: { lat: 12.9698, lng: 77.7060 },
  rest9: { lat: 12.9352, lng: 77.6245 },
};

// Per-restaurant commission, prep time and payout behaviour.
const PROFILES = {
  rest1: { commissionRate: 0.12, prepTimeMinutes: 22 },
  rest2: { commissionRate: 0.1, prepTimeMinutes: 15 },
  rest3: { commissionRate: 0.12, prepTimeMinutes: 18 },
  rest4: { commissionRate: 0.1, prepTimeMinutes: 14 },
  rest5: { commissionRate: 0.14, prepTimeMinutes: 25 },
  rest6: { commissionRate: 0.12, prepTimeMinutes: 20 },
  rest7: { commissionRate: 0.1, prepTimeMinutes: 12 },
  rest8: { commissionRate: 0.11, prepTimeMinutes: 14 },
  rest9: { commissionRate: 0.11, prepTimeMinutes: 13 },
};

const main = async () => {
  const restaurants = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));

  const updated = restaurants.map((restaurant) => {
    if (restaurant.email && restaurant.password_hash) {
      return restaurant;
    }
    const profile = PROFILES[restaurant.id] ?? { commissionRate: 0.12, prepTimeMinutes: 18 };
    const handle = slug(restaurant.name);
    return {
      ...restaurant,
      email: `owner@${handle}.in`,
      password_hash: hashPassword(DEMO_PASSWORD),
      // Stripe Connect destination account. `acct_...` ids cannot be created
      // without live keys, so the demo uses a deterministic placeholder that
      // the payment service maps to a real account id once STRIPE_SECRET_KEY
      // is configured.
      stripe_account_id: `acct_demo_${handle}`,
      commission_rate: profile.commissionRate,
      default_prep_minutes: profile.prepTimeMinutes,
      is_open: true,
      phone: `+91 80 4${String(restaurants.indexOf(restaurant) + 100).slice(-3)} ${String(1000 + restaurants.indexOf(restaurant) * 7).slice(0, 4)}`,
      address: restaurant.location ?? 'Bengaluru, Karnataka',
      coordinates: COORDINATES[restaurant.id] ?? { lat: 12.9716, lng: 77.5946 },
    };
  });

  await fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2), 'utf8');
  console.log(`Seeded ${updated.length} restaurant accounts. Demo password: ${DEMO_PASSWORD}`);
  updated.forEach((r) => console.log(`  ${r.id}  ${r.email}  ${r.stripe_account_id}`));
};

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
