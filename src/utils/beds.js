import { hospitals, defaultBeds, neededFacility } from '../mock/hospitals';
import { distanceKm } from './geo';

const KEY = 'ambulance_beds';

export function getBeds() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    // Start from the defaults, then apply anything saved. This way a
    // hospital missing from old saved data still gets its default beds.
    if (saved) return { ...defaultBeds, ...saved };
  } catch {
    // ignore and use the defaults
  }
  return defaultBeds;
}

// Nearest hospital to the patient that has a free bed this emergency needs.
// "from" is the patient's [lat, lng].
export function recommendHospital(typeId, from) {
  const beds = getBeds();
  const need = neededFacility[typeId] || 'icu';

  const byDistance = hospitals
    .map((h) => ({ ...h, km: distanceKm(from, [h.lat, h.lng]) }))
    .sort((a, b) => a.km - b.km);

  const withBed = byDistance.filter((h) => beds[h.id]?.[need] > 0);
  return withBed[0] || byDistance[0]; // if none has a bed, use the nearest
}