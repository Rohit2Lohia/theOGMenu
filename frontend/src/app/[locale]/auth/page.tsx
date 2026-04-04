'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { setTokens, setStoredUser, isAuthenticated } from '@/lib/auth';
import styles from './page.module.css';

type AuthStep = 'phone' | 'otp' | 'profile';

export default function AuthPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In development mode, skip Firebase and use mock
      const isDev = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      if (isDev) {
        // Dev mode: skip real OTP
        setStep('otp');
      } else {
        // Production: use Firebase phone auth
        const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');

        // Create recaptcha verifier
        const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });

        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
        setConfirmationResult(result);
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let firebaseToken: string;

      const isDev = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      if (isDev) {
        // Dev mode: use mock token
        const cleanPhone = phone.replace(/\D/g, '');
        firebaseToken = `dev_${cleanPhone}`;
      } else {
        // Production: verify OTP with Firebase
        const credential = await confirmationResult.confirm(otp);
        firebaseToken = await credential.user.getIdToken();
      }

      // Exchange Firebase token for our JWT
      const response = await api.login(firebaseToken);

      setTokens(response.access_token, response.refresh_token);

      if (response.is_new_user) {
        setStep('profile');
      } else {
        // Get user data
        const user = await api.getMe(response.access_token);
        setStoredUser(user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleSetupProfile = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { getAccessToken } = await import('@/lib/auth');
      const token = getAccessToken()!;
      const user = await api.updateProfile(token, { name: name.trim() });
      setStoredUser(user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg}>
        <div className={styles.authGlow} />
      </div>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Logo */}
          <div className={styles.authLogo}>
            <span className={styles.authLogoIcon}>🍽️</span>
            <h1 className={styles.authTitle}>{t('title')}</h1>
            <p className={styles.authSubtitle}>{t('subtitle')}</p>
          </div>

          {/* Step Indicator */}
          <div className={styles.steps}>
            <div className={`${styles.step} ${step === 'phone' ? styles.stepActive : ''} ${['otp', 'profile'].includes(step) ? styles.stepDone : ''}`}>
              <div className={styles.stepDot}>1</div>
              <span>Phone</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step === 'otp' ? styles.stepActive : ''} ${step === 'profile' ? styles.stepDone : ''}`}>
              <div className={styles.stepDot}>2</div>
              <span>Verify</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step === 'profile' ? styles.stepActive : ''}`}>
              <div className={styles.stepDot}>3</div>
              <span>Profile</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.error}>{error}</div>
          )}

          {/* Phone Step */}
          {step === 'phone' && (
            <div className={styles.authForm}>
              <div className="input-group">
                <label className="input-label">{t('phoneLabel')}</label>
                <div className={styles.phoneInput}>
                  <span className={styles.phonePrefix}>🇮🇳 +91</span>
                  <input
                    id="phone-input"
                    type="tel"
                    className="input"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>
              <button
                id="send-otp-btn"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
              >
                {loading ? <span className="spinner" /> : t('sendOTP')}
              </button>
              <div id="recaptcha-container" />
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className={styles.authForm}>
              <p className={styles.otpSentMsg}>
                {t('otpSent')}: <strong>+91 {phone}</strong>
              </p>
              <div className="input-group">
                <label className="input-label">{t('otpLabel')}</label>
                <input
                  id="otp-input"
                  type="text"
                  className={`input ${styles.otpInput}`}
                  placeholder={t('otpPlaceholder')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button
                id="verify-otp-btn"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? <span className="spinner" /> : t('verifyOTP')}
              </button>
              <button className="btn btn-ghost" onClick={() => setStep('phone')}>
                ← {t('resendOTP')}
              </button>
            </div>
          )}

          {/* Profile Step */}
          {step === 'profile' && (
            <div className={styles.authForm}>
              <div className="input-group">
                <label className="input-label">{t('nameLabel')}</label>
                <input
                  id="name-input"
                  type="text"
                  className="input"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                id="setup-profile-btn"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleSetupProfile}
                disabled={loading || !name.trim()}
              >
                {loading ? <span className="spinner" /> : t('setupProfile')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
