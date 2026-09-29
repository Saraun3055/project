/**
 * Route helpers for multi-stop deliveries.
 *
 * When a customer orders from several restaurants a single rider has to collect
 * every order before heading to the customer. The pickup order decides the total
 * ETA, so the stops are optimised (nearest neighbour, with an exhaustive check
 * for the small stop counts this marketplace produces).
 */

const EARTH_RADIUS_KM = 6371;

const DEFAULT_AVERAGE_SPEED_KMH = 22;
const DEFAULT_HANDOVER_MINUTES = 2;
// Central Bengaluru, used when a coordinate is missing so a route can still be
// planned instead of failing the whole request.
const DEFAULT_POINT = { lat: 12.9716, lng: 77.6412 };

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineKm = (from, to) => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
};

const permutations = (values) => {
  if (values.length <= 1) return [values];
  const result = [];
  values.forEach((value, index) => {
    const rest = [...values.slice(0, index), ...values.slice(index + 1)];
    permutations(rest).forEach((tail) => result.push([value, ...tail]));
  });
  return result;
};

/**
 * Builds the rider's stop list and reports the chosen pickup sequence.
 *
 * @param {Array<{id: string, coordinates: {lat: number, lng: number}}>} stops
 * @param {{lat: number, lng: number}} driverStart
 * @param {{lat: number, lng: number}} destination customer drop-off point
 */
const buildRoute = (stops, driverStart, destination, options = {}) => {
  const averageSpeedKmh = options.averageSpeedKmh ?? DEFAULT_AVERAGE_SPEED_KMH;
  const handoverMinutes = options.handoverMinutes ?? DEFAULT_HANDOVER_MINUTES;

  const start = driverStart ?? DEFAULT_POINT;
  const end = destination ?? DEFAULT_POINT;
  const candidates = stops.filter((stop) => stop.coordinates?.lat && stop.coordinates?.lng);
  const best = permutations(candidates)
    .map((sequence) => {
      const legs = [];
      let cursor = start;
      let distanceKm = 0;

      sequence.forEach((stop) => {
        const legDistance = haversineKm(cursor, stop.coordinates);
        distanceKm += legDistance;
        legs.push({
          type: 'pickup',
          stopId: stop.id,
          from: cursor,
          to: stop.coordinates,
          distanceKm: legDistance,
          travelMinutes: (legDistance / averageSpeedKmh) * 60,
        });
        cursor = stop.coordinates;
      });

      const finalLeg = haversineKm(cursor, end);
      distanceKm += finalLeg;
      legs.push({
        type: 'dropoff',
        stopId: 'customer',
        from: cursor,
        to: end,
        distanceKm: finalLeg,
        travelMinutes: (finalLeg / averageSpeedKmh) * 60,
      });

      const travelMinutes = legs.reduce((sum, leg) => sum + leg.travelMinutes, 0);
      const pickupMinutes = sequence.length * handoverMinutes;
      return {
        sequence: sequence.map((stop) => stop.id),
        legs,
        distanceKm,
        travelMinutes,
        pickupMinutes,
        totalMinutes: travelMinutes + pickupMinutes,
      };
    })
    .sort((a, b) => a.totalMinutes - b.totalMinutes)[0];

  return (
    best ?? {
      sequence: [],
      legs: [],
      distanceKm: 0,
      travelMinutes: 0,
      pickupMinutes: 0,
      totalMinutes: 0,
    }
  );
};

/**
 * Interpolates the rider's position once they have set off, so the tracking
 * screen can show live movement without a maps SDK.
 *
 * @param {ReturnType<typeof buildRoute>} route
 * @param {number} elapsedMinutes minutes since the rider left the depot
 */
const positionAlongRoute = (route, elapsedMinutes) => {
  if (!route.legs.length) return null;
  let remaining = Math.max(0, elapsedMinutes);

  for (const leg of route.legs) {
    if (remaining <= leg.travelMinutes) {
      const ratio = leg.travelMinutes === 0 ? 1 : remaining / leg.travelMinutes;
      return {
        lat: leg.from.lat + (leg.to.lat - leg.from.lat) * ratio,
        lng: leg.from.lng + (leg.to.lng - leg.from.lng) * ratio,
        headingFrom: leg.from,
        headingTo: leg.to,
        currentLeg: leg,
        completedStops: route.legs.slice(0, route.legs.indexOf(leg)).filter((l) => l.type === 'pickup')
          .length,
      };
    }
    remaining -= leg.travelMinutes;
  }

  const last = route.legs[route.legs.length - 1];
  return {
    lat: last.to.lat,
    lng: last.to.lng,
    headingFrom: last.from,
    headingTo: last.to,
    currentLeg: last,
    completedStops: route.legs.filter((l) => l.type === 'pickup').length,
  };
};

const formatMinutes = (minutes) => `${Math.max(0, Math.round(minutes))} min`;

module.exports = {
  haversineKm,
  buildRoute,
  positionAlongRoute,
  formatMinutes,
  DEFAULT_AVERAGE_SPEED_KMH,
};
