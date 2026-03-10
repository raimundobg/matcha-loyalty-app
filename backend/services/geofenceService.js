// MatchaLab - General Salvo 20, Taller 1, Providencia, Santiago, Chile
// Coordinates from Google Maps: General Salvo 20, Metro Salvador area
const MATCHALAB_LAT = -33.433258;
const MATCHALAB_LNG = -70.62544;
const GEOFENCE_RADIUS_M = 400; // 400 meters

/**
 * Haversine formula to calculate distance between two coordinates in meters.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check if coordinates are within geofence radius of MatchaLab.
 */
export function isWithinGeofence(lat, lng) {
  const distance = haversineDistance(lat, lng, MATCHALAB_LAT, MATCHALAB_LNG);
  return { within: distance <= GEOFENCE_RADIUS_M, distance: Math.round(distance) };
}

/**
 * Check if current time in Santiago is within notification hours (8am-9pm).
 */
export function isNotifyHour() {
  const hour = parseInt(
    new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  return hour >= 8 && hour < 21;
}

/**
 * Build a personalized proximity message based on ticket count.
 */
export function buildProximityMessage(username, ticketCount) {
  const remaining = 3 - ticketCount;
  if (ticketCount >= 3) {
    return {
      title: "¡Tu matcha gratis te espera!",
      body: `${username}, estás cerca de MatchaLab y tienes un matcha gratis listo para canjear.`,
    };
  }
  if (ticketCount === 2) {
    return {
      title: "¡Estás a 1 compra de tu matcha gratis!",
      body: `${username}, pasa por MatchaLab. Solo te falta 1 punto para tu matcha gratis.`,
    };
  }
  return {
    title: "¡Estás cerca de MatchaLab!",
    body: `${username}, te faltan ${remaining} puntos para tu matcha gratis. ¡Pasa a vernos!`,
  };
}
