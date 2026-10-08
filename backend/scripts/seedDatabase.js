/**
 * Seeds MongoDB from the JSON files in `backend/data/`.
 *
 *   node scripts/seedDatabase.js           # upsert (keeps carts/favorites/orders)
 *   node scripts/seedDatabase.js --fresh   # drop every collection first
 *
 * The JSON files stay on disk as the reference copy of the original data set
 * and as the source for re-seeding.
 */
require('dotenv').config();

const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { connect, disconnect } = require('../src/db');
const { readJsonFile } = require('../src/dataStore');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEMO_PASSWORD = 'Passw0rd!';
const BCRYPT_ROUNDS = 10;

const MODELS = {
  customers: require('../src/models/Customer'),
  dishes: require('../src/models/Dish'),
  categories: require('../src/models/Category'),
  restaurants: require('../src/models/Restaurant'),
  carts: require('../src/models/Cart'),
  favorites: require('../src/models/Favorite'),
  orders: require('../src/models/Order'),
  transactions: require('../src/models/Transaction'),
  feedbacks: require('../src/models/Feedback'),
};

const load = (file) => readJsonFile(file).catch(() => null);

const CATEGORY_EMOJI = {
  Indian: '🍛',
  Chinese: '🍜',
  Italian: '🍕',
  'Fast Food': '🍔',
  Desserts: '🍰',
};

const buildDishes = (dishes) =>
  (dishes || []).map((dish) => ({
    ...dish,
    healthMeter: {
      score: dish.healthMeterScore ?? 60,
      calories: dish.calories ?? null,
      protein: dish.protein ?? null,
      carbs: dish.carbs ?? null,
      fat: dish.fat ?? null,
      fiber: dish.fiber ?? null,
    },
  }));

const buildCategories = (categories) =>
  (categories || []).map((category, index) => ({
    id: category.id,
    name: category.name,
    emoji: category.emoji || CATEGORY_EMOJI[category.name] || '🍽️',
    displayOrder: category.displayOrder ?? index + 1,
  }));

const buildCustomers = async (profiles) => {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const customers = (profiles || []).map((profile) => ({
    id: profile.id,
    name: profile.name || '',
    email: profile.email,
    phone: profile.phone || '',
    passwordHash,
    role: 'customer',
    address: profile.address || '',
    addresses: profile.address
      ? [{ label: 'Home', line1: profile.address, city: '', pincode: '', isDefault: true }]
      : [],
    preferences: profile.preferences || {},
  }));

  const adminExists = customers.some((customer) => customer.role === 'admin');
  if (!adminExists) {
    customers.push({
      id: 'admin1',
      name: 'FoodExpress Admin',
      email: 'admin@foodexpress.in',
      phone: '+91 90000 00000',
      passwordHash,
      role: 'admin',
      address: '',
      addresses: [],
      preferences: {},
    });
  }

  return customers;
};

const upsertMany = async (Model, docs, key) => {
  if (docs.length === 0) return 0;
  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { [key]: doc[key] },
      update: { $set: doc },
      upsert: true,
    },
  }));
  const result = await Model.bulkWrite(ops, { ordered: false });
  return result.upsertedCount + result.modifiedCount;
};

const main = async () => {
  const fresh = process.argv.includes('--fresh');

  await connect();

  if (fresh) {
    const db = mongoose.connection.db;
    const names = Object.values(MODELS).map((model) => model.collection.name);
    for (const name of names) {
      try {
        await db.dropCollection(name);
      } catch (error) {
        if (error.codeName !== 'NamespaceNotFound') throw error;
      }
    }
    console.log(`[Seed] Dropped collections: ${names.join(', ')}`);
  }

  const [dishes, categories, profiles, restaurants, orders, transactions, favorites] =
    await Promise.all([
      load('dishes.json'),
      load('categories.json'),
      load('profiles.json'),
      load('restaurants.json'),
      load('orders.json'),
      load('transactions.json'),
      load('favorites.json'),
    ]);

  const payload = {
    customers: await buildCustomers(profiles),
    dishes: buildDishes(dishes),
    categories: buildCategories(categories),
    restaurants: restaurants || [],
    orders: orders || [],
    transactions: transactions || [],
    favorites: favorites || [],
  };

  const counts = {};
  counts.customers = await upsertMany(MODELS.customers, payload.customers, 'id');
  counts.dishes = await upsertMany(MODELS.dishes, payload.dishes, 'id');
  counts.categories = await upsertMany(MODELS.categories, payload.categories, 'id');
  counts.restaurants = await upsertMany(MODELS.restaurants, payload.restaurants, 'id');
  counts.orders = await upsertMany(MODELS.orders, payload.orders, 'orderId');
  counts.transactions = await upsertMany(MODELS.transactions, payload.transactions, 'transactionId');
  counts.favorites = await upsertMany(MODELS.favorites, payload.favorites, 'dishId');

  // Carts and feedback start empty: they are created on first use.
  counts.carts = 0;
  counts.feedbacks = 0;

  console.log('\n[Seed] Inserted / touched documents per collection:');
  Object.entries(counts).forEach(([name, count]) => {
    console.log(`  ${name.padEnd(14)} ${count}`);
  });
  console.log('\n[Seed] Demo customer password: Passw0rd! (admin@foodexpress.in is an admin)');
  console.log(`[Seed] Data directory: ${DATA_DIR}`);

  await disconnect();
  console.log('[Seed] Done.');
};

main().catch(async (error) => {
  console.error('[Seed] Failed:', error);
  await disconnect().catch(() => {});
  process.exit(1);
});
