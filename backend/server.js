const express = require('express');
const cors = require('cors');

const menuRoutes = require('./src/routes/menuRoutes');
const userRoutes = require('./src/routes/userRoutes');
const promotionRoutes = require('./src/routes/promotionRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const authRoutes = require('./src/routes/authRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const favoritesRoutes = require('./src/routes/favoritesRoutes');
const { isLive: stripeIsLive } = require('./src/utils/stripeUtils');

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FoodExpress API',
    payments: stripeIsLive() ? 'stripe-connect-live' : 'stripe-connect-simulated',
  });
});

app.use('/api', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api', promotionRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', authRoutes);
app.use('/api', restaurantRoutes);
app.use('/api', paymentRoutes);
app.use('/api', favoritesRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found.',
    available: [
      'GET  /api/health',
      'GET  /api/restaurants',
      'GET  /api/restaurants/:id',
      'GET  /api/dishes',
      'GET  /api/dishes/:id',
      'GET  /api/categories',
      'GET  /api/users/profile',
      'PUT  /api/users/profile',
      'GET  /api/promotions',
      'GET  /api/cart',
      'POST /api/cart',
      'PUT  /api/cart',
      'DEL  /api/cart/:dishId',
      'POST /api/cart/apply-coupon',
      'POST /api/payments/split-preview',
      'POST /api/payments/checkout',
      'GET  /api/orders',
      'POST /api/orders',
      'GET  /api/orders/transactions',
      'GET  /api/orders/track/:transactionId',
      'GET  /api/orders/:orderId',
      'GET  /api/favorites',
      'POST /api/favorites',
      'DEL  /api/favorites/:dishId',
      'DEL  /api/favorites',
      'POST /api/auth/restaurant/login',
      'GET  /api/auth/restaurant/me',
      'GET  /api/restaurant/orders',
      'PATCH /api/restaurant/orders/:orderId',
      'GET  /api/restaurant/stats',
      'GET  /api/restaurant/menu',
      'PATCH /api/restaurant/settings',
      'GET  /api/restaurant/deliveries',
    ],
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error.', details: error.message });
});

app.listen(PORT, () => {
  console.log(`FoodExpress backend running on http://localhost:${PORT}`);
});