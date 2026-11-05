import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TripForm from './TripForm';
import { tripKinds } from '../../mock/trips';
import { getTrips, cancelTrip } from '../../utils/trips';
import './Trips.scss';
const STATUS_TEXT = {
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
export default function Trips() {
  const navigate = useNavigate();
  const [kind, setKind] = useState(null); // which form is open
  const [trips, setTrips] = useState(getTrips);
  const [banner, setBanner] = useState('');

  const handleSaved = () => {
    setTrips(getTrips());
    setKind(null);
    setBanner('Your trip has been booked.');
    setTimeout(() => setBanner(''), 4000);
  };

  const handleCancel = (id) => {
    if (window.confirm('Cancel this trip?')) setTrips(cancelTrip(id));
  };

  if (kind) {
    return <TripForm kind={kind} onBack={() => setKind(null)} onSaved={handleSaved} />;
  }

  return (
    <div className="trips">
      <h1>Trips</h1>
      <p className="trips__sub">Book a non-emergency or special ambulance trip.</p>

      {banner && <div className="trips__banner"><i className="bi bi-check-circle-fill" /> {banner}</div>}

      <button className="trips__sos" onClick={() => navigate('/citizen')}>
        <i className="bi bi-exclamation-triangle-fill" />
        <span>In an emergency? Use the SOS button instead.</span>
      </button>

      <div className="kinds">
        {Object.entries(tripKinds).map(([key, k]) => (
          <button className="kinds__item" key={key} onClick={() => setKind(key)}>
            <span className="kinds__icon"><i className={`bi ${k.icon}`} /></span>
            <span className="kinds__text">
              <strong>{k.title}</strong>
              <small>{k.desc}</small>
            </span>
            <i className="bi bi-chevron-right" />
          </button>
        ))}
      </div>

      <h2 className="trips__heading">Your trips</h2>

      {trips.length === 0 && <p className="trips__empty">No trips booked yet.</p>}

      {trips.map((t) => (
     <div className={`trip trip--${t.status}`} key={t.id}>
          <div className="trip__top">
            <h4>{t.title}</h4>
            <span className="trip__status">
           {STATUS_TEXT[t.status]}
            </span>
          </div>
          <p><i className="bi bi-clock-fill" /> {t.whenText}</p>
         {t.tripId && <p><i className="bi bi-hash" /> {t.tripId}</p>}
{t.patient && <p><i className="bi bi-person-fill" /> {t.patient}</p>}
{t.driver && <p><i className="bi bi-person-badge-fill" /> {t.driver}</p>}
          <p><i className="bi bi-geo-alt-fill" /> {t.pickup}</p>
          <p><i className="bi bi-flag-fill" /> {t.destination}</p>
          {t.need && <p><i className="bi bi-universal-access" /> {t.need}</p>}

          {t.status === 'booked' && (
            <button className="trip__cancel" onClick={() => handleCancel(t.id)}>
              Cancel trip
            </button>
          )}
        </div>
      ))}
    </div>
  );
}