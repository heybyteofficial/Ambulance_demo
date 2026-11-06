import { emergencyTypes } from '../mock/emergencies';
import { hospitals } from '../mock/hospitals';
import { distanceKm } from './geo';
const KEY = 'ambulance_trips';

export function getTrips() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('ambulance_trips_updated'));
}

export function addTrip(trip) {
  const list = [{ ...trip, id: Date.now(), createdAt: Date.now(), status: 'booked' }, ...getTrips()];
  save(list);
  return list;
}
// Saves a finished SOS trip so it shows under "Your trips"
export function addCompletedTrip(booking) {
  const list = getTrips();
  // Both the driver and the citizen can finish a trip, so never save it twice
  if (list.some((t) => t.tripId === booking.tripId)) return list;

  const label = emergencyTypes.find((t) => t.id === booking.type)?.label;
  const hospital = hospitals.find((item) => item.id === booking.hospitalId);
  const ambulance = booking.ambulance;
  const pickup = booking.pickup;
  const approximateDistanceKm = ambulance && pickup && hospital
    ? distanceKm([ambulance.lat, ambulance.lng], [pickup.lat, pickup.lng])
      + distanceKm([pickup.lat, pickup.lng], [hospital.lat, hospital.lng])
    : null;
  const trip = {
    id: Date.now(),
    createdAt: Date.now(),
    completedAt: Date.now(),
    kind: 'emergency',
    status: 'completed',
    tripId: booking.tripId,
    title: label ? `Emergency · ${label}` : 'Emergency trip',
    pickup: booking.pickup?.address || '',
    destination: booking.hospital,
    driver: booking.ambulance
      ? `${booking.ambulance.driver} · ${booking.ambulance.number}`
      : '',
    responseMinutes: booking.acceptedAt && booking.requestedAt
      ? Math.max(0, (booking.acceptedAt - booking.requestedAt) / 60000)
      : null,
    approximateDistanceKm,
    whenText: new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }),
  };

  const next = [trip, ...list];
  save(next);
  return next;
}
export function cancelTrip(id) {
  const list = getTrips().map((t) =>
    t.id === id ? { ...t, status: 'cancelled' } : t
  );
  save(list);
  return list;
}