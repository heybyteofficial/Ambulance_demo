import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME, DEMO_OTP } from '../../mock/app';
import './SignIn.scss';

export default function SignIn() {
  const { login } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const sendCode = () => {
    const digits = phone.replace(/\D/g, '');
    if (!name.trim()) return setError('Please enter your name.');
    if (digits.length !== 10) return setError('Enter a 10-digit mobile number.');
    setError('');
    setStep('otp');
  };

  const verify = () => {
    if (otp !== DEMO_OTP) return setError('Wrong code. Please try again.');
    login(name.trim(), phone.replace(/\D/g, ''), 'citizen');
  };

  return (
    <div className="signin">
      <div className="signin__top">
        <div className="signin__logo"><i className="bi bi-truck-front-fill" /></div>
        <h1>{APP_NAME}</h1>
        <p>Book an ambulance in seconds.</p>
      </div>

      <div className="signin__card">
        {step === 'phone' && (
          <>
            <h2>Sign in</h2>

            <label>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />

            <label>Mobile number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              inputMode="numeric"
              maxLength={10}
            />

            {error && <p className="signin__error">{error}</p>}
            <button className="signin__btn" onClick={sendCode}>Send code</button>
            <Link className="signin__link" to="/">Crew sign in</Link>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2>Enter the code</h2>
            <p className="signin__hint">We sent a 6-digit code to +91 {phone}.</p>

            <input
              className="signin__otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="······"
              inputMode="numeric"
              maxLength={6}
            />

            <p className="signin__demo">Demo mode: your code is <strong>{DEMO_OTP}</strong></p>

            {error && <p className="signin__error">{error}</p>}
            <button className="signin__btn" onClick={verify}>Verify and continue</button>
            <button className="signin__link" onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}