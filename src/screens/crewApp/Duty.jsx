import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useCrew } from '../../hooks/useCrew';
import { getTrips } from '../../utils/trips';
import LiveMap from './LiveMap';
import IncomingDispatch from './IncomingDispatch';
import PatientHandoff from './PatientHandoff';
import {
  getCrewAmbulance,
  getCrewVehicle,
  NEXT_TRIP_STATUS,
  TRIP_STATUS,
} from '../../utils/crew';
import './Crew.scss';

const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
});

const readinessChecks = [
  { id: 'oxygen', label: 'Oxygen supply' },
  { id: 'fuel', label: 'Fuel and vehicle check' },
  { id: 'firstAid', label: 'First aid kit' },
  { id: 'stretcher', label: 'Stretcher and wheelchair' },
];

export default function Duty() {
  const { user } = useAuth();
  const { booking, updateBooking, completeBooking } = useBooking();
  const { onDuty, setOnDuty, location, locationError } = useCrew();
  const vehicle = getCrewVehicle();
  const nextStep = NEXT_TRIP_STATUS[booking?.status];
  const [trips, setTrips] = useState(getTrips);
  const [now, setNow] = useState(0);
  const readyCount = readinessChecks.filter((check) => vehicle.checks[check.id]).length;
  const shiftReady = readyCount === readinessChecks.length;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const completedToday = trips.filter((trip) => trip.status === 'completed'
    && (trip.completedAt || trip.createdAt || 0) >= startOfDay.getTime());
  const responseTimes = completedToday
    .map((trip) => trip.responseMinutes)
    .filter((minutes) => Number.isFinite(minutes));
  const averageResponseMinutes = responseTimes.length
    ? responseTimes.reduce((sum, minutes) => sum + minutes, 0) / responseTimes.length
    : null;
  const averageResponse = averageResponseMinutes === null
    ? '—'
    : averageResponseMinutes > 0 && averageResponseMinutes < 1
      ? '<1 min'
      : `${Math.round(averageResponseMinutes)} min`;
  const approximateDistance = completedToday.reduce((sum, trip) => sum + (trip.approximateDistanceKm || 0), 0);
  const scheduledTrip = trips
    .filter((trip) => trip.kind === 'scheduled' && trip.status === 'booked'
      && (!trip.whenAt || !now || trip.whenAt > now))
    .sort((a, b) => (a.whenAt || a.createdAt || 0) - (b.whenAt || b.createdAt || 0))[0];

  useEffect(() => {
    const syncTrips = () => setTrips(getTrips());
    const clockTimer = window.setTimeout(() => setNow(Date.now()), 0);
    window.addEventListener('ambulance_trips_updated', syncTrips);
    window.addEventListener('storage', syncTrips);
    return () => {
      window.clearTimeout(clockTimer);
      window.removeEventListener('ambulance_trips_updated', syncTrips);
      window.removeEventListener('storage', syncTrips);
    };
  }, []);

  const acceptTrip = () => {
    const ambulance = getCrewAmbulance(user, vehicle, location);
    if (!ambulance) return;
    updateBooking({
      status: 'accepted',
      ambulance,
      acceptedAt: Date.now(),
      crewOfferState: null,
    });
  };

  const pickupUrl = booking?.pickup
    ? `https://www.google.com/maps/dir/?api=1&destination=${booking.pickup.lat},${booking.pickup.lng}&travelmode=driving`
    : '';
  const hospitalUrl = booking?.hospitalId && booking.hospitalAlertedAt && booking.status === 'picked'
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.hospital)}&travelmode=driving`
    : '';

  return (
    <main className="crew-page">
      <header className="crew-page__header">
        <div>
          <p className="crew-page__eyebrow">SHIFT SUMMARY · {vehicle.callSign}</p>
          <h1>Duty</h1>
          <p className="crew-page__muted">Your shift at a glance.</p>
        </div>
        <span className={`crew-status ${onDuty ? 'is-on' : ''}`}>
          <i className="bi bi-circle-fill" /> {onDuty ? 'On duty' : 'Off duty'}
        </span>
      </header>

      <section className={`crew-duty-banner ${onDuty ? 'is-on' : ''}`}>
        <div className="crew-duty-banner__icon">
          <i className={`bi ${onDuty ? 'bi-broadcast-pin' : 'bi-moon-stars'}`} />
        </div>
        <div className="crew-duty-banner__copy">
          <strong>{onDuty ? 'You are available' : 'You are off duty'}</strong>
          <span>{onDuty ? 'Dispatch can send you new calls.' : 'Go on duty when you are ready to respond.'}</span>
        </div>
        <button
          className={`crew-switch ${onDuty ? 'is-on' : ''}`}
          role="switch"
          aria-checked={onDuty}
          aria-label={onDuty ? 'End duty' : 'Start duty'}
          onClick={() => setOnDuty((current) => !current)}
        >
          <span />
        </button>
      </section>

      <section className="crew-duty-stats" aria-label="Shift statistics">
        <div><strong>{completedToday.length}</strong><span>Trips today</span></div>
        <div><strong>{approximateDistance ? `${approximateDistance.toFixed(1)} km` : '—'}</strong><span>Approx. distance</span></div>
        <div><strong>{averageResponse}</strong><span>Avg. response</span></div>
      </section>

      <section className="crew-card crew-shift-checklist">
        <div className="crew-section-heading">
          <div><p className="crew-page__eyebrow">BEFORE EACH SHIFT</p><h2>Shift checklist</h2></div>
          <span className={shiftReady ? 'is-ready' : ''}>{shiftReady ? 'All OK' : `${readyCount}/${readinessChecks.length}`}</span>
        </div>
        {readinessChecks.map((check) => (
          <div className="crew-shift-check" key={check.id}>
            <i className={`bi ${vehicle.checks[check.id] ? 'bi-check-circle-fill is-ready' : 'bi-circle'}`} />
            <span>{check.label}</span>
            <strong>{vehicle.checks[check.id] ? 'Ready' : 'Check'}</strong>
          </div>
        ))}
        {!shiftReady && (
          <Link className="crew-text-link" to="/crew/vehicle">Complete vehicle checks</Link>
        )}
      </section>

      {scheduledTrip && (
        <section className="crew-card crew-scheduled-trip">
          <span className="crew-summary__icon"><i className="bi bi-calendar2-check" /></span>
          <div>
            <p className="crew-page__eyebrow">UPCOMING SCHEDULED TRIP</p>
            <strong>{scheduledTrip.title || 'Scheduled transport'}</strong>
            <span>{scheduledTrip.whenText} · {scheduledTrip.pickup} → {scheduledTrip.destination}</span>
          </div>
        </section>
      )}

      {booking?.status === 'requested' && (
        <IncomingDispatch
          booking={booking}
          onAccept={acceptTrip}
          onDuty={onDuty}
          location={location}
        />
      )}

      {booking && booking.status !== 'requested' && (
        <section className="crew-card crew-active-trip">
          <div className="crew-card__heading">
            <div>
              <p className="crew-page__eyebrow">ACTIVE ASSIGNMENT</p>
              <h2>{booking.tripId || 'Emergency response'}</h2>
            </div>
            <span className="crew-trip-status">{TRIP_STATUS[booking.status] || 'In progress'}</span>
          </div>
          <div className="crew-trip-route">
            <div className="crew-trip-route__line"><i /><i /></div>
            <div>
              <strong>{booking.pickup?.name || 'Patient pickup'}</strong>
              <span>{booking.pickup?.address}</span>
              <strong>{booking.hospital || 'Hospital destination'}</strong>
            </div>
          </div>
          {booking.requestedAt && (
            <p className="crew-card__note">Requested at {formatTime(booking.requestedAt)}</p>
          )}
          {booking.status === 'accepted' && pickupUrl && (
            <a className="crew-trip-card__map-link" href={pickupUrl} target="_blank" rel="noreferrer">
              <i className="bi bi-sign-turn-right" /> Navigate to pickup
            </a>
          )}
          {booking.status === 'picked' && hospitalUrl && (
            <a className="crew-trip-card__map-link" href={hospitalUrl} target="_blank" rel="noreferrer">
              <i className="bi bi-sign-turn-right" /> Navigate to hospital
            </a>
          )}
          {booking.status === 'picked' ? (
            <PatientHandoff
              booking={booking}
              onArrived={() => updateBooking({ status: 'hospital', arrivedAt: Date.now() })}
            />
          ) : nextStep ? (
            <button
              className="crew-button"
              onClick={() => updateBooking({ status: nextStep.next })}
            >
              {nextStep.label} <i className="bi bi-arrow-right" />
            </button>
          ) : (
            <button className="crew-button" onClick={completeBooking}>
              Close completed trip <i className="bi bi-check2" />
            </button>
          )}
        </section>
      )}

      <section className="crew-card crew-location-card">
        <div className="crew-card__heading">
          <div>
            <p className="crew-page__eyebrow">LIVE LOCATION</p>
            <h2>{onDuty && location ? 'Location sharing active' : 'Ambulance location'}</h2>
          </div>
          <span className={`crew-location-dot ${onDuty && location ? 'is-live' : ''}`} />
        </div>
        <LiveMap location={location} />
        {locationError ? (
          <p className="crew-inline-error"><i className="bi bi-exclamation-circle" /> {locationError}</p>
        ) : onDuty && location ? (
          <p className="crew-location-card__coords">
            <i className="bi bi-crosshair" />
            {location.source === 'demo' ? 'Demo location' : 'GPS updated'} {formatTime(location.at)}
            {location.accuracy ? ` · ±${Math.round(location.accuracy)}m` : ''}
          </p>
        ) : (
          <p className="crew-card__note">
            {location ? 'Last location saved. Go on duty to resume live sharing.' : 'Start duty and allow location access to share your live position.'}
          </p>
        )}
      </section>

      <section className="crew-summary-grid">
        <Link to="/crew/trips" className="crew-summary">
          <span className="crew-summary__icon"><i className="bi bi-clock-history" /></span>
          <span><strong>{booking && booking.status !== 'hospital' ? '1 active' : 'No active trips'}</strong><small>Trips</small></span>
          <i className="bi bi-chevron-right" />
        </Link>
        <Link to="/crew/vehicle" className="crew-summary">
          <span className="crew-summary__icon"><i className="bi bi-truck-front-fill" /></span>
          <span><strong>{vehicle.registration}</strong><small>{vehicle.type}</small></span>
          <i className="bi bi-chevron-right" />
        </Link>
      </section>
    </main>
  );
}
