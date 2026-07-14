import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function ScanRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasScanned = useRef(false);
  const [errorState, setErrorState] = useState(null); // null | 'timeout' | 'network'

  function runScan() {
    setErrorState(null);

    const t_t = searchParams.get('t_t'); // '1' for product, '2' for health
    const raw_t_id = searchParams.get('t_id');
    const t_id = raw_t_id ? raw_t_id.trim().replace(/:$/, '') : null;

    if (!t_id) {
      navigate('/app/dashboard', { replace: true });
      return;
    }

    async function checkTag() {
      try {
        // Race the API call against a 10-second timeout
        const result = await Promise.race([
          api.verifyScan(t_t || '1', t_id),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 10000)
          ),
        ]);

        switch (result.status) {
          case 'unassigned': {
            // Tag not yet registered — send to registration page
            const registerPath =
              t_t === '2'
                ? `/app/register/health?id=${t_id}`
                : `/app/register/product?id=${t_id}`;
            const token = sessionStorage.getItem('scannhelp_token');
            const user = sessionStorage.getItem('scannhelp_user');
            if (token && token !== 'null' && token !== 'undefined' && user) {
              navigate(registerPath, { replace: true });
            } else {
              navigate(`/login?redirect=${encodeURIComponent(registerPath)}`, {
                replace: true,
              });
            }
            break;
          }
          case 'assigned':
          case 'lost':
            // Both assigned and lost items show the public details page.
            // The backend decides what data to include based on is_lost.
            navigate(`/app/public-details/${t_id}?t_t=${t_t || '1'}`, {
              replace: true,
            });
            break;
          default:
            navigate('/not-found', { replace: true });
        }
      } catch (err) {
        if (err.message === 'TIMEOUT') {
          setErrorState('timeout');
        } else {
          console.error('Scan error:', err);
          setErrorState('network');
        }
      }
    }

    checkTag();
  }

  useEffect(() => {
    if (hasScanned.current) return;
    hasScanned.current = true;
    runScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Error state — show a retry screen instead of the "Sorry" page ─────────
  if (errorState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {errorState === 'timeout' ? 'Taking too long…' : 'Connection error'}
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {errorState === 'timeout'
              ? 'The server is warming up. This sometimes happens on the first request. Please try again.'
              : 'Could not reach the server. Please check your internet connection and try again.'}
          </p>
          <button
            onClick={() => {
              hasScanned.current = false;
              runScan();
            }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-7 py-3 rounded-full font-bold shadow-lg shadow-primary/25 transition-all active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-gray-700 font-semibold text-lg">Processing scan…</p>
        <p className="text-gray-400 text-sm mt-1">Looking up your tag</p>
      </div>
    </div>
  );
}
