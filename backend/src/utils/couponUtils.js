const fs = require('fs');
const path = require('path');

const computeDiscount = (coupon, subtotal, deliveryFee) => {
  if (coupon.discountType === 'flat') {
    return coupon.discountValue;
  }
  if (coupon.discountType === 'percent') {
    let discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
    return discount;
  }
  if (coupon.discountType === 'free_delivery') {
    return deliveryFee;
  }
  return 0;
};

let cachedCoupons = null;
const readCouponsSync = () => {
  if (!cachedCoupons) {
    const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'coupons.json'), 'utf8');
    cachedCoupons = JSON.parse(raw);
  }
  return cachedCoupons;
};

const calculateBestCoupon = (items, subtotal, deliveryFee) => {
  let bestCoupon = null;
  let bestDiscount = 0;

  if (subtotal <= 0) {
    return { bestCoupon, discount: 0 };
  }

  const coupons = readCouponsSync();
  coupons.forEach((coupon) => {
    if (subtotal < coupon.minOrderValue) return;
    const discount = computeDiscount(coupon, subtotal, deliveryFee);
    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestCoupon = coupon;
    }
  });

  return { bestCoupon, discount: bestDiscount };
};

module.exports = { calculateBestCoupon, computeDiscount };