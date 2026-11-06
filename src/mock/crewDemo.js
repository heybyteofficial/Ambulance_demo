import { getCrewVehicle } from '../utils/crew';

const SEEDED_KEY = 'ambulance_crew_demo_seeded_v2';

const demoVehicle = {
  registration: 'AP 39 TA 1082',
  type: 'ALS Ambulance',
  callSign: 'Unit 01',
  checks: {
    fuel: true,
    oxygen: true,
    firstAid: true,
    stretcher: true,
  },
};

function createDemoBooking(now) {
  return {
    type: 'accident',
    forWhom: 'other',
    status: 'requested',
    tripId: 'RJY-DEMO-0418',
    requestedAt: now,
    hospital: 'Government District Hospital',
    hospitalId: 'govt',
    pickup: {
      id: 'bus-stand',
      name: 'Main Bus Stand',
      address: 'Main Bus Stand, Gandhipuram, Rajahmundry',
      lat: 17.0009872,
      lng: 81.7894583,
    },
    ambulance: null,
    notified: [],
    abha: null,
    crewOfferState: null,
    isDemo: true,
  };
}

function createDemoTrips(now, crew, vehicle) {
  const today = new Date(now);
  const timeText = (minutesAgo) => new Date(now - minutesAgo * 60000).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  return [
    {
      id: 'crew-demo-trip-1',
      kind: 'emergency',
      status: 'completed',
      tripId: 'RJY-0511-2041',
      title: 'Emergency · Accident',
      pickup: 'Prakash Nagar, Rajahmundry',
      destination: 'Government District Hospital',
      driver: `${crew?.name || 'Demo Crew'} · ${vehicle.registration}`,
      createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 12).getTime(),
      completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 54).getTime(),
      responseMinutes: 4.3,
      approximateDistanceKm: 8.2,
      whenText: timeText(210),
    },
    {
      id: 'crew-demo-trip-2',
      kind: 'emergency',
      status: 'completed',
      tripId: 'RJY-0511-1928',
      title: 'Emergency · Breathing problem',
      pickup: 'Morampudi, Rajahmundry',
      destination: 'Sri Ganga Emergency & Multispeciality Hospital',
      driver: `${crew?.name || 'Demo Crew'} · ${vehicle.registration}`,
      createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 5).getTime(),
      completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 47).getTime(),
      responseMinutes: 6.1,
      approximateDistanceKm: 12.4,
      whenText: timeText(455),
    },
    {
      id: 'crew-demo-trip-3',
      kind: 'scheduled',
      status: 'booked',
      title: 'Scheduled · Hospital discharge',
      patient: 'Anitha Rao',
      phone: '9876543210',
      pickup: 'Government District Hospital',
      destination: 'Danavai Peta, Rajahmundry',
      need: 'Wheelchair',
      whenText: 'Today, 8:00 pm',
      whenAt: now + 2 * 60 * 60 * 1000,
      createdAt: now - 30 * 60 * 1000,
    },
  ];
}

export function seedCrewDemoData(crew) {
  if (localStorage.getItem(SEEDED_KEY) === 'true') return false;

  const now = Date.now();
  if (localStorage.getItem('ambulance_crew_vehicle') === null) {
    localStorage.setItem('ambulance_crew_vehicle', JSON.stringify(demoVehicle));
  }
  const vehicle = getCrewVehicle();
  if (localStorage.getItem('ambulance_crew_duty') === null) {
    localStorage.setItem('ambulance_crew_duty', 'true');
  }
  if (localStorage.getItem('ambulance_crew_location') === null) {
    localStorage.setItem('ambulance_crew_location', JSON.stringify({
      lat: 17.0069172,
      lng: 81.7830503,
      accuracy: 18,
      at: now,
      source: 'demo',
    }));
  }
  const savedBooking = localStorage.getItem('ambulance_booking');
  const parsedBooking = savedBooking === null ? null : JSON.parse(savedBooking);
  if (savedBooking === null || parsedBooking === null) {
    localStorage.setItem('ambulance_booking', JSON.stringify(createDemoBooking(now)));
  }
  const savedTrips = localStorage.getItem('ambulance_trips');
  const parsedTrips = savedTrips === null ? null : JSON.parse(savedTrips);
  if (savedTrips === null || (Array.isArray(parsedTrips) && parsedTrips.length === 0)) {
    localStorage.setItem('ambulance_trips', JSON.stringify(createDemoTrips(now, crew, vehicle)));
  }

  localStorage.setItem(SEEDED_KEY, 'true');
  return true;
}
