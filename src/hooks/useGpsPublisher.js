import { useEffect, useState } from 'react';

const KEY = 'ambulance_crew_location';

export function getCrewLocation() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

function ageOf(loc) {
  return loc ? Math.max(0, Math.round((Date.now() - loc.at) / 1000)) : null;
}

// Used on the citizen screen: seconds since the driver's last GPS update
export function useDriverLocationAge() {
  const [age, setAge] = useState(() => ageOf(getCrewLocation()));

  useEffect(() => {
    const id = setInterval(() => setAge(ageOf(getCrewLocation())), 1000);
    return () => clearInterval(id);
  }, []);

  return age;
}
