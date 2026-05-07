import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export default function LoginSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Determine initial state based on route
  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }

    /* global google */
    if (window.google && !window.google_initialized) {
      window.google.accounts.id.initialize({
        client_id: "496849303742-4gbaq89c5r93o8b36qs1rd9p89qme11k.apps.googleusercontent.com", 
        callback: handleGoogleResponse
      });
      window.google_initialized = true;
    }
    
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById("google-button"),
        { theme: "outline", size: "large", width: 400, text: "continue_with" }
      );
    }
  }, [location.pathname]);

  async function handleGoogleResponse(response) {
    setLoading(true);
    try {
      const data = await api.googleLogin(response.credential);
      // Backend returns the user data in some form or we fetch it
      localStorage.setItem('scannhelp_user', JSON.stringify({ email: 'Google User' }));
      
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await api.login(email, password);
        const userData = { email };
        localStorage.setItem('scannhelp_user', JSON.stringify(userData));
      } else {
        await api.signup({ email, full_name: name, password });
        await api.login(email, password);
        const userData = { email, full_name: name };
        localStorage.setItem('scannhelp_user', JSON.stringify(userData));
      }

      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                isLogin 
                  ? 'text-primary border-b-2 border-primary bg-orange-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
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
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  {isLogin && (
                    <a href="#" className="text-xs font-medium text-primary hover:text-primary-dark">
                      Forgot password?
                    </a>
                  )}
                </div>
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
                      <Link to="/terms-conditions" className="text-primary hover:text-primary-dark">
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="text-primary hover:text-primary-dark">
                        Privacy Policy
                      </Link>.
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>

              <div className="relative my-6">
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
