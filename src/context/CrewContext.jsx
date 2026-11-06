import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { CrewContext } from './CrewContextStore';

const DUTY_KEY = 'ambulance_crew_duty';
const LOCATION_KEY = 'ambulance_crew_location';
function readLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_KEY));
    return saved?.at && Date.now() - saved.at <= 30000 ? saved : null;
  } catch {
    return null;
  }
}

export function CrewProvider({ children }) {
  const { user } = useAuth();
  const [onDuty, setOnDutyState] = useState(() => localStorage.getItem(DUTY_KEY) === 'true');
  const [location, setLocation] = useState(readLocation);
  const [locationError, setLocationError] = useState('');
  const geolocationUnsupported = !navigator.geolocation;

  const setOnDuty = (next) => {
    const nextDuty = typeof next === 'function' ? next(onDuty) : next;
    setLocationError('');
    if (nextDuty && !onDuty) setLocation(null);
    setOnDutyState(nextDuty);
  };

  useEffect(() => {
    if (user?.role !== 'crew' || !onDuty) return undefined;
    if (geolocationUnsupported) return undefined;
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const next = {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          at: Date.now(),
        };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(next));
        setLocation(next);
        setLocationError('');
      },
      (error) => {
        const message = {
          1: 'Allow location access in your browser to share your live position.',
          2: 'Your location is unavailable. Check your device location settings.',
          3: 'Location request timed out. Keep duty on and try again.',
        }[error.code] || 'Unable to access your location.';
        setLocationError(message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [geolocationUnsupported, onDuty, user?.role]);

  useEffect(() => {
    localStorage.setItem(DUTY_KEY, String(onDuty));
  }, [onDuty]);

  useEffect(() => {
    const syncLocation = (event) => {
      if (event.key === LOCATION_KEY) setLocation(readLocation());
      if (event.key === DUTY_KEY) setOnDutyState(event.newValue === 'true');
    };
    const syncDemoSeed = () => {
      setLocation(readLocation());
      setOnDutyState(localStorage.getItem(DUTY_KEY) === 'true');
    };
    window.addEventListener('storage', syncLocation);
    window.addEventListener('ambulance_crew_demo_seeded', syncDemoSeed);
    return () => {
      window.removeEventListener('storage', syncLocation);
      window.removeEventListener('ambulance_crew_demo_seeded', syncDemoSeed);
    };
  }, []);

  return (
    <CrewContext.Provider
      value={{
        onDuty,
        setOnDuty,
        location,
        locationError: geolocationUnsupported && onDuty
          ? 'Location is not supported by this browser.'
          : locationError,
      }}
    >
      {children}
    </CrewContext.Provider>
  );
}
