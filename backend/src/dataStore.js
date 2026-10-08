const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const readJsonFile = async (fileName) => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read ${fileName}`, error);
    throw new Error(`Failed to load ${fileName}`);
  }
};

const writeJsonFile = async (fileName, payload) => {
  try {
    await fs.writeFile(path.join(DATA_DIR, fileName), JSON.stringify(payload, null, 2), 'utf8');
  } catch (error) {
    console.error(`Failed to write ${fileName}`, error);
    throw new Error(`Failed to save ${fileName}`);
  }
};

const readJsonFileOrDefault = async (fileName, fallback) => {
  try {
    return await readJsonFile(fileName);
  } catch {
    return fallback;
  }
};

module.exports = {
  // Exposed for the seed script, which needs arbitrary access to `data/`.
  readJsonFile,
  readDishes: () => readJsonFile('dishes.json'),
  readCategories: () => readJsonFile('categories.json'),
  readRestaurants: () => readJsonFile('restaurants.json'),
  readProfiles: () => readJsonFile('profiles.json'),
  readPromotions: () => readJsonFile('promotions.json'),
  readCoupons: () => readJsonFile('coupons.json'),
  readCart: () => readJsonFile('cart.json'),
  // `orders.json` holds one record per restaurant. A single customer checkout
  // that spans several restaurants produces several records that share a
  // transactionId, which is what ties them back to one customer payment.
  readOrders: () => readJsonFileOrDefault('orders.json', []),
  readTransactions: () => readJsonFileOrDefault('transactions.json', []),
  readFavorites: () => readJsonFileOrDefault('favorites.json', []),
  writeCart: (cart) => writeJsonFile('cart.json', cart),
  writeOrders: (orders) => writeJsonFile('orders.json', orders),
  writeTransactions: (transactions) => writeJsonFile('transactions.json', transactions),
  writeRestaurants: (restaurants) => writeJsonFile('restaurants.json', restaurants),
  writeProfiles: (profiles) => writeJsonFile('profiles.json', profiles),
  writeFavorites: (favorites) => writeJsonFile('favorites.json', favorites),
};