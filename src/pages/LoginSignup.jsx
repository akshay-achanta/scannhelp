import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginSignup() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Determine initial state based on route
  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication
    const userData = {
      name: isLogin ? 'User' : name,
      email: email,
      last_login: new Date().toISOString()
    };
    
    localStorage.setItem('scannhelp_user', JSON.stringify(userData));
    
    // Check for redirect
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    
    if (redirect) {
      navigate(decodeURIComponent(redirect), { replace: true });
    } else {
      navigate('/app/dashboard', { replace: true });
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
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                isLogin 
                  ? 'text-primary border-b-2 border-primary bg-orange-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
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
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
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
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-all"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="h-5 w-5 mr-3" />
                {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
              </button>
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
