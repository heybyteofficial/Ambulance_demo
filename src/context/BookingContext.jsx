import { createContext, useContext, useEffect, useState } from 'react';
import { recommendHospital } from '../utils/beds';
import { getPickup } from '../utils/dispatch';
import { getProfile } from '../utils/profile';
import { addCompletedTrip } from '../utils/trips';
const KEY = 'ambulance_booking';
const BookingContext = createContext(null);

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState(read);

  // When ANOTHER tab changes the booking, update this tab too
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setBooking(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const save = (value) => {
    setBooking(value);
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
  };

   const createBooking = ({ type, forWhom }) => {
    const pickup = getPickup();
    const hospital = recommendHospital(type, [pickup.lat, pickup.lng]);
    const profile = getProfile();
    const d = new Date();
    const tripId = `RJY-${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getFullYear()).slice(2)}-${Math.floor(1000 + Math.random() * 9000)}`;

    save({
      type,
      forWhom,
      status: 'requested',
      tripId,
      requestedAt: Date.now(),
      hospital: hospital.name,
      hospitalId: hospital.id,
      pickup: {
        id: pickup.id,
        name: pickup.name,
        address: pickup.address,
        lat: pickup.lat,
        lng: pickup.lng,
      },
      ambulance: null,
      notified: profile.contacts.map((c) => c.name),
      abha: profile.abha,
    });
  };

  const clearBooking = () => save(null);
  // Trip finished: keep it in "Your trips", then clear the live booking
  const completeBooking = () => {
    const latest = read();
    if (latest && latest.status === 'hospital') addCompletedTrip(latest);
    save(null);
  };
  return (
    <BookingContext.Provider
      value={{ booking, createBooking, completeBooking, clearBooking }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}