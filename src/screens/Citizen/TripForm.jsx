import { useState } from 'react';
import { hospitals } from '../../mock/hospitals';
import { user } from '../../mock/user';
import { tripKinds, scheduledPurposes, vehicleNeeds } from '../../mock/trips';
import { addTrip } from '../../utils/trips';
import './TripForm.scss';

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

export default function TripForm({ kind, onBack, onSaved }) {
  const info = tripKinds[kind];
  const isScheduled = kind === 'scheduled';
  const isMortuary = kind === 'mortuary';

  const [f, setF] = useState({
        purpose: scheduledPurposes[0],
    other: '',
    need: vehicleNeeds[0],
    patient: '',
    phone: '',
    pickup: isMortuary ? '' : user.address,
    destination: '',
    when: 'now', // 'now' or 'later' (scheduled trips are always 'later')
    date: today(),
    time: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const set = (key) => (e) => setF({ ...f, [key]: e.target.value });
  const later = isScheduled || f.when === 'later';

  const submit = () => {
    const phone = f.phone.replace(/\D/g, '');
    if (isScheduled && f.purpose === 'Others' && !f.other.trim()) {
      return setError('Please specify the reason.');
    }
    if (!f.patient.trim()) return setError('Please enter the name.');
    if (phone.length !== 10) return setError('Enter a 10-digit phone number.');
    if (!f.pickup.trim()) return setError('Please enter the pick-up location.');
    if (!f.destination.trim()) return setError('Please enter the destination.');

    let whenText = 'As soon as possible';
    if (later) {
      if (!f.date || !f.time) return setError('Please choose a date and time.');
      const when = new Date(`${f.date}T${f.time}`);
      if (when < new Date()) return setError('The date and time must be in the future.');
      whenText = when.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    addTrip({
      kind,
          title: isScheduled
        ? (f.purpose === 'Others' ? f.other.trim() : f.purpose)
        : info.title,
      patient: f.patient.trim(),
      phone,
      pickup: f.pickup.trim(),
      destination: f.destination.trim(),
      need: isScheduled ? f.need : null,
      notes: f.notes.trim(),
      whenText,
      whenAt: later ? new Date(`${f.date}T${f.time}`).getTime() : null,
    });
    onSaved();
  };

  return (
       <div className="tf">
      <div className="tf__head">
        <button className="tf__back" onClick={onBack}>
          <i className="bi bi-chevron-left" />
        </button>
        <div className="tf__icon"><i className={`bi ${info.icon}`} /></div>
        <div>
          <h1>{info.title}</h1>
          <p>{info.desc}</p>
        </div>
      </div>

      {isScheduled && (
        <>
          <label>Reason for the trip</label>
          <select value={f.purpose} onChange={set('purpose')}>
            {scheduledPurposes.map((p) => <option key={p}>{p}</option>)}
          </select>
                    {f.purpose === 'Others' && (
            <input
              value={f.other}
              onChange={set('other')}
              placeholder="Please specify the reason"
            />
          )}
        </>
      )}

      <label>{isMortuary ? 'Name of the deceased' : 'Patient name'}</label>
      <input value={f.patient} onChange={set('patient')} placeholder="Full name" />

      <label>{isMortuary ? 'Contact person’s phone' : 'Contact phone'}</label>
      <input
        value={f.phone}
        onChange={set('phone')}
        placeholder="10-digit number"
        inputMode="numeric"
      />

      <label>{isMortuary ? 'Pick-up location (hospital or home)' : 'Pick-up address'}</label>
      <input value={f.pickup} onChange={set('pickup')} placeholder="Address" />

      <label>{isMortuary ? 'Drop location' : 'Destination hospital'}</label>
      <input
        value={f.destination}
        onChange={set('destination')}
        placeholder={isMortuary ? 'Home, cremation or burial ground' : 'Hospital name'}
        list={isMortuary ? undefined : 'hospital-list'}
      />
      <datalist id="hospital-list">
        {hospitals.map((h) => <option key={h.id} value={h.name} />)}
      </datalist>

      {isScheduled && (
        <>
          <label>The patient will need</label>
          <select value={f.need} onChange={set('need')}>
            {vehicleNeeds.map((n) => <option key={n}>{n}</option>)}
          </select>
        </>
      )}

      {!isScheduled && (
        <>
          <label>When do you need it?</label>
          <div className="tf__toggle">
            <button
              className={f.when === 'now' ? 'tf__toggle--on' : ''}
              onClick={() => setF({ ...f, when: 'now' })}
            >
              As soon as possible
            </button>
            <button
              className={f.when === 'later' ? 'tf__toggle--on' : ''}
              onClick={() => setF({ ...f, when: 'later' })}
            >
              Schedule for later
            </button>
          </div>
        </>
      )}

      {later && (
        <div className="tf__row">
          <div>
            <label>Date</label>
            <input type="date" min={today()} value={f.date} onChange={set('date')} />
          </div>
          <div>
            <label>Time</label>
            <input type="time" value={f.time} onChange={set('time')} />
          </div>
        </div>
      )}

      <label>Notes (optional)</label>
      <input value={f.notes} onChange={set('notes')} placeholder="Anything the driver should know" />

      {error && <p className="tf__error">{error}</p>}

      <button className="tf__submit" onClick={submit}>
        {later ? 'Book trip' : 'Request now'}
      </button>
    </div>
  );
}