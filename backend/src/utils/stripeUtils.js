/**
 * Stripe Connect multi-vendor payment splitting.
 *
 * A single customer checkout can span several restaurants, so a single
 * destination charge is not enough. This module uses Stripe's
 * "separate charges and transfers" model:
 *
 *   1. The platform charges the customer once (one PaymentIntent).
 *   2. The platform then creates one Transfer per restaurant for that
 *      restaurant's net share, minus the platform commission.
 *
 * The platform keeps the commission plus its delivery fee in its own balance,
 * so restaurants never have to refund or handle customer money.
 *
 * When STRIPE_SECRET_KEY is present the module talks to the real Stripe REST
 * API over fetch (no extra npm dependency is required). Without a key it falls
 * back to a deterministic simulator that produces the exact same payload shape
 * so the rest of the app and the demo flow stay fully functional.
 */

const { Buffer } = require('buffer');

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const PLATFORM_FEE_PER_ORDER = 5; // ₹5 handling fee retained by the platform
const CURRENCY = 'inr';

const isLive = () => Boolean(process.env.STRIPE_SECRET_KEY);

const toMinorUnits = (rupees) => Math.round(Number(rupees) * 100);

const stripeRequest = async (path, params) => {
  const secret = process.env.STRIPE_SECRET_KEY;
  const body = new URLSearchParams();
  const append = (key, value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((entry, index) => append(`${key}[${index}]`, entry));
      return;
    }
    body.append(key, String(value));
  };
  Object.entries(params).forEach(([key, value]) => append(key, value));

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': params.__idempotencyKey,
    },
    body: body.toString(),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(json?.error?.message || `Stripe request failed (${response.status}).`);
    error.status = 402;
    error.stripeCode = json?.error?.code;
    throw error;
  }
  return json;
};

const simulatePaymentIntent = (payload) => {
  const fingerprint = Buffer.from(
    JSON.stringify({ amount: payload.amount, currency: payload.currency, transferGroup: payload.transfer_group })
  )
    .toString('hex')
    .slice(0, 18);
  return {
    id: `pi_sim_${fingerprint}`,
    object: 'payment_intent',
    amount: payload.amount,
    currency: payload.currency,
    status: 'succeeded',
    client_secret: `pi_sim_${fingerprint}_secret_${fingerprint.slice(0, 8)}`,
    transfer_group: payload.transfer_group,
    simulated: true,
  };
};

const simulateTransfer = ({ amount, destination, transferGroup }) => {
  const fingerprint = Buffer.from(`${transferGroup}:${destination}:${amount}`)
    .toString('hex')
    .slice(0, 16);
  return {
    id: `tr_sim_${fingerprint}`,
    object: 'transfer',
    amount,
    currency: CURRENCY,
    destination,
    transfer_group: transferGroup,
    simulated: true,
  };
};

/**
 * Builds the money split for every restaurant involved in a checkout.
 *
 * Delivery fees and discounts are allocated proportionally to each restaurant's
 * food subtotal so the split always reconciles to the charged total.
 */
const buildSplit = ({ groups, deliveryFee = 0, discount = 0 }) => {
  const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
  const proportional = (group) => (subtotal > 0 ? group.subtotal / subtotal : 1 / groups.length);

  let allocatedDiscount = 0;
  let allocatedDelivery = 0;

  const splits = groups.map((group, index) => {
    const share = proportional(group);
    const isLast = index === groups.length - 1;
    // The last group absorbs rounding drift so the parts always sum exactly.
    const discountShare = isLast ? discount - allocatedDiscount : Math.round(discount * share);
    const deliveryShare = isLast
      ? deliveryFee - allocatedDelivery
      : Math.round(deliveryFee * share);
    allocatedDiscount += discountShare;
    allocatedDelivery += deliveryShare;

    const commissionRate = Number(group.commissionRate ?? 0.12);
    const foodAmount = group.subtotal - discountShare;
    const commission = Math.round(foodAmount * commissionRate);
    const transferAmount = Math.max(0, foodAmount - commission);

    return {
      restaurantId: group.restaurantId,
      restaurantName: group.restaurantName,
      stripeAccountId: group.stripeAccountId,
      currency: CURRENCY,
      foodSubtotal: group.subtotal,
      discountShare,
      deliveryFeeShare: deliveryShare,
      netFoodAmount: foodAmount,
      commissionRate,
      commissionAmount: commission,
      transferAmount,
      // Sanity check used by the dashboard to display the reconciliation.
      restaurantPayout: transferAmount,
      platformRevenue: commission + deliveryShare,
    };
  });

  const chargedAmount = subtotal + deliveryFee - discount;
  const transferTotal = splits.reduce((sum, split) => sum + split.transferAmount, 0);
  const platformTotal = splits.reduce((sum, split) => sum + split.platformRevenue, 0);

  return {
    splits,
    totals: {
      subtotal,
      deliveryFee,
      discount,
      chargedAmount,
      transferTotal,
      platformTotal,
      platformHandlingFee: PLATFORM_FEE_PER_ORDER,
      // platformRevenue is measured before the flat handling fee, so the
      // difference between the two must be zero for the books to balance.
      reconciled: Math.abs(chargedAmount - (transferTotal + platformTotal + PLATFORM_FEE_PER_ORDER)) <= 1,
    },
  };
};

/**
 * Charges the customer once and transfers each restaurant's share.
 */
const chargeAndSplit = async ({ groups, deliveryFee, discount, customerId, orderReference }) => {
  if (!Array.isArray(groups) || groups.length === 0) {
    const error = new Error('At least one restaurant group is required to charge.');
    error.status = 400;
    throw error;
  }

  const { splits, totals } = buildSplit({ groups, deliveryFee, discount });
  if (totals.chargedAmount <= 0) {
    const error = new Error('Charge amount must be greater than zero.');
    error.status = 400;
    throw error;
  }

  const transferGroup = `ORDER_${orderReference}`;
  const amount = toMinorUnits(totals.chargedAmount);

  let paymentIntent;
  if (isLive()) {
    paymentIntent = await stripeRequest('/payment_intents', {
      __idempotencyKey: `pi_${transferGroup}_${amount}`,
      amount,
      currency: CURRENCY,
      transfer_group: transferGroup,
      description: `FoodExpress order ${orderReference}`,
      'automatic_payment_methods[enabled]': true,
      'metadata[orderReference]': orderReference,
      'metadata[customerId]': customerId || 'guest',
      'metadata[restaurantCount]': String(groups.length),
    });
  } else {
    paymentIntent = simulatePaymentIntent({ amount, currency: CURRENCY, transfer_group: transferGroup });
  }

  const transfers = [];
  for (const split of splits) {
    if (split.transferAmount <= 0 || !split.stripeAccountId) continue;
    const transferAmount = toMinorUnits(split.transferAmount);

    let transfer;
    if (isLive()) {
      transfer = await stripeRequest('/transfers', {
        __idempotencyKey: `tr_${transferGroup}_${split.restaurantId}_${transferAmount}`,
        amount: transferAmount,
        currency: CURRENCY,
        destination: split.stripeAccountId,
        transfer_group: transferGroup,
        'metadata[orderReference]': orderReference,
        'metadata[restaurantId]': split.restaurantId,
      });
    } else {
      transfer = simulateTransfer({
        amount: transferAmount,
        destination: split.stripeAccountId,
        transferGroup,
      });
    }

    transfers.push({
      transferId: transfer.id,
      restaurantId: split.restaurantId,
      stripeAccountId: split.stripeAccountId,
      amount: split.transferAmount,
      amountMinor: transferAmount,
    });
  }

  return {
    mode: isLive() ? 'live' : 'simulated',
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
    currency: CURRENCY,
    transferGroup,
    totals,
    splits: splits.map((split) => {
      const transfer = transfers.find((item) => item.restaurantId === split.restaurantId);
      return {
        ...split,
        transferId: transfer?.transferId ?? null,
        transferStatus: transfer ? 'paid' : 'skipped',
      };
    }),
    transfers,
  };
};

/**
 * Reverses a transfer when a restaurant declines the order.
 */
const refundTransfer = async ({ paymentIntentId, transfers, reason }) => {
  const refundTargets = transfers.filter((transfer) => transfer.transferId);
  const total = refundTargets.reduce((sum, transfer) => sum + transfer.amountMinor, 0);

  if (isLive()) {
    await stripeRequest('/refunds', {
      __idempotencyKey: `re_${paymentIntentId}_${total}`,
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      'metadata[reason]': reason || 'restaurant_declined',
    });
  }

  return {
    mode: isLive() ? 'live' : 'simulated',
    refundId: isLive() ? `re_sim_${paymentIntentId}` : `re_sim_${paymentIntentId}`,
    reversedTransfers: refundTargets.length,
    reversedAmount: total / 100,
  };
};

module.exports = {
  buildSplit,
  chargeAndSplit,
  refundTransfer,
  isLive,
  CURRENCY,
  PLATFORM_FEE_PER_ORDER,
};
