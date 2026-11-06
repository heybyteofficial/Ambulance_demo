const VEHICLE_KEY = 'ambulance_crew_vehicle';

export const DEFAULT_VEHICLE = {
  registration: 'AP 05 UB 1234',
  type: 'BLS Ambulance',
  callSign: 'Unit 01',
  checks: {
    fuel: true,
    oxygen: true,
    firstAid: true,
    stretcher: true,
  },
};

export function getCrewVehicle() {
  try {
    const saved = JSON.parse(localStorage.getItem(VEHICLE_KEY));
    return {
      ...DEFAULT_VEHICLE,
      ...saved,
      checks: { ...DEFAULT_VEHICLE.checks, ...saved?.checks },
    };
  } catch {
    return DEFAULT_VEHICLE;
  }
}

export function saveCrewVehicle(vehicle) {
  localStorage.setItem(VEHICLE_KEY, JSON.stringify(vehicle));
}

export function getCrewAmbulance(user, vehicle, location) {
  if (!location) return null;
  return {
    driver: user?.name || 'Crew member',
    phone: user?.phone || '',
    number: vehicle.registration,
    lat: location.lat,
    lng: location.lng,
  };
}

export const TRIP_STATUS = {
  requested: 'New request',
  accepted: 'En route to patient',
  reached: 'At pickup',
  picked: 'Transporting patient',
  hospital: 'Trip complete',
};

export const NEXT_TRIP_STATUS = {
  accepted: { next: 'reached', label: 'Arrived at pickup' },
  reached: { next: 'picked', label: 'Patient on board' },
  picked: { next: 'hospital', label: 'Arrived at hospital' },
};
