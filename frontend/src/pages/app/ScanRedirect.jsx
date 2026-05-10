import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';

export default function ScanRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasScanned = useRef(false);

  useEffect(() => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    const t_t = searchParams.get('t_t'); // 1 for product, 2 for health
    const raw_t_id = searchParams.get('t_id');
    const t_id = raw_t_id ? raw_t_id.trim().replace(/:$/, '') : null;
    const user = localStorage.getItem('scannhelp_user');

    console.log('Scanning Tag:', { t_t, t_id });

    if (!t_id) {
      console.log('No Tag ID found, going to dashboard');
      navigate('/app/dashboard', { replace: true });
      return;
    }

    async function checkTag() {
      try {
        console.log('Verifying scan...');
        const result = await api.verifyScan(t_t || 1, t_id);
        console.log('Verification result:', result);

        switch (result.status) {
          case 'unassigned':
            // If not assigned, go to registration.
            const registerPath = t_t === '2' 
              ? `/app/register/health?id=${t_id}` 
              : `/app/register/product?id=${t_id}`;
            
            const token = localStorage.getItem('scannhelp_token');
            const user = localStorage.getItem('scannhelp_user');
            
            if (token && token !== 'null' && token !== 'undefined' && user) {
              console.log('User logged in, going to registration:', registerPath);
              navigate(registerPath, { replace: true });
            } else {
              // Strictly force login/signup first
              console.log('User not logged in, forcing login/signup');
              navigate(`/login?redirect=${encodeURIComponent(registerPath)}`, { replace: true });
            }
            break;
          case 'assigned':
            // If assigned but NOT lost -> strict privacy (Not Found)
            navigate('/not-found', { replace: true });
            break;
          case 'lost':
            // If marked as LOST -> show public details
            navigate(`/app/public-details/${t_id}?t_t=${t_t}`, { replace: true });
            break;
          default:
            navigate('/not-found', { replace: true });
        }
      } catch (err) {
        console.error('Scan error:', err);
        navigate('/not-found', { replace: true });
      }
    }

    checkTag();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Processing scan...</p>
      </div>
    </div>
  );
}
