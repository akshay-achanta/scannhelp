import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorState, setErrorState] = useState({ msg: '', key: 0 });
  const error = errorState.msg;
  const setError = useCallback((msg) => {
    setErrorState(prev => ({ msg, key: msg ? prev.key + 1 : prev.key }));
  }, []);
  const [warning, setWarning] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const timerRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorState.key]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds > 0) {
      timerRef.current = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [lockoutSeconds]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Extract wait minutes from a 429 error message
  const parseLockoutSeconds = (message) => {
    const match = message.match(/wait (\d+) minute/);
    if (match) return parseInt(match[1]) * 60;
    return 15 * 60; // default 15 min
  };

  const sendCode = async () => {
    setError('');
    setWarning('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const response = await api.forgotPassword(email);
      const remaining = response.attempts_remaining ?? null;
      setAttemptsRemaining(remaining);

      if (response.warning) {
        setWarning(response.warning);
      }

      setSuccessMessage(response.message || 'Verification code sent to your email.');
      setStep(2);
    } catch (err) {
      const msg = err.message || 'Failed to request password reset code.';
      if (err.status === 429 || msg.toLowerCase().includes('too many')) {
        const secs = parseLockoutSeconds(msg);
        setLockoutSeconds(secs);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    await sendCode();
  };

  const handleResendCode = async () => {
    if (lockoutSeconds > 0) return;
    await sendCode();
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setWarning('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await api.verifyResetCode(email, code);
      setSuccessMessage('Code verified successfully. Please enter a new password.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setWarning('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8 || password.length > 20) {
      setError('Password must be between 8 and 20 characters');
      return;
    }
    const isValidChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/.test(password);
    if (!isValidChars) {
      setError('Password can only contain letters, numbers, and special characters');
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasNumber) {
      setError('Password is not strong — it cannot be only letters, please add some numbers');
      return;
    }
    if (!hasLetter) {
      setError('Password is not strong — it cannot be only numbers, please add some letters');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(email, code, password, confirmPassword);
      setSuccessMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Enter Reset Code'}
            {step === 3 && 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 && 'Enter your email address to receive a 6-digit reset code'}
            {step === 2 && `We've sent a 6-digit verification code to ${email}. This code expires in 5 minutes.`}
            {step === 3 && 'Choose a strong password to protect your account'}
          </p>
        </div>

          {/* Lockout countdown banner */}
          {lockoutSeconds > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3 text-orange-700 text-sm">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Too many requests.</span> You can request a new code in{' '}
                <span className="font-bold tabular-nums">{formatCountdown(lockoutSeconds)}</span>
              </div>
            </div>
          )}

          {/* Error banner (non-lockout) */}
          {error && lockoutSeconds === 0 && (
            <div ref={errorRef} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Warning banner (last attempt) */}
          {warning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 text-yellow-700 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {warning}
            </div>
          )}

          {/* Success banner */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-600 text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Attempts remaining badge */}
          {step === 2 && attemptsRemaining !== null && lockoutSeconds === 0 && (
            <div className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
              attemptsRemaining === 0
                ? 'bg-red-50 text-red-600 border border-red-100'
                : attemptsRemaining === 1
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              <Clock className="h-4 w-4 flex-shrink-0" />
              {attemptsRemaining === 0
                ? 'No resend attempts remaining (15-min lockout active)'
                : `${attemptsRemaining} resend attempt${attemptsRemaining !== 1 ? 's' : ''} remaining`}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendCode}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || lockoutSeconds > 0}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>

              <div className="text-center mt-4">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Code */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyCode}>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors text-center tracking-widest text-lg font-bold"
                    placeholder="000000"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setWarning(''); setSuccessMessage(''); }}
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || lockoutSeconds > 0 || attemptsRemaining === 0}
                  className="text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {lockoutSeconds > 0
                    ? `Wait ${formatCountdown(lockoutSeconds)}`
                    : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
