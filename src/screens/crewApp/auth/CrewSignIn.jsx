import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { APP_NAME, DEMO_OTP } from "../../../mock/app";
import {
  isValidIndianMobile,
  normalizeIndianMobile,
  sanitizeIndianMobileInput,
} from "../../../utils/phone";
import "./CrewSignIn.scss";

const OTP_LENGTH = 6;

export default function CrewSignIn() {
  const { login } = useAuth();

  const [step, setStep] = useState("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [shake, setShake] = useState(false);

  const otpRefs = useRef([]);
  const otpValue = otp.join("");

  // Resend cooldown timer
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const sendCode = (e) => {
    e.preventDefault();
    const digits = normalizeIndianMobile(phone);
    if (!name.trim()) return triggerError("Enter your name to continue.");
    if (!digits)
      return triggerError("Enter a valid Indian mobile number (10 digits starting with 6–9).");

    setError("");
    setLoading(true);
    // simulate network
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setResendIn(30);
      requestAnimationFrame(() => otpRefs.current[0]?.focus());
    }, 500);
  };

  const verifyCode = (e) => {
    e.preventDefault();
    if (otpValue.length !== OTP_LENGTH)
      return triggerError("Enter the full 6-digit code.");
    if (otpValue !== DEMO_OTP)
      return triggerError("That code is not correct. Please try again.");

    setError("");
    setLoading(true);
    setTimeout(() => {
      login(name.trim(), normalizeIndianMobile(phone), 'crew');
    }, 450);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit && value !== "") return;
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  };

  const resendCode = () => {
    if (resendIn > 0) return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setResendIn(30);
    otpRefs.current[0]?.focus();
  };

  const backToPhone = () => {
    setStep("phone");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
  };

  return (
    <main className="crew-signin">
      <div className="crew-signin__card-shell">
        <section className="crew-signin__hero" aria-hidden="true">
          <div className="crew-signin__glow crew-signin__" />
          <div className="crew-signin__glow crew-signin__glow--pink" />
          <div className="crew-signin__glow crew-signin__glow--green" />
          <div className="crew-signin__mark">
            <i className="bi bi-truck-front-fill" />
            <span>
              <i className="bi bi-plus-lg" />
            </span>
          </div>
        </section>

        <section className="crew-signin__panel">
          <form
            className={`crew-signin__card ${shake ? "is-shaking" : ""}`}
            onSubmit={step === "phone" ? sendCode : verifyCode}
            noValidate
          >
            <div className="crew-signin__card-head">
              <h1>
                {step === "phone"
                  ? `Welcome to ${APP_NAME}.`
                  : "Check your phone."}
              </h1>
              <p className="crew-signin__sub">
                {step === "phone"
                  ? "Sign in to access your crew dashboard."
                  : `Enter the 6-digit code sent to +91 ${phone}.`}
              </p>
            </div>

            {step === "phone" ? (
              <div className="crew-signin__fields">
                <label className="crew-signin__field" htmlFor="crew-name">
                  <span className="crew-signin__label">Full Name</span>
                  <div className="crew-signin__input">
                    <input
                      id="crew-name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      aria-invalid={!!error && !name.trim()}
                    />
                  </div>
                </label>

                <label className="crew-signin__field" htmlFor="crew-phone">
                  <span className="crew-signin__label">Mobile Number</span>
                  <div className="crew-signin__input">
                    <span className="crew-signin__prefix">+91</span>
                    <input
                      id="crew-phone"
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      maxLength={16}
                      value={phone}
                      onChange={(e) =>
                        setPhone(sanitizeIndianMobileInput(e.target.value))
                      }
                      placeholder="10-digit number"
                      aria-invalid={
                        !!error && !isValidIndianMobile(phone)
                      }
                    />
                  </div>
                </label>
              </div>
            ) : (
              <div
                className="crew-signin__otp-row"
                onPaste={handleOtpPaste}
                role="group"
                aria-label="6-digit verification code"
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    className="crew-signin__otp-box"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="crew-signin__error" role="alert">
                <i className="bi bi-exclamation-circle" aria-hidden="true" />{" "}
                {error}
              </p>
            )}

            {step === "otp" && (
              <>
                <p className="crew-signin__demo">
                  Demo code <strong>{DEMO_OTP}</strong>
                </p>
                <button
                  type="button"
                  className="crew-signin__resend"
                  onClick={resendCode}
                  disabled={resendIn > 0}
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                </button>
              </>
            )}

            <button
              className="crew-signin__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="crew-signin__spinner" aria-hidden="true" />
                  {step === "phone" ? "Sending…" : "Verifying…"}
                </>
              ) : (
                <>
                  {step === "phone" ? "Continue" : "Verify and sign in"}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </>
              )}
            </button>

            {step === "otp" && (
              <button
                className="crew-signin__back"
                type="button"
                onClick={backToPhone}
              >
                <i className="bi bi-arrow-left" aria-hidden="true" /> Change
                mobile number
              </button>
            )}

            {step === "phone" && (
              <p className="crew-signin__switch">
                New to {APP_NAME}? <Link to="/citizen">Citizen sign in</Link>
              </p>
            )}
          </form>

          <p className="crew-signin__footer">
            <i className="bi bi-shield-lock" aria-hidden="true" /> Secure crew
            sign in
          </p>
        </section>
      </div>
    </main>
  );
}
