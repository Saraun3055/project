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

const main = async () => {
  console.log('\n== Test 1: Customer Auth (Exp 12) ==');
  const testEmail = `test_${Date.now()}@example.com`;
  const registerRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'John Doe',
      email: testEmail,
      password: 'Password123!',
      phone: '+91 9123456789',
    }),
  });
  check('Customer registration', registerRes.status === 201 && Boolean(registerRes.body.token));
  const token = registerRes.body.token;

  const loginRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123!',
    }),
  });
  check('Customer login with valid credentials', loginRes.status === 200 && Boolean(loginRes.body.token));

  const badLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'WrongPassword',
    }),
  });
  check('Customer login rejects wrong password', badLogin.status === 401);

  const meRes = await req('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check('GET /auth/me returns customer profile', meRes.status === 200 && meRes.body.customer.email === testEmail);

  console.log('\n== Test 2: User Profile & Addresses (Exp 12 CRUD) ==');
  const updateProfile = await req('/users/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Johnathan Doe',
      phone: '+91 9999999999',
      address: '123 Baker Street',
    }),
  });
  check('PUT /users/profile updates profile', updateProfile.status === 200 && updateProfile.body.profile.name === 'Johnathan Doe');

  const addAddress = await req('/users/addresses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      label: 'Office',
      line1: 'Tech Park, Tower B',
      city: 'Bengaluru',
      pincode: '560100',
    }),
  });
  check('POST /users/addresses adds address', addAddress.status === 201 && addAddress.body.addresses.length > 0);

  const getAddresses = await req('/users/addresses', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check('GET /users/addresses retrieves list', getAddresses.status === 200 && getAddresses.body.addresses.some(a => a.label === 'Office'));

  console.log('\n== Test 3: Cart CRUD (Exp 12) ==');
  const getCartEmpty = await req('/cart', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check('GET /cart returns initial cart', getCartEmpty.status === 200 && Array.isArray(getCartEmpty.body.cart?.items));

  const addCartItem = await req('/cart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      dishId: 'd1',
      quantity: 2,
    }),
  });
  check('POST /cart adds item to user cart', addCartItem.status === 201 && addCartItem.body.cart?.items?.some(i => i.dishId === 'd1'));

  const updateCartItem = await req('/cart', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items: [{ dishId: 'd1', quantity: 3, price: 349, name: 'Butter Chicken Masala' }],
    }),
  });
  check('PUT /cart updates item quantity', updateCartItem.status === 200 && updateCartItem.body.cart?.items?.find(i => i.dishId === 'd1')?.quantity === 3);

  const removeCartItem = await req('/cart/d1', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  check('DELETE /cart/:dishId removes item', removeCartItem.status === 200 && !removeCartItem.body.cart?.items?.some(i => i.dishId === 'd1'));

  console.log('\n== Test 4: Favorites CRUD (Exp 12) ==');
  const addFav = await req('/favorites', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ dishId: 'd2' }),
  });
  check('POST /favorites saves a dish', addFav.status === 201 && addFav.body.favorite.dishId === 'd2');

  const getFavs = await req('/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check('GET /favorites retrieves favorites', getFavs.status === 200 && getFavs.body.favorites.some(f => f.dishId === 'd2'));

  const delFav = await req('/favorites/d2', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  check('DELETE /favorites/:dishId removes favorite', delFav.status === 200);

  console.log('\n== Test 5: Feedback / Reviews (Exp 12) ==');
  const addFeedback = await req('/feedback', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      rating: 5,
      comment: 'Absolutely delightful meal and super fast delivery!',
      dishId: 'd1',
    }),
  });
  check('POST /feedback adds customer review', addFeedback.status === 201 && addFeedback.body.feedback.rating === 5);

  const getFeedback = await req('/feedback', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check('GET /feedback retrieves user reviews', getFeedback.status === 200 && getFeedback.body.feedbacks.length > 0);

  console.log('\n== Test 6: Admin CRUD (Exp 11 & 12) ==');
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@foodexpress.in',
      password: 'Passw0rd!',
    }),
  });
  check('Admin login succeeds', adminLogin.status === 200 && Boolean(adminLogin.body.token));
  const adminToken = adminLogin.body.token;

  // Admin access with customer token fails
  const forbiddenDishCreate = await req('/admin/dishes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Hacked Dish', price: 99 }),
  });
  check('Admin dish endpoint rejects regular customer token', forbiddenDishCreate.status === 403);

  const testDishId = `dish_test_${Date.now()}`;
  const createDish = await req('/admin/dishes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      id: testDishId,
      name: 'Paneer Tikka Royale',
      price: 320,
      cuisine: 'Indian',
      category: 'Indian',
      healthMeterScore: 82,
      healthMeter: { score: 82, calories: 310, protein: 18, carbs: 12, fat: 15, fiber: 4 },
      restaurantId: 'rest1',
      restaurantName: 'Mehfil Grand',
    }),
  });
  check('POST /admin/dishes creates dish with health meter', createDish.status === 201 && createDish.body.dish?.id === testDishId, `status: ${createDish.status}, body: ${JSON.stringify(createDish.body)}`);

  const updateDish = await req(`/admin/dishes/${testDishId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      price: 350,
      healthMeterScore: 85,
    }),
  });
  check('PUT /admin/dishes/:id updates dish', updateDish.status === 200 && updateDish.body.dish.price === 350);

  const deleteDish = await req(`/admin/dishes/${testDishId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  check('DELETE /admin/dishes/:id removes dish', deleteDish.status === 200);

  console.log(`\n${failed === 0 ? 'ALL EXP 11 & 12 CHECKS PASSED' : 'FAILURES PRESENT'}: ${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
};

main().catch((err) => {
  console.error('Test crashed:', err);
  process.exit(1);
});
