import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    // Session check timer checking every second
    const interval = setInterval(() => {
      const token = sessionStorage.getItem('scannhelp_token');
      if (!token) {
        setShowWarning(false);
        return;
      }

      let expiresAtStr = sessionStorage.getItem('scannhelp_token_expires_at');
      if (!expiresAtStr) {
        // Fallback: set an expiry if none exists (30 minutes)
        const fallbackExpires = (Date.now() + 30 * 60 * 1000).toString();
        sessionStorage.setItem('scannhelp_token_expires_at', fallbackExpires);
        expiresAtStr = fallbackExpires;
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const remainingTimeMs = expiresAt - Date.now();
      const remainingSeconds = Math.max(0, Math.floor(remainingTimeMs / 1000));

      if (remainingSeconds <= 60 && remainingSeconds > 0) {
        setSecondsLeft(remainingSeconds);
        setShowWarning(true);
      } else if (remainingSeconds <= 0) {
        // Log out
        sessionStorage.removeItem('scannhelp_token');
        sessionStorage.removeItem('scannhelp_user');
        sessionStorage.removeItem('scannhelp_token_expires_at');
        setShowWarning(false);
        navigate('/login?expired=true');
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const extendSession = () => {
    const newExpiresAt = (Date.now() + 30 * 60 * 1000).toString();
    sessionStorage.setItem('scannhelp_token_expires_at', newExpiresAt);
    setShowWarning(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('scannhelp_token');
    sessionStorage.removeItem('scannhelp_user');
    sessionStorage.removeItem('scannhelp_token_expires_at');
    setShowWarning(false);
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Expiry Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 text-center animate-in scale-in duration-300">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6">
              <Clock className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Session Expiry Warning</h3>
            <p className="text-gray-500 mb-6">
              For your security, you will be logged out in <span className="font-bold text-primary">{secondsLeft}</span> seconds due to inactivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={extendSession}
                className="w-full sm:flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
              >
                Extend Session
              </button>
              <button
                onClick={handleLogout}
                className="w-full sm:flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
