import { useMemo, useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { hospitals } from '../../mock/hospitals';
import { distanceKm } from '../../utils/geo';
import './Crew.scss';

const conditions = ['Stable', 'Serious', 'Critical'];

export default function PatientHandoff({ booking, onArrived }) {
  const { updateBooking } = useBooking();
  const [condition, setCondition] = useState(booking.patientCondition || 'Stable');
  const [bp, setBp] = useState(booking.vitals?.bp || '');
  const [pulse, setPulse] = useState(booking.vitals?.pulse || '');
  const [spo2, setSpo2] = useState(booking.vitals?.spo2 || '');
  const [hospitalId, setHospitalId] = useState(
    booking.hospitalId || hospitals[0]?.id || '',
  );
  const [saved, setSaved] = useState(Boolean(booking.hospitalAlertedAt));
  const [error, setError] = useState('');
  const nearbyHospitals = useMemo(() => hospitals
    .map((hospital) => ({
      ...hospital,
      distance: booking.pickup
        ? distanceKm([booking.pickup.lat, booking.pickup.lng], [hospital.lat, hospital.lng])
        : null,
    }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)), [booking.pickup]);

  const alertHospital = () => {
    const hospital = hospitals.find((item) => item.id === hospitalId);
    if (!hospital) {
      setError('Choose a receiving hospital before continuing.');
      return;
    }
    const updated = updateBooking({
      patientCondition: condition,
      vitals: { bp: bp.trim(), pulse: pulse.trim(), spo2: spo2.trim() },
      hospitalId: hospital.id,
      hospital: hospital.name,
      hospitalAlertedAt: Date.now(),
    });
    setSaved(Boolean(updated));
    setError(updated ? '' : 'This trip is no longer active. Refresh the screen and try again.');
  };

  return (
    <div className="crew-handoff">
      <div className="crew-section-heading">
        <div>
          <p className="crew-page__eyebrow">PATIENT HANDOFF</p>
          <h2>Condition & destination</h2>
        </div>
      </div>

      <fieldset className="crew-condition">
        <legend>Patient condition</legend>
        <div>
          {conditions.map((item) => (
            <button
              className={condition === item ? 'is-selected' : ''}
              type="button"
              key={item}
              aria-pressed={condition === item}
              onClick={() => {
                setCondition(item);
                setSaved(false);
                setError('');
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="crew-vitals">
        <label className="crew-form-field">
          <span>BP (optional)</span>
          <input value={bp} onChange={(event) => { setBp(event.target.value); setSaved(false); setError(''); }} placeholder="110/70" />
        </label>
        <label className="crew-form-field">
          <span>Pulse</span>
          <input type="number" min="0" max="300" value={pulse} onChange={(event) => { setPulse(event.target.value); setSaved(false); setError(''); }} placeholder="bpm" />
        </label>
        <label className="crew-form-field">
          <span>SpO₂ %</span>
          <input type="number" min="0" max="100" value={spo2} onChange={(event) => { setSpo2(event.target.value); setSaved(false); setError(''); }} placeholder="%" />
        </label>
      </div>

      <label className="crew-form-field crew-handoff__hospital">
        <span>Receiving hospital</span>
        <select
          value={hospitalId}
          onChange={(event) => {
            setHospitalId(event.target.value);
            setSaved(false);
            setError('');
          }}
        >
          {nearbyHospitals.map((hospital) => (
            <option value={hospital.id} key={hospital.id}>
              {hospital.name}{hospital.distance === null ? '' : ` · ${hospital.distance.toFixed(1)} km`}
            </option>
          ))}
        </select>
      </label>

      <button className="crew-button" type="button" onClick={alertHospital}>
        <i className={`bi ${saved ? 'bi-check2-circle' : 'bi-hospital'}`} />
        {saved ? 'Hospital pre-alert recorded' : 'Notify hospital & start transport'}
      </button>
      {saved && booking.hospitalAlertedAt && (
        <button className="crew-button crew-button--secondary" type="button" onClick={onArrived}>
          Arrived at hospital <i className="bi bi-arrow-right" />
        </button>
      )}
      {error && <p className="crew-inline-error" role="alert">{error}</p>}
      <p className="crew-card__note">
        {saved
          ? 'Pre-alert saved in this demo. No hospital is contacted automatically.'
          : 'Vitals are optional. The pre-alert is saved locally in this demo.'}
      </p>
    </div>
  );
}
