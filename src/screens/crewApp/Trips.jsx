import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useCrew } from '../../hooks/useCrew';
import { getTrips } from '../../utils/trips';
import IncomingDispatch from './IncomingDispatch';
import PatientHandoff from './PatientHandoff';
import {
  getCrewAmbulance,
  getCrewVehicle,
  NEXT_TRIP_STATUS,
  TRIP_STATUS,
} from '../../utils/crew';
import './Crew.scss';

function TripActions({ booking }) {
  const { user } = useAuth();
  const { onDuty, location } = useCrew();
  const { updateBooking, completeBooking } = useBooking();
  const vehicle = getCrewVehicle();

  if (booking.status === 'requested') {
    return (
      <IncomingDispatch
        booking={booking}
        onDuty={onDuty}
        location={location}
        onAccept={() => {
          const ambulance = getCrewAmbulance(user, vehicle, location);
          if (ambulance) {
            updateBooking({
              status: 'accepted',
              ambulance,
              acceptedAt: Date.now(),
              crewOfferState: null,
            });
          }
        }}
      />
    );
  }

  if (booking.status === 'picked') {
    return (
      <PatientHandoff
        booking={booking}
        onArrived={() => updateBooking({ status: 'hospital', arrivedAt: Date.now() })}
      />
    );
  }

  const next = NEXT_TRIP_STATUS[booking.status];
  if (next) {
    return (
      <button className="crew-button crew-button--small" onClick={() => updateBooking({ status: next.next })}>
        {next.label} <i className="bi bi-arrow-right" />
      </button>
    );
  }

  return (
    <button className="crew-button crew-button--small" onClick={completeBooking}>
      Close completed trip <i className="bi bi-check2" />
    </button>
  );
}

export default function Trips() {
  const { booking } = useBooking();
  const [history, setHistory] = useState(getTrips);
  const hasActiveTrip = booking && booking.status !== 'hospital';
  const destination = booking?.status === 'picked'
    ? encodeURIComponent(booking.hospital || '')
    : `${booking?.pickup?.lat},${booking?.pickup?.lng}`;
  const locationUrl = booking?.pickup
    ? `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
    : '';

  useEffect(() => {
    const syncTrips = () => setHistory(getTrips());
    const onStorage = (event) => {
      if (event.key === 'ambulance_trips') syncTrips();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('ambulance_trips_updated', syncTrips);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ambulance_trips_updated', syncTrips);
    };
  }, []);

  return (
    <main className="crew-page">
      <header className="crew-page__header">
        <div>
          <p className="crew-page__eyebrow">DISPATCH & HISTORY</p>
          <h1>Trips</h1>
          <p className="crew-page__muted">Manage assignments from dispatch.</p>
        </div>
        <span className="crew-page__header-icon"><i className="bi bi-clipboard2-pulse" /></span>
      </header>

      {hasActiveTrip && booking.status === 'requested' && (
        <TripActions booking={booking} />
      )}

      {hasActiveTrip && booking.status !== 'requested' && (
        <section className="crew-card crew-trip-card">
          <div className="crew-card__heading">
            <div>
              <p className="crew-page__eyebrow">CURRENT TRIP</p>
              <h2>{booking.tripId || 'Emergency response'}</h2>
            </div>
            <span className="crew-trip-status">{TRIP_STATUS[booking.status]}</span>
          </div>
          <div className="crew-trip-card__patient">
            <span className="crew-trip-card__patient-icon"><i className="bi bi-person-fill" /></span>
            <div>
              <strong>{booking.forWhom === 'other' ? 'Assisting another person' : 'Patient pickup'}</strong>
              <span>{booking.pickup?.address}</span>
            </div>
          </div>
          <div className="crew-trip-card__destination">
            <i className="bi bi-hospital" />
            <span>Suggested destination</span>
            <strong>{booking.hospital || 'Hospital to be confirmed'}</strong>
          </div>
          {locationUrl && (booking.status === 'accepted' || (booking.status === 'picked' && booking.hospitalAlertedAt)) && (
            <a className="crew-trip-card__map-link" href={locationUrl} target="_blank" rel="noreferrer">
              <i className="bi bi-sign-turn-right" />
              {booking.status === 'picked' ? 'Navigate to hospital' : 'Navigate to pickup'}
            </a>
          )}
          <TripActions booking={booking} />
        </section>
      )}

      {!hasActiveTrip && (
        <section className="crew-card crew-empty">
          <span className="crew-empty__icon"><i className="bi bi-clipboard2-check" /></span>
          <h2>{booking?.status === 'hospital' ? 'Trip completed' : 'All clear'}</h2>
          <p className="crew-page__muted">New patient assignments will appear here when dispatch sends them.</p>
          <Link className="crew-text-link" to="/">Back to duty</Link>
        </section>
      )}

      <section className="crew-history">
        <div className="crew-section-heading">
          <div><p className="crew-page__eyebrow">YOUR ACTIVITY</p><h2>Recent trips</h2></div>
          <span>{history.length}</span>
        </div>
        {history.length === 0 ? (
          <p className="crew-history__empty">Completed trips will appear here.</p>
        ) : history.map((trip) => (
          <article className="crew-history-item" key={trip.id}>
            <span className="crew-history-item__icon"><i className="bi bi-truck" /></span>
            <div className="crew-history-item__main">
              <strong>{trip.title || 'Ambulance trip'}</strong>
              <span>{trip.pickup || trip.whenText || 'Trip details'}</span>
            </div>
            <span className={`crew-history-item__status is-${trip.status}`}>{trip.status}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
