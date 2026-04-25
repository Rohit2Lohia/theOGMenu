'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  ShieldCheck, 
  UserCircle, 
  ArrowLeft, 
  UtensilsCrossed,
  CheckCircle2
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { setTokens, setStoredUser, isAuthenticated } from '@/lib/auth';
import { cn } from '@/lib/utils';

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
      const isDev = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      if (isDev) {
        setStep('otp');
      } else {
        const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');

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
        const cleanPhone = phone.replace(/\D/g, '');
        firebaseToken = `dev_${cleanPhone}`;
      } else {
        const credential = await confirmationResult.confirm(otp);
        firebaseToken = await credential.user.getIdToken();
      }

      const response = await api.login(firebaseToken);
      setTokens(response.access_token, response.refresh_token);

      if (response.is_new_user) {
        setStep('profile');
      } else {
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden"
      >
        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary/20 mb-6"
            >
              <UtensilsCrossed size={32} />
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">{t('title')}</h1>
            <p className="text-gray-500 mt-2">{t('subtitle')}</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-10 px-4">
            <StepItem icon={Phone} active={step === 'phone'} done={['otp', 'profile'].includes(step)} />
            <div className="flex-1 h-[2px] bg-gray-100 mx-2" />
            <StepItem icon={ShieldCheck} active={step === 'otp'} done={step === 'profile'} />
            <div className="flex-1 h-[2px] bg-gray-100 mx-2" />
            <StepItem icon={UserCircle} active={step === 'profile'} done={false} />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 border border-red-100"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div key="phone" {...fadeInUp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t('phoneLabel')}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-100 pr-3">
                      <span className="text-sm font-bold text-gray-900">🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      className="w-full h-14 pl-24 pr-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl transition-all duration-200 outline-none text-lg font-bold tracking-wider"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleSendOTP}
                  disabled={loading || phone.length < 10}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t('sendOTP')}
                      <ArrowLeft className="rotate-180" size={20} />
                    </>
                  )}
                </button>
                <div id="recaptcha-container" />
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" {...fadeInUp} className="space-y-6 text-center">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t('otpLabel')}</label>
                  <input
                    type="text"
                    className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl transition-all duration-200 outline-none text-center text-3xl font-extrabold tracking-[1em] placeholder:tracking-normal placeholder:text-lg"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {t('otpSent')}: <span className="font-bold text-gray-700">+91 {phone}</span>
                  </p>
                </div>
                <button
                  className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl shadow-xl shadow-primary/20 transition-all duration-300 disabled:opacity-50"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    t('verifyOTP')
                  )}
                </button>
                <button 
                  className="text-sm font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-2 mx-auto"
                  onClick={() => setStep('phone')}
                >
                  <ArrowLeft size={16} />
                  Change Phone Number
                </button>
              </motion.div>
            )}

            {step === 'profile' && (
              <motion.div key="profile" {...fadeInUp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t('nameLabel')}</label>
                  <input
                    type="text"
                    className="w-full h-14 px-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl transition-all duration-200 outline-none text-lg font-bold"
                    placeholder={t('namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <button
                  className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl shadow-xl shadow-primary/20 transition-all duration-300 disabled:opacity-50"
                  onClick={handleSetupProfile}
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    t('setupProfile')
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function StepItem({ icon: Icon, active, done }: { icon: any; active: boolean; done: boolean }) {
  return (
    <div className="relative">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
        active ? "bg-primary text-white shadow-lg shadow-primary/20" : 
        done ? "bg-green-100 text-green-600" : "bg-gray-50 text-gray-400"
      )}>
        {done ? <CheckCircle2 size={24} /> : <Icon size={24} />}
      </div>
    </div>
  );
}
