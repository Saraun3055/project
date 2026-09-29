/**
 * Expands the dish catalogue so every restaurant has a real, multi-category
 * menu. Existing dishes are never touched (order history references their ids),
 * new dishes are only appended when missing, so the script is idempotent.
 *
 *   node scripts/seedMenuExpansion.js
 */
const path = require('path');
const fs = require('fs').promises;

const DATA_DIR = path.join(__dirname, '..', 'data');
const readJson = async (file) => JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf8'));
const writeJson = async (file, payload) =>
  fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(payload, null, 2), 'utf8');

const IMG = {
  tandoori: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop',
  naan: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop',
  curry: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500&auto=format&fit=crop',
  kebab: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop',
  gulab: 'https://images.unsplash.com/photo-1601303516534-bf0b1eb8f3f1?w=500&auto=format&fit=crop',
  roll: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&auto=format&fit=crop',
  chaat: 'https://images.unsplash.com/photo-1589301773859-bb024d3ad558?w=500&auto=format&fit=crop',
  vada: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop',
  lassi: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop',
  friedrice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop',
  springroll: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop',
  momo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop',
  dimsum: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop',
  bun: 'https://images.unsplash.com/photo-1563245370-8b9c1b28e1b3?w=500&auto=format&fit=crop',
  soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&auto=format&fit=crop',
  garlicbread: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=500&auto=format&fit=crop',
  tiramisu: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop',
  risotto: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&auto=format&fit=crop',
  carbonara: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&auto=format&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop',
  wings: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500&auto=format&fit=crop',
  shake: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop',
  cake: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop',
  brownie: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop',
  sundae: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop',
  gelato: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop',
  pastry: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=500&auto=format&fit=crop',
  pannacotta: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop',
};

/** [restaurantId, name, category, cuisine, price, rating, spice, isVeg, health, image, description] */
const NEW_DISHES = [
  // ---- rest1 Mehfil Grand ------------------------------------------------
  ['rest1', 'Paneer Tikka', 'Starters', 'Indian', 289, 4.7, 'Medium', true, 76, IMG.tandoori,
    'Charred cottage cheese, peppers and onion marinated in hung curd and grilled over coals.'],
  ['rest1', 'Chicken Seekh Kebab', 'Starters', 'Indian', 319, 4.6, 'Mild', false, 62, IMG.kebab,
    'Minced chicken seekh skewers grilled with mint chutney and sliced onion rings.'],
  ['rest1', 'Garlic Naan', 'Breads', 'Indian', 69, 4.5, 'Mild', true, 58, IMG.naan,
    'Tandoor-baked naan brushed with garlic butter and fresh coriander.'],
  ['rest1', 'Hyderabadi Chicken Dum Biryani', 'Biryanis', 'Indian', 429, 4.9, 'Medium', false, 48, IMG.biryani,
    'Sealed-pot dum biryani with long grain basmati, saffron and tender bone-in chicken.'],
  ['rest1', 'Rajma Chawal Bowl', 'Main Course', 'Indian', 229, 4.6, 'Medium', true, 71, IMG.curry,
    'Slow cooked kidney bean curry finished with ginger julienne served with steamed rice.'],
  ['rest1', 'Gulab Jamun (2 pcs)', 'Desserts', 'Indian', 129, 4.7, 'Mild', true, 34, IMG.gulab,
    'Warm milk dumplings soaked in cardamom sugar syrup. Served hot.'],
  ['rest1', 'Dal Makhani', 'Main Course', 'Indian', 279, 4.8, 'Mild', true, 66, IMG.curry,
    'Black lentils simmered overnight with butter, cream and a smoky tandoor finish.'],

  // ---- rest2 Kathi Zone --------------------------------------------------
  ['rest2', 'Chicken Kathi Roll', 'Rolls & Wraps', 'Indian', 179, 4.5, 'Medium', false, 55, IMG.roll,
    'Egg and onion paratha rolled with spiced chicken filling, mint chutney and salad.'],
  ['rest2', 'Double Egg Bhurji Roll', 'Rolls & Wraps', 'Indian', 159, 4.4, 'Hot', true, 60, IMG.roll,
    'Scrambled egg with onion, capsicum and coriander rolled in a crisp paratha.'],
  ['rest2', 'Pani Puri Shots (6 pcs)', 'Starters', 'Indian', 149, 4.6, 'Hot', true, 44, IMG.chaat,
    'Crisp puri shells with tangy mint and tamarind water. Served six at a time.'],
  ['rest2', 'Aloo Tikki Chaat', 'Starters', 'Indian', 129, 4.3, 'Medium', true, 52, IMG.chaat,
    'Grilled potato patties with curd, chutneys and a generous dusting of chaat masala.'],
  ['rest2', 'Samosa Chaat', 'Starters', 'Indian', 119, 4.4, 'Hot', true, 41, IMG.vada,
    'Crushed samosa tossed with chickpeas, curd and tamarind chutney.'],
  ['rest2', 'Sweet Lassi', 'Beverages', 'Indian', 99, 4.6, 'Mild', true, 55, IMG.lassi,
    'Thick chilled lassi blended with alphonso mango and topped with pistachio.'],
  ['rest2', 'Masala Soda', 'Beverages', 'Indian', 59, 4.2, 'Mild', true, 70, IMG.lassi,
    'Chilled soda with a squeeze of lime and freshly ground masala mix.'],

  // ---- rest3 Noodle Bar --------------------------------------------------
  ['rest3', 'Chicken Hakka Noodles', 'Noodles', 'Chinese', 259, 4.5, 'Hot', false, 50, IMG.noodles,
    'Wok-tossed noodles with shredded cabbage, carrot and a smoky hakka sauce.'],
  ['rest3', 'Veg Manchurian Noodles', 'Noodles', 'Chinese', 219, 4.4, 'Medium', true, 53, IMG.noodles,
    'Crispy vegetable dumplings tossed in Manchurian sauce with spring onions.'],
  ['rest3', 'Egg Fried Rice', 'Rice', 'Chinese', 199, 4.3, 'Mild', false, 58, IMG.friedrice,
    'Wok-fried rice with scrambled egg, spring onion and a dash of white pepper.'],
  ['rest3', 'Burnt Garlic Fried Rice', 'Rice', 'Chinese', 239, 4.6, 'Hot', false, 49, IMG.friedrice,
    'Crispy egg fried rice finished with burnt garlic, chilli oil and scallions.'],
  ['rest3', 'Crispy Spring Rolls', 'Starters', 'Chinese', 169, 4.5, 'Mild', true, 47, IMG.springroll,
    'Vegetable spring rolls with a sweet chilli dip on the side.'],
  ['rest3', 'Chicken Momos (6 pcs)', 'Starters', 'Chinese', 189, 4.6, 'Medium', false, 51, IMG.momo,
    'Steamed chicken dumplings with a fiery red schezwan chutney.'],

  // ---- rest4 Dim Sum House ------------------------------------------------
  ['rest4', 'Vegetable Momos (6 pcs)', 'Dim Sum', 'Chinese', 149, 4.5, 'Mild', true, 62, IMG.momo,
    'Steamed dumplings filled with finely chopped cabbage, carrot and garlic.'],
  ['rest4', 'Chicken Siu Mai (4 pcs)', 'Dim Sum', 'Chinese', 189, 4.6, 'Mild', false, 54, IMG.dimsum,
    'Open-topped dumplings with minced chicken, shiitake and a steamed egg cap.'],
  ['rest4', 'Crystal Dumpling', 'Dim Sum', 'Chinese', 169, 4.4, 'Mild', true, 58, IMG.dimsum,
    'Translucent crystal skin wrapped around a delicate prawn and vegetable filling.'],
  ['rest4', 'Char Siu Bao', 'Steamed Buns', 'Chinese', 139, 4.5, 'Mild', false, 50, IMG.bun,
    'Fluffy steamed buns filled with honey glazed barbecue pork.'],
  ['rest4', 'Gao Jiu Bun', 'Steamped Buns', 'Chinese', 119, 4.3, 'Mild', true, 60, IMG.bun,
    'Steamed lotus leaf bun with a fragrant chicken and shiitake filling.'],
  ['rest4', 'Hot and Sour Soup', 'Soups', 'Chinese', 129, 4.4, 'Medium', false, 46, IMG.soup,
    'Peppery broth with shredded chicken, egg ribbons and crisp noodles.'],
  ['rest4', 'Wonton Soup', 'Soups', 'Chinese', 139, 4.5, 'Mild', false, 48, IMG.soup,
    'Clear broth with soft wontons, bok choy and a drizzle of sesame oil.'],

  // ---- rest5 Pizzeria Roma ------------------------------------------------
  ['rest5', 'Spicy Pepperoni Pizza', 'Pizza', 'Italian', 399, 4.8, 'Hot', false, 42, IMG.pizza,
    'Sourdough base layered with pepperoni, mozzarella, chilli flakes and oregano.'],
  ['rest5', 'Four Cheese Pizza', 'Pizza', 'Italian', 379, 4.7, 'Mild', true, 45, IMG.pizza,
    'Mozzarella, gorgonzola, parmesan and smoked scamorza with a herb crust.'],
  ['rest5', 'Roasted Mushroom Pizza', 'Pizza', 'Italian', 349, 4.6, 'Mild', true, 57, IMG.pizza,
    'Wood fired pizza with roasted mushrooms, thyme, garlic and truffle cream.'],
  ['rest5', 'Garlic Breadsticks', 'Sides', 'Italian', 149, 4.6, 'Mild', true, 49, IMG.garlicbread,
    'Golden breadsticks brushed with garlic butter, parsley and parmesan.'],
  ['rest5', 'Tiramisu', 'Desserts', 'Italian', 219, 4.9, 'Mild', true, 38, IMG.tiramisu,
    'Espresso soaked savoiardi with mascarpone cream and a dark cocoa dusting.'],
  ['rest5', 'Roasted Vegetable Skewers', 'Sides', 'Italian', 189, 4.2, 'Mild', true, 64, IMG.garlicbread,
    'Bell peppers, zucchini and cherry tomatoes grilled and drizzled with herb oil.'],

  // ---- rest6 Pasta Palace -------------------------------------------------
  ['rest6', 'Alfredo Pasta', 'Pasta', 'Italian', 289, 4.5, 'Mild', true, 51, IMG.pasta,
    'Fettuccine tossed in a rich parmesan and butter cream sauce.'],
  ['rest6', 'Penne in Vodka Sauce', 'Pasta', 'Italian', 299, 4.6, 'Medium', true, 48, IMG.pasta,
    'Penne simmered in a blended tomato and vodka sauce finished with parmesan.'],
  ['rest6', 'Chicken Carbonara', 'Pasta', 'Italian', 349, 4.7, 'Medium', false, 44, IMG.carbonara,
    'Spaghetti with crisp guanciale, egg yolk, pecorino and cracked black pepper.'],
  ['rest6', 'Classic Mushroom Risotto', 'Risotto', 'Italian', 329, 4.4, 'Mild', true, 52, IMG.risotto,
    'Carnaroli rice cooked slowly with porcini stock, butter and aged parmesan.'],
  ['rest6', 'Bruschetta Al Pomodoro', 'Starters', 'Italian', 189, 4.3, 'Mild', true, 66, IMG.garlicbread,
    'Toasted sourdough with cherry tomatoes, fresh basil, garlic and olive oil.'],
  ['rest6', 'Caesar Salad', 'Starters', 'Italian', 229, 4.2, 'Mild', true, 61, IMG.risotto,
    'Cos lettuce, shaved parmesan and croutons tossed in a classic Caesar dressing.'],

  // ---- rest7 Burger Club --------------------------------------------------
  ['rest7', 'Crispy Chicken Burger', 'Burgers', 'Fast Food', 279, 4.7, 'Medium', false, 38, IMG.burger,
    'Buttermilk fried chicken in a brioche bun with slaw and chipotle mayo.'],
  ['rest7', 'Paneer Tikka Burger', 'Burgers', 'Fast Food', 239, 4.4, 'Medium', true, 45, IMG.burger,
    'Grilled paneer patty with lettuce, onion and mint chutney in a sesame bun.'],
  ['rest7', 'Loaded Cheese Fries', 'Sides', 'Fast Food', 189, 4.5, 'Medium', true, 34, IMG.fries,
    'Fries smothered in molten cheddar sauce with jalapenos and spring onion.'],
  ['rest7', 'Buffalo Wings (6 pcs)', 'Sides', 'Fast Food', 249, 4.6, 'Hot', false, 32, IMG.wings,
    'Crisp fried wings tossed in buffalo sauce, served with a blue cheese dip.'],
  ['rest7', 'Onion Rings', 'Sides', 'Fast Food', 149, 4.2, 'Mild', true, 36, IMG.fries,
    'Beer battered onion rings with a smoky tomato dip.'],
  ['rest7', 'Oreo Thick Shake', 'Shakes', 'Fast Food', 179, 4.5, 'Mild', true, 28, IMG.shake,
    'Vanilla bean milkshake blended with crushed Oreo and topped with cream.'],

  // ---- rest8 Dessert Heaven -----------------------------------------------
  ['rest8', 'Red Velvet Cake', 'Cakes', 'Desserts', 429, 4.9, 'Mild', true, 30, IMG.cake,
    'Velvet sponge layered with tangy cream cheese frosting and a red velvet crumb.'],
  ['rest8', 'Black Forest Cake', 'Cakes', 'Desserts', 449, 4.8, 'Mild', true, 29, IMG.cake,
    'Chocolate sponge, whipped cream and morello cherries soaked in kirsch.'],
  ['rest8', 'Fudge Brownie', 'Brownies', 'Desserts', 189, 4.7, 'Mild', true, 26, IMG.brownie,
    'Dense dark chocolate brownie with a molten centre and walnut crumble.'],
  ['rest8', 'Choco Brownie Sundae', 'Sundaes', 'Desserts', 229, 4.8, 'Mild', true, 27, IMG.sundae,
    'Warm brownie, vanilla scoop, hot fudge and a wafer stick.'],
  ['rest8', 'Ferrero Rocher Sundae', 'Sundaes', 'Desserts', 249, 4.6, 'Mild', true, 25, IMG.sundae,
    'Chocolate sundae studded with hazelnut pralines and topped with cocoa nibs.'],
  ['rest8', 'Vanilla Bean Scoop', 'Sundaes', 'Desserts', 129, 4.5, 'Mild', true, 33, IMG.sundae,
    'Madagascan vanilla bean ice cream with real vanilla pod flecks.'],

  // ---- rest9 Sweet Treats --------------------------------------------------
  ['rest9', 'Pistachio Gelato', 'Gelato', 'Desserts', 189, 4.6, 'Mild', true, 39, IMG.gelato,
    'Sicilian style pistachio gelato churned with Bronte pistachio paste.'],
  ['rest9', 'Stracciatella Gelato', 'Gelato', 'Desserts', 179, 4.5, 'Mild', true, 41, IMG.gelato,
    'Creamy milk gelato with generous dark chocolate shards.'],
  ['rest9', 'Classic Panna Cotta', 'Panna Cotta', 'Desserts', 199, 4.7, 'Mild', true, 42, IMG.pannacotta,
    'Vanilla bean panna cotta set softly and served with a warm berry coulis.'],
  ['rest9', 'Belgian Chocolate Pot', 'Panna Cotta', 'Desserts', 229, 4.6, 'Mild', true, 40, IMG.pannacotta,
    'Dense chocolate panna cotta layered with dark chocolate ganache.'],
  ['rest9', 'Almond Croissant', 'Pastries', 'Desserts', 169, 4.8, 'Mild', true, 36, IMG.pastry,
    'Laminated pastry filled with frangipane and dusted with flaked almonds.'],
  ['rest9', 'Chocolate Éclair', 'Pastries', 'Desserts', 179, 4.5, 'Mild', true, 31, IMG.pastry,
    'Choux pastry filled with vanilla crème pâtissière and a dark chocolate glaze.'],
];

const main = async () => {
  const [dishes, restaurants] = await Promise.all([readJson('dishes.json'), readJson('restaurants.json')]);
  const existingIds = new Set(dishes.map((dish) => dish.id));
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));

  const additions = NEW_DISHES.filter(([restaurantId, name]) => {
    const id = `d-${restaurantId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return !existingIds.has(id);
  }).map(([restaurantId, name, category, cuisine, price, rating, spiceLevel, isVeg, healthMeterScore, imageUrl, description]) => {
    const restaurant = restaurantById.get(restaurantId);
    return {
      id: `d-${restaurantId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      restaurantId,
      name,
      category,
      cuisine,
      description,
      spiceLevel,
      price,
      rating,
      deliveryTime: restaurant?.deliveryTime ?? '25-30 mins',
      healthMeterScore,
      restaurantName: restaurant?.name,
      imageUrl,
      isVeg,
    };
  });

  await writeJson('dishes.json', [...dishes, ...additions]);

  console.log(`Catalogue: ${dishes.length + additions.length} dishes (+${additions.length} added).`);
  const counts = [...dishes, ...additions].reduce((acc, dish) => {
    acc[dish.restaurantId] = (acc[dish.restaurantId] ?? 0) + 1;
    return acc;
  }, {});
  Object.entries(counts)
    .sort()
    .forEach(([restaurantId, count]) => console.log(`  ${restaurantId}: ${count} dishes`));
};

main().catch((error) => {
  console.error('Menu expansion failed:', error);
  process.exit(1);
});
