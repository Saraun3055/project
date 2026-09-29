/**
 * Delivery simulation for multi-restaurant orders.
 *
 * One customer checkout becomes N per-restaurant orders that share a
 * transaction id. Each order advances through its own lifecycle on a wall-clock
 * schedule, so every client that polls the tracking endpoint sees the same state
 * without any server-push transport.
 *
 * Elapsed time is scaled (`timeScale` simulated minutes per real second) which
 * keeps a 25 minute delivery demoable in ~25 seconds while preserving the real
 * ordering guarantees: a restaurant can only be "picked up" once it is ready,
 * and the rider visits every stop before reaching the customer.
 */

const { buildRoute, positionAlongRoute, formatMinutes } = require('./routePlanner');

const STATUS = {
  PLACED: 'Placed',
  AWAITING: 'Awaiting restaurant confirmation',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready for pickup',
  PICKED_UP: 'Picked up',
  DELIVERED: 'Delivered',
  DECLINED: 'Declined',
};

const AUTO_ACCEPT_SIM_MINUTES = 2;
const DRIVER_START = {
  name: 'Rahul Verma',
  vehicle: 'KA 05 HJ 2210 · White Swift Dzire',
  coordinates: { lat: 12.9497, lng: 77.5422 },
};

const DEFAULT_CUSTOMER_ADDRESS = {
  label: 'Flat 402, Springdale Apartments, Indiranagar, Bengaluru - 560038',
  coordinates: { lat: 12.9716, lng: 77.6412 },
};

const minutesBetween = (fromIso, toIso) => (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000;

const elapsedSimulatedMinutes = (record, nowMs = Date.now()) => {
  const timeScale = Number(record.timeScale) > 0 ? Number(record.timeScale) : 1;
  return Math.max(0, (nowMs - new Date(record.simulationStartedAt).getTime()) / 1000) * timeScale;
};

/**
 * Builds (and caches) the rider plan for a transaction.
 */
const resolveRoute = (record) => {
  if (record.routePlan) return record.routePlan;

  const activeOrders = (record.orders || []).filter((order) => order.status !== STATUS.DECLINED);
  const customerAddress = record.customerAddress ?? DEFAULT_CUSTOMER_ADDRESS;

  const routePlan = buildRoute(
    activeOrders.map((order) => ({
      id: order.orderId,
      coordinates: order.coordinates,
    })),
    DRIVER_START.coordinates,
    customerAddress.coordinates
  );

  record.routePlan = routePlan;
  return routePlan;
};

const legEndMinutes = (routePlan) => {
  const cumulative = [];
  let total = 0;
  routePlan.legs.forEach((leg) => {
    total += leg.travelMinutes;
    cumulative.push({ leg, endMinutes: total });
  });
  return { cumulative, total };
};

/**
 * Resolves the live state of a single order inside a transaction.
 */
const resolveOrderState = (order, elapsed, context, record) => {
  const timeline = [];
  const push = (status, label, detail) => timeline.push({ status, label, detail });

  if (order.status === STATUS.DECLINED) {
    push(STATUS.PLACED, 'Order placed', `Sent to ${order.restaurantName}.`);
    push(STATUS.DECLINED, 'Declined by restaurant', order.declineReason || 'The restaurant cannot take this order.');
    return {
      ...order,
      status: STATUS.DECLINED,
      statusLabel: STATUS.DECLINED,
      timeline,
      prepMinutes: 0,
      readyAt: null,
      pickedUpAt: null,
      isActive: false,
      completed: true,
      progress: 0,
    };
  }

  const prepMinutes = Number(order.prepMinutes) || Number(order.defaultPrepMinutes) || 18;
  const placedAtMinutes = order.placedAt ? minutesBetween(record.simulationStartedAt, order.placedAt) : 0;

  let acceptedAtMinutes = order.acceptedAt
    ? minutesBetween(record.simulationStartedAt, order.acceptedAt)
    : null;
  let acceptedManually = true;

  if (acceptedAtMinutes === null) {
    if (elapsed >= placedAtMinutes + AUTO_ACCEPT_SIM_MINUTES) {
      // Unanswered tickets are auto-accepted so the simulation keeps moving.
      acceptedAtMinutes = placedAtMinutes + AUTO_ACCEPT_SIM_MINUTES;
      acceptedManually = false;
    }
  }

  push(STATUS.PLACED, 'Order placed', `Sent to ${order.restaurantName}.`);

  if (acceptedAtMinutes === null) {
    push(STATUS.AWAITING, 'Awaiting confirmation', `${order.restaurantName} has not responded yet.`);
    return {
      ...order,
      status: STATUS.AWAITING,
      statusLabel: STATUS.AWAITING,
      timeline,
      prepMinutes,
      readyAt: null,
      pickedUpAt: null,
      isActive: true,
      completed: false,
      progress: 10,
    };
  }

  push(
    STATUS.ACCEPTED,
    'Accepted by restaurant',
    acceptedManually
      ? `${order.restaurantName} accepted the order.`
      : `${order.restaurantName} accepted the order automatically.`
  );

  const readyAtMinutes = acceptedAtMinutes + prepMinutes;
  push(STATUS.PREPARING, 'Preparing', `${order.restaurantName} is cooking ${order.items?.length ?? 0} item(s).`);

  if (elapsed < readyAtMinutes) {
    const prepProgress = acceptedAtMinutes === readyAtMinutes
      ? 0
      : ((elapsed - acceptedAtMinutes) / prepMinutes) * 100;
    return {
      ...order,
      status: STATUS.PREPARING,
      statusLabel: STATUS.PREPARING,
      timeline,
      prepMinutes,
      readyAt: new Date(new Date(record.simulationStartedAt).getTime() + readyAtMinutes * 60000).toISOString(),
      prepProgress: Math.max(0, Math.min(100, Math.round(prepProgress))),
      pickedUpAt: null,
      isActive: true,
      completed: false,
      progress: 20 + prepProgress * 0.3,
    };
  }

  push(STATUS.READY, 'Ready for pickup', `${order.restaurantName} has packed the order.`);

  const pickupLeg = context.legEnds.find(
    (entry) => entry.leg.type === 'pickup' && entry.leg.stopId === order.orderId
  );

  if (!context.riderDeparted) {
    return {
      ...order,
      status: STATUS.READY,
      statusLabel: STATUS.READY,
      timeline,
      prepMinutes,
      readyAt: new Date(new Date(record.simulationStartedAt).getTime() + readyAtMinutes * 60000).toISOString(),
      prepProgress: 100,
      pickedUpAt: null,
      isActive: true,
      completed: false,
      progress: 55,
    };
  }

  if (pickupLeg && context.riderElapsed >= pickupLeg.endMinutes) {
    const pickedUpAt = new Date(
      new Date(record.simulationStartedAt).getTime() + (context.allReadyAt + pickupLeg.endMinutes) * 60000
    ).toISOString();
    push(STATUS.PICKED_UP, 'Picked up', `Rider collected the order from ${order.restaurantName}.`);

    if (context.delivered) {
      push(STATUS.DELIVERED, 'Delivered', 'Handed over to the customer.');
      return {
        ...order,
        status: STATUS.DELIVERED,
        statusLabel: STATUS.DELIVERED,
        timeline,
        prepMinutes,
        readyAt: new Date(new Date(record.simulationStartedAt).getTime() + readyAtMinutes * 60000).toISOString(),
        prepProgress: 100,
        pickedUpAt,
        isActive: true,
        completed: true,
        progress: 100,
      };
    }

    return {
      ...order,
      status: STATUS.PICKED_UP,
      statusLabel: STATUS.PICKED_UP,
      timeline,
      prepMinutes,
      readyAt: new Date(new Date(record.simulationStartedAt).getTime() + readyAtMinutes * 60000).toISOString(),
      prepProgress: 100,
      pickedUpAt,
      isActive: true,
      completed: false,
      progress: 75,
    };
  }

  return {
    ...order,
    status: STATUS.READY,
    statusLabel: STATUS.READY,
    timeline,
    prepMinutes,
    readyAt: new Date(new Date(record.simulationStartedAt).getTime() + readyAtMinutes * 60000).toISOString(),
    prepProgress: 100,
    pickedUpAt: null,
    isActive: true,
    completed: false,
    progress: 55,
  };
};

/**
 * Produces the full live view of a transaction, including the consolidated ETA
 * and the rider's simulated position.
 */
const simulateTransaction = (record, nowMs = Date.now()) => {
  const routePlan = resolveRoute(record);
  const elapsed = elapsedSimulatedMinutes(record, nowMs);
  const { cumulative, total } = legEndMinutes(routePlan);

  // The rider can only leave once every active kitchen is ready.
  const activeOrders = (record.orders || []).filter((order) => order.status !== STATUS.DECLINED);
  const allReadyAt = activeOrders.reduce((max, order) => {
    const prepMinutes = Number(order.prepMinutes) || Number(order.defaultPrepMinutes) || 18;
    const acceptedAtMinutes = order.acceptedAt
      ? minutesBetween(record.simulationStartedAt, order.acceptedAt)
      : AUTO_ACCEPT_SIM_MINUTES;
    return Math.max(max, acceptedAtMinutes + prepMinutes);
  }, 0);

  const riderDeparted = elapsed >= allReadyAt;
  const riderElapsed = riderDeparted ? elapsed - allReadyAt : 0;
  const delivered = riderDeparted && riderElapsed >= total;
  const context = { riderDeparted, riderElapsed, allReadyAt, delivered, legEnds: cumulative };

  const orders = (record.orders || []).map((order) => resolveOrderState(order, elapsed, context, record));

  const remainingMinutes = delivered
    ? 0
    : Math.max(0, allReadyAt + routePlan.totalMinutes - elapsed);
  const driverPosition = riderDeparted && !delivered
    ? positionAlongRoute(routePlan, riderElapsed)
    : delivered
      ? routePlan.legs[routePlan.legs.length - 1]?.to ?? null
      : DRIVER_START.coordinates;

  const currentLeg = driverPosition?.currentLeg ?? null;
  const legLabel = (() => {
    if (delivered) return 'Delivered';
    if (!riderDeparted) return 'Waiting for the kitchen';
    if (currentLeg?.type === 'pickup') {
      const stop = activeOrders.find((order) => order.orderId === currentLeg.stopId);
      return `Collecting from ${stop?.restaurantName ?? 'restaurant'}`;
    }
    return 'Heading to the customer';
  })();

  return {
    transactionId: record.transactionId,
    customerId: record.customerId,
    customerName: record.customerName,
    customerAddress: record.customerAddress ?? DEFAULT_CUSTOMER_ADDRESS,
    placedAt: record.placedAt,
    updatedAt: new Date(nowMs).toISOString(),
    status: delivered
      ? STATUS.DELIVERED
      : riderDeparted
        ? 'On the way'
        : 'Preparing',
    restaurantCount: activeOrders.length,
    orders,
    driver: {
      ...DRIVER_START,
      position: driverPosition,
      activity: legLabel,
      isOnTheRoad: riderDeparted && !delivered,
    },
    route: {
      pickupSequence: routePlan.sequence,
      distanceKm: Number(routePlan.distanceKm.toFixed(2)),
      totalMinutes: Math.round(routePlan.totalMinutes),
      legs: routePlan.legs.map((leg, index) => ({
        type: leg.type,
        stopId: leg.stopId,
        distanceKm: Number(leg.distanceKm.toFixed(2)),
        travelMinutes: Math.round(leg.travelMinutes),
        arriveAfterMinutes: Math.round(cumulative[index].endMinutes),
      })),
    },
    eta: {
      minutes: Math.round(remainingMinutes),
      label: delivered ? 'Delivered' : formatMinutes(remainingMinutes),
      // The slowest kitchen dictates when the rider can leave.
      waitingOnRestaurant: activeOrders
        .filter((order) => {
          const state = orders.find((item) => item.orderId === order.orderId);
          return state && !state.completed && state.status !== STATUS.READY && state.status !== STATUS.PICKED_UP;
        })
        .map((order) => order.restaurantName),
    },
  };
};

/**
 * Advances a transaction based on the restaurant's accept / decline decision.
 * The simulation itself is derived on read, so this only records the decision.
 */
const applyOrderDecision = (record, orderId, { status, prepMinutes, reason }) => {
  const order = (record.orders || []).find((item) => item.orderId === orderId);
  if (!order) return { record, error: 'not-found' };

  if (status === STATUS.DECLINED) {
    order.status = STATUS.DECLINED;
    order.declinedAt = new Date().toISOString();
    order.declineReason = reason || 'Restaurant is at capacity.';
    // The cached plan no longer matches the remaining stops.
    record.routePlan = null;
    return { record, order };
  }

  order.status = STATUS.ACCEPTED;
  order.acceptedAt = new Date().toISOString();
  if (Number(prepMinutes) > 0) {
    order.prepMinutes = Number(prepMinutes);
  }
  record.routePlan = record.routePlan ?? null;
  return { record, order };
};

module.exports = {
  STATUS,
  DRIVER_START,
  DEFAULT_CUSTOMER_ADDRESS,
  AUTO_ACCEPT_SIM_MINUTES,
  simulateTransaction,
  applyOrderDecision,
  elapsedSimulatedMinutes,
};
