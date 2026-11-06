import { useEffect, useState } from 'react';
import { emergencyTypes } from '../../mock/emergencies';
import { distanceKm } from '../../utils/geo';
import { getCrewVehicle } from '../../utils/crew';
import { useBooking } from '../../context/BookingContext';
import './Crew.scss';

const OFFER_SECONDS = 24;

function getOfferStart(tripId) {
  const key = `ambulance_crew_offer_${tripId}`;
  const saved = Number(sessionStorage.getItem(key));
  if (saved) return saved;
  const startedAt = Date.now();
  sessionStorage.setItem(key, String(startedAt));
  return startedAt;
}

export default function IncomingDispatch({ booking, onAccept, onDuty, location }) {
  const { updateBooking } = useBooking();
  const [secondsLeft, setSecondsLeft] = useState(OFFER_SECONDS);
  const emergency = emergencyTypes.find((item) => item.id === booking.type);
  const vehicle = getCrewVehicle();
  const pickupDistance = location && booking.pickup
    ? distanceKm([location.lat, location.lng], [booking.pickup.lat, booking.pickup.lng])
    : null;
  const unavailable = !onDuty || !location;
  const offerPassed = booking.crewOfferState === 'declined'
    || booking.crewOfferState === 'timed-out';

  useEffect(() => {
    if (booking.status !== 'requested' || booking.crewOfferState) return undefined;
    const expiresAt = getOfferStart(booking.tripId) + OFFER_SECONDS * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        updateBooking({ crewOfferState: 'timed-out', crewOfferPassedAt: Date.now() });
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [booking.crewOfferState, booking.status, booking.tripId, updateBooking]);

  const decline = () => {
    updateBooking({ crewOfferState: 'declined', crewOfferPassedAt: Date.now() });
  };

  return (
    <section className="crew-card crew-dispatch">
      <div className="crew-card__heading">
        <div>
          <p className="crew-page__eyebrow">NEW EMERGENCY</p>
          <h2>{emergency?.label || 'Emergency response'}</h2>
        </div>
        <span className={`crew-dispatch__timer ${secondsLeft <= 8 && !offerPassed ? 'is-urgent' : ''}`}>
          {offerPassed ? 'Passed' : `${secondsLeft}s`}
        </span>
      </div>

      <div className="crew-dispatch__metrics">
        <div>
          <strong>{pickupDistance === null ? '—' : `${pickupDistance.toFixed(1)} km`}</strong>
          <span>{pickupDistance === null ? 'GPS required' : 'Straight-line distance'}</span>
        </div>
        <div>
          <strong>{vehicle.type.replace(' Ambulance', '')}</strong>
          <span>Assigned unit</span>
        </div>
        <div>
          <strong>{booking.forWhom === 'other' ? 'Other' : 'Self'}</strong>
          <span>Request for</span>
        </div>
      </div>

      <div className="crew-dispatch__location">
        <span className="crew-dispatch__pin"><i className="bi bi-geo-alt-fill" /></span>
        <div>
          <strong>{booking.pickup?.name || 'Patient pickup'}</strong>
          <span>{booking.pickup?.address || 'Pickup location unavailable'}</span>
        </div>
      </div>
      <p className="crew-card__note">Trip ID · {booking.tripId}</p>

      {offerPassed ? (
        <p className="crew-dispatch__passed" role="status">
          <i className="bi bi-info-circle" />
          {booking.crewOfferState === 'declined'
            ? 'Passed back to dispatch. The citizen request remains open for another crew.'
            : 'Offer timed out. The citizen request remains open for another crew.'}
        </p>
      ) : (
        <>
          {pickupDistance !== null && booking.pickup?.lat && booking.pickup?.lng && (
            <a
              className="crew-trip-card__map-link"
              href={`https://www.google.com/maps/dir/?api=1&destination=${booking.pickup.lat},${booking.pickup.lng}&travelmode=driving`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-sign-turn-right" /> Navigate to pickup
            </a>
          )}
          <div className="crew-dispatch__actions">
            <button className="crew-dispatch__decline" onClick={decline}>
              Decline
            </button>
            <button className="crew-button" disabled={unavailable} onClick={onAccept}>
              <i className="bi bi-check2" />
              {!onDuty ? 'Go on duty to accept' : location ? 'Accept emergency' : 'Waiting for GPS'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
