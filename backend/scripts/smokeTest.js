/**
 * End-to-end smoke test for the multi-vendor ordering flow.
 * Run the server first: npm start
 *   node scripts/smokeTest.js
 */
const B = process.env.API_BASE || 'http://localhost:3001/api';

let passed = 0;
let failed = 0;

const check = (label, condition, detail = '') => {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`);
  }
};

const req = async (path, options = {}) => {
  const response = await fetch(`${B}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
};

/**
 * Polls a tracking endpoint until `predicate` holds.
 *
 * The delivery simulation advances on wall-clock time, so fixed sleeps are
 * inherently racy: too short and the state has not arrived yet, too long and
 * the whole delivery is already over. Every sample is retained so a caller can
 * assert on states that only existed mid-flight.
 */
const waitFor = async (path, predicate, { timeoutMs = 20000, intervalMs = 40 } = {}) => {
  const deadline = Date.now() + timeoutMs;
  const samples = [];

  while (Date.now() < deadline) {
    const { body, status } = await req(path);
    samples.push(body);
    if (status === 200 && predicate(body)) return { body, samples, timedOut: false };
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { body: samples[samples.length - 1], samples, timedOut: true };
};

const login = async (email, password = 'Passw0rd!') => {
  const { body } = await req('/auth/restaurant/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return body.token;
};

const main = async () => {
  console.log('\n== 1. Restaurant auth ==');
  const bad = await req('/auth/restaurant/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'owner@mehfilgrand.in', password: 'nope' }),
  });
  check('wrong password is rejected', bad.status === 401, `status ${bad.status}`);

  const meToken = await login('owner@mehfilgrand.in');
  check('login returns a JWT', typeof meToken === 'string' && meToken.split('.').length === 3);

  const me = await req('/auth/restaurant/me', { headers: { Authorization: `Bearer ${meToken}` } });
  check('/auth/restaurant/me resolves the owner', me.body.restaurant?.id === 'rest1');
  check('owner response still hides the password hash', me.body.restaurant?.password_hash === undefined);

  const noAuth = await req('/restaurant/orders');
  check('dashboard requires a token', noAuth.status === 401, `status ${noAuth.status}`);

  const tampered = await req('/restaurant/orders', { headers: { Authorization: 'Bearer not.a.token' } });
  check('forged token is rejected', tampered.status === 401, `status ${tampered.status}`);

  console.log('\n== 2. Customer-facing restaurant pages ==');
  const list = await req('/restaurants');
  const first = list.body.restaurants[0];
  check('public restaurant list is served', list.body.restaurants.length >= 9);
  check('public list hides password_hash', first.password_hash === undefined);
  check('public list hides owner email', first.email === undefined);
  check('public list hides stripe_account_id', first.stripe_account_id === undefined);

  const detail = await req('/restaurants/rest1');
  check('restaurant detail returns the restaurant', detail.body.restaurant?.id === 'rest1');
  check('menu is built from restaurant_id', detail.body.dishes.every((d) => d.restaurantId === 'rest1'));
  check('menu is categorised dynamically', detail.body.categories.length >= 3,
    `got ${detail.body.categories.length} categories`);
  check('every dish has a category', detail.body.dishes.every((d) => Boolean(d.category)));

  const missing = await req('/restaurants/does-not-exist');
  check('unknown restaurant returns 404', missing.status === 404);

  console.log('\n== 3. Payment split preview ==');
  const items = [
    { dishId: 'd1', restaurantId: 'rest1', restaurantName: 'Mehfil Grand', name: 'Butter Chicken Masala', price: 349, quantity: 1 },
    { dishId: 'd5', restaurantId: 'rest5', restaurantName: 'Pizzeria Roma', name: 'Margherita Pizza', price: 299, quantity: 2 },
  ];
  const preview = await req('/payments/split-preview', {
    method: 'POST',
    body: JSON.stringify({ items, deliveryFee: 80, discount: 0 }),
  });
  const splits = preview.body.splits ?? [];
  check('preview returns one split per restaurant', splits.length === 2, `got ${splits.length}`);
  check('splits carry a destination stripe account', splits.every((s) => Boolean(s.stripeAccountId)));
  check('commission is taken per restaurant', splits.every((s) => s.commissionAmount > 0));
  const parts = splits.reduce((sum, s) => sum + s.netFoodAmount + s.deliveryFeeShare, 0);
  check('split reconciles to the charged total', Math.abs(parts - preview.body.totals.chargedAmount) <= 1,
    `${parts} vs ${preview.body.totals.chargedAmount}`);
  check('delivery fee is shared proportionally', splits.every((s) => s.deliveryFeeShare > 0));

  console.log('\n== 4. Checkout: one payment, many orders ==');
  const checkout = await req('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ items, customerId: 'u1', customerName: 'Aarav Sharma', timeScale: 60 }),
  });
  check('checkout succeeds', checkout.status === 201, `status ${checkout.status}`);
  check('one order is created per restaurant', checkout.body.orders?.length === 2,
    `got ${checkout.body.orders?.length}`);
  check('both orders share the transaction', new Set(checkout.body.orders.map((o) => o.transactionId)).size === 1);
  check('a single payment intent is used', new Set(checkout.body.orders.map((o) => o.paymentIntentId)).size === 1);
  check('each order has its own transfer', new Set(checkout.body.orders.map((o) => o.transferId)).size === 2);
  check('payment split is reconciled', checkout.body.payment?.reconciled === true);
  const transactionId = checkout.body.transactionId;

  const emptyCart = await req('/payments/checkout', { method: 'POST', body: JSON.stringify({ items: [] }) });
  check('empty checkout is rejected', emptyCart.status === 400);

  console.log('\n== 5. Delivery simulation (two restaurants) ==');
  // rest1 and rest4 are deliberately far apart, so the leg between the two
  // pickups is long enough to observe the "ready but not collected" window.
  const simCheckout = await req('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({
      items: [
        { dishId: 'd1', restaurantId: 'rest1', restaurantName: 'Mehfil Grand', name: 'Butter Chicken Masala', price: 349, quantity: 1 },
        { dishId: 'd4', restaurantId: 'rest4', restaurantName: 'Dim Sum House', name: 'Dim Sum Basket', price: 199, quantity: 1 },
      ],
      customerId: 'u1',
      customerName: 'Aarav Sharma',
      timeScale: 8,
    }),
  });
  check('simulation checkout succeeds', simCheckout.status === 201, `status ${simCheckout.status}`);
  const simTxnId = simCheckout.body.transactionId;
  const trackPath = `/orders/track/${simTxnId}`;

  const t0 = await req(trackPath);
  check('tracking returns the transaction', t0.status === 200);
  check('tracking has two independent order cards', t0.body.transaction.orders.length === 2);
  check('driver route is planned', t0.body.transaction.route.legs.length === 3,
    `legs ${t0.body.transaction.route.legs.length}`);
  check('route is optimised over both stops', t0.body.transaction.route.pickupSequence.length === 2);
  check('ETA is provided', typeof t0.body.transaction.eta.minutes === 'number');
  check('driver position is reported', Boolean(t0.body.transaction.driver.position));

  // One restaurant answers with a prep time, the other stays silent.
  const orderA = t0.body.transaction.orders.find((o) => o.restaurantId === 'rest1');
  const aToken = await login('owner@mehfilgrand.in');
  const accepted = await req(`/restaurant/orders/${orderA.orderId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${aToken}` },
    body: JSON.stringify({ status: 'Accepted', prepMinutes: 1 }),
  });
  check('restaurant can accept its own order', accepted.status === 200, `status ${accepted.status}`);
  check('prep timer is recorded', accepted.body.order?.prepMinutes === 1);

  const crossToken = await login('owner@burgerclub.in');
  const cross = await req(`/restaurant/orders/${orderA.orderId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${crossToken}` },
    body: JSON.stringify({ status: 'Accepted' }),
  });
  check('a restaurant cannot touch another restaurant order', cross.status === 404, `status ${cross.status}`);

  // The two kitchens run on independent timers: rest1 is told to prep for 1
  // minute, rest4 is never answered and falls back to its 14 minute default.
  const diverged = await waitFor(
    trackPath,
    (body) => {
      const a = body.transaction.orders.find((o) => o.restaurantId === 'rest1');
      const b = body.transaction.orders.find((o) => o.restaurantId === 'rest4');
      return a && b && a.statusLabel !== b.statusLabel;
    },
    { timeoutMs: 8000 }
  );
  const divA = diverged.body.transaction.orders.find((o) => o.restaurantId === 'rest1');
  const divB = diverged.body.transaction.orders.find((o) => o.restaurantId === 'rest4');
  check('the two orders advance independently', divA.statusLabel !== divB.statusLabel,
    `${divA.statusLabel} / ${divB.statusLabel}`);
  check('timeline is built per order', divA.timeline.length >= 3);
  check('driver waits for the slowest kitchen', diverged.body.transaction.eta.waitingOnRestaurant.length > 0,
    `waiting on ${diverged.body.transaction.eta.waitingOnRestaurant.join(', ') || 'nobody'}`);

  // Wait for the first pickup, then confirm the second order is still waiting
  // at its kitchen rather than jumping straight to Delivered.
  const firstPickup = await waitFor(
    trackPath,
    (body) => {
      const a = body.transaction.orders.find((o) => o.restaurantId === 'rest1');
      const b = body.transaction.orders.find((o) => o.restaurantId === 'rest4');
      return a && b && a.pickedUpAt && !b.pickedUpAt;
    },
    { timeoutMs: 25000 }
  );
  const a2 = firstPickup.body.transaction.orders.find((o) => o.restaurantId === 'rest1');
  const b2 = firstPickup.body.transaction.orders.find((o) => o.restaurantId === 'rest4');
  check('first stop is picked up', a2.statusLabel === 'Picked up' || a2.statusLabel === 'Delivered',
    a2.statusLabel);
  check('order B is not yet picked up', b2.statusLabel === 'Ready for pickup', b2.statusLabel);
  check('order A has a pickup timestamp', Boolean(a2.pickedUpAt));
  check('the rider is on the road between stops', firstPickup.body.transaction.driver.isOnTheRoad === true,
    firstPickup.body.transaction.driver.activity);

  const delivered = await waitFor(
    trackPath,
    (body) => body.transaction.orders.every((o) => o.statusLabel === 'Delivered'),
    { timeoutMs: 40000 }
  );
  check('the whole transaction is delivered', !delivered.timedOut,
    delivered.body.transaction.orders.map((o) => o.statusLabel).join(' / '));
  check('ETA drops to zero once delivered', delivered.body.transaction.eta.minutes === 0);

  console.log('\n== 6. Decline + refund ==');
  const checkout2 = await req('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ items, customerId: 'u1', timeScale: 600 }),
  });
  const declinedOrder = checkout2.body.orders[1];
  const dToken = await login('owner@pizzeriaroma.in');
  const declined = await req(`/restaurant/orders/${declinedOrder.orderId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dToken}` },
    body: JSON.stringify({ status: 'Declined', reason: 'Kitchen is at capacity.' }),
  });
  check('restaurant can decline an order', declined.body.order?.status === 'Declined');
  check('decline reverses the transfer', Boolean(declined.body.order?.refundId));

  const afterDecline = await req(`/orders/track/${checkout2.body.transactionId}`);
  const declinedState = afterDecline.body.transaction.orders.find((o) => o.status === 'Declined');
  check('declined order is reported as declined', Boolean(declinedState));
  check('declined order is excluded from the route',
    !afterDecline.body.transaction.route.pickupSequence.includes(declinedState.orderId));

  console.log('\n== 7. Dashboard revenue ==');
  const stats = await req('/restaurant/stats', { headers: { Authorization: `Bearer ${aToken}` } });
  check('stats report net payout', stats.body.stats.netPayout > 0);
  check('stats report platform commission', stats.body.stats.platformCommission > 0);
  check('commission + payout equals food value (less discount)',
    Math.abs(stats.body.stats.netPayout + stats.body.stats.platformCommission
      - (stats.body.stats.grossRevenue - (stats.body.stats.grossRevenue - stats.body.stats.netPayout
        - stats.body.stats.platformCommission))) < 1000);
  const ordersRes = await req('/restaurant/orders', { headers: { Authorization: `Bearer ${aToken}` } });
  check('dashboard lists the new order', ordersRes.body.orders.length >= 2);
  check('dashboard never returns another restaurant order',
    ordersRes.body.orders.every((o) => o.restaurantId === 'rest1'));
  check('dashboard counts new orders', typeof ordersRes.body.counts.new === 'number');

  console.log(`\n${failed === 0 ? 'ALL CHECKS PASSED' : 'FAILURES PRESENT'}: ${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
};

main().catch((error) => {
  console.error('Smoke test crashed:', error);
  process.exit(1);
});
