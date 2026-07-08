import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle,
  Eye, EyeOff, ShieldCheck, RefreshCw, Send, KeyRound
} from 'lucide-react';
import { api } from '../services/api';



// ── OTP Countdown Timer ───────────────────────────────────────────────────────
function OTPCountdown({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const pct = (remaining / seconds) * 100;
  const isUrgent = remaining < 60;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isUrgent ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
      }`}
    >
      <span
        className="inline-block w-3 h-3 rounded-full border-2 border-current"
        style={{
          background: `conic-gradient(currentColor ${pct}%, transparent 0)`,
        }}
      />
      {m}:{String(s).padStart(2, '0')}
    </span>
  );
}

export default function LoginSignup() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Shared state ─────────────────────────────────────────────────────────────
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const DRAFT_KEY = 'scannhelp_auth_draft';

  // Load draft from local storage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.name) setName(parsed.name);
        if (parsed.password) setPassword(parsed.password);
        if (parsed.confirmPassword) setConfirmPassword(parsed.confirmPassword);
      }
    } catch (e) {
      console.error('Failed to load draft', e);
    }
  }, []);

  // Save draft to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ email, name, password, confirmPassword }));
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  }, [email, name, password, confirmPassword]);
  const [errorState, setErrorState] = useState({ msg: '', key: 0 });
  const error = errorState.msg;
  const setError = useCallback((msg) => {
    setErrorState(prev => ({ msg, key: msg ? prev.key + 1 : prev.key }));
  }, []);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorState.key]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── OTP state (signup) ────────────────────────────────────────────────────────
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpSentAt, setOtpSentAt] = useState(null); // timestamp
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSendMsg, setCodeSendMsg] = useState('');
  const [codeSendWarning, setCodeSendWarning] = useState('');



  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetOtpState = useCallback(() => {
    setOtpSent(false);
    setOtpExpired(false);
    setOtpSentAt(null);
    setVerificationCode('');
    setCodeSendMsg('');
    setCodeSendWarning('');
  }, []);




  // ── Route detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('scannhelp_token');
    const user = sessionStorage.getItem('scannhelp_user');
    if (token && token !== 'null' && user) {
      navigate('/app/dashboard', { replace: true });
      return;
    }
    setIsLogin(location.pathname !== '/signup');
  }, [location.pathname, navigate]);

  // ── Google Sign-In ──────────────────────────────────────────────────────
  useEffect(() => {
    /* global google */
    if (window.google && !window.google_initialized) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google_initialized = true;
    }
    if (window.google) {
      const el = document.getElementById('google-button');
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: 'outline', size: 'large', width: 400, text: 'continue_with',
        });
      }
    }
  }, [isLogin]);

  async function handleGoogleResponse(response) {
    setLoading(true);
    try {
      await api.googleLogin(response.credential);
      sessionStorage.setItem('scannhelp_user', JSON.stringify({ email: 'Google User' }));
      sessionStorage.setItem('scannhelp_token_expires_at', (Date.now() + 30 * 60 * 1000).toString());
      const redirect = new URLSearchParams(location.search).get('redirect');
      navigate(redirect || '/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  }

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendCode = async () => {
    if (!email) { setError('Please enter your email address first.'); return; }
    setError('');
    setCodeSendMsg('');
    setCodeSendWarning('');
    setOtpLoading(true);
    try {
      const data = await api.sendSignupCode(email);
      setOtpSent(true);
      setOtpExpired(false);
      setOtpSentAt(Date.now());
      setVerificationCode('');
      setCodeSendMsg(data.message || 'Code sent! Check your email.');
      if (data.warning) setCodeSendWarning(data.warning);
    } catch (err) {
      setError(err.message || 'Failed to send code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      // Signup validations
      if (!otpSent || otpExpired) {
        setError('Please verify your email first by clicking "Send Code".');
        return;
      }
      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter the 6-digit verification code sent to your email.');
        return;
      }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (password.length < 8 || password.length > 20) {
        setError('Password must be between 8 and 20 characters'); return;
      }
      const isValidChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/.test(password);
      if (!isValidChars) { setError('Password can only contain letters, numbers, and special characters'); return; }
      if (!/[a-zA-Z]/.test(password)) { setError('Password is not strong — please add some letters'); return; }
      if (!/[0-9]/.test(password)) { setError('Password is not strong — please add some numbers'); return; }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await api.loginJson(email, password);
        const userData = { email };
        sessionStorage.setItem('scannhelp_user', JSON.stringify(userData));
        sessionStorage.setItem('scannhelp_token_expires_at', (Date.now() + 30 * 60 * 1000).toString());
      } else {
        await api.signup({
          email,
          full_name: name,
          password,
          confirm_password: confirmPassword,
          verification_code: verificationCode,
        });
        await api.loginJson(email, password);
        const userData = { email, full_name: name };
        sessionStorage.setItem('scannhelp_user', JSON.stringify(userData));
        sessionStorage.setItem('scannhelp_token_expires_at', (Date.now() + 30 * 60 * 1000).toString());
      }

      const redirect = new URLSearchParams(location.search).get('redirect');
      localStorage.removeItem(DRAFT_KEY);
      navigate(redirect || '/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  // ── Tab switch resets ─────────────────────────────────────────────────────
  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError('');
    resetOtpState();
  };

  const otpSecondsTotal = 5 * 60; // 5 minutes

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="mt-3 text-gray-600">
            {isLogin
              ? 'Enter your credentials to access your account'
              : 'Join ScanNHelp to secure your belongings'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchTab(true)}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                isLogin
                  ? 'text-primary border-b-2 border-primary bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab(false)}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                !isLogin
                  ? 'text-primary border-b-2 border-primary bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div ref={errorRef} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name (signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className={`flex gap-2 ${!isLogin ? 'items-end' : ''}`}>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id={isLogin ? 'login-email' : 'signup-email'}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (otpSent) resetOtpState(); // reset OTP if email changes
                      }}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Send Code button (signup only) */}
                  {!isLogin && (
                    <button
                      type="button"
                      id="send-otp-btn"
                      onClick={handleSendCode}
                      disabled={otpLoading || !email}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        otpSent && !otpExpired
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : 'bg-orange-50 text-primary border border-orange-200 hover:bg-orange-100'
                      }`}
                      title={otpSent && !otpExpired ? 'Resend code' : 'Send verification code'}
                    >
                      {otpLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : otpSent && !otpExpired ? (
                        <><RefreshCw className="h-4 w-4" /> Resend</>
                      ) : (
                        <><Send className="h-4 w-4" /> Send Code</>
                      )}
                    </button>
                  )}
                </div>

                {/* OTP status messages */}
                {!isLogin && codeSendMsg && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5 flex-1">
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{codeSendMsg}</span>
                    </div>
                    {otpSent && !otpExpired && (
                      <OTPCountdown
                        seconds={otpSecondsTotal}
                        onExpire={() => setOtpExpired(true)}
                      />
                    )}
                  </div>
                )}
                {!isLogin && otpExpired && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Code expired. Click Resend to get a new one.
                  </p>
                )}
                {!isLogin && codeSendWarning && (
                  <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {codeSendWarning}
                  </p>
                )}
              </div>

              {/* Verification Code input (appears after OTP sent) */}
              {!isLogin && otpSent && !otpExpired && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                    <span className="ml-1 text-xs text-gray-400 font-normal">(6-digit code from email)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="signup-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="block w-full pl-10 pr-3 py-3 border border-orange-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors tracking-widest font-mono"
                      placeholder="000000"
                    />
                    {verificationCode.length === 6 && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary-dark">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id={isLogin ? 'login-password' : 'signup-password'}
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

              {/* Confirm Password (signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="signup-confirm-password"
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
              )}

              {/* Terms (signup only) */}
              {!isLogin && (
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms-conditions" className="text-primary hover:text-primary-dark">Terms</Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="text-primary hover:text-primary-dark">Privacy Policy</Link>.
                    </label>
                  </div>
                </div>
              )}



              {/* Submit Button */}
              <button
                id={isLogin ? 'login-submit' : 'signup-submit'}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>

              {/* Divider + Google */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div id="google-button" className="w-full flex justify-center"></div>
            </form>
          </div>

          {/* Bottom features panel (signup only) */}
          {!isLogin && (
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Why create an account?</h4>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Register and manage your purchased QR codes</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Instantly mark items as lost or found</span>
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Control your privacy and notification settings</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
