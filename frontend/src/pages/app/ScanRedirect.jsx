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

    // Force login first
    if (!user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      console.log('User not logged in, redirecting to login with:', currentUrl);
      navigate(`/login?redirect=${currentUrl}`, { replace: true });
      return;
    }

    async function checkTag() {
      try {
        console.log('Checking tag in DB...');
        const result = await api.scanId(t_id);
        console.log('Tag found:', result);
        if (result.type === 'product') {
          navigate(`/app/view/product/${t_id}`, { replace: true });
        } else if (result.type === 'health') {
          navigate(`/app/view/health/${t_id}`, { replace: true });
        }
      } catch (err) {
        console.log('Tag not found in DB, redirecting to registration...');
        if (t_t === '1') {
          console.log('Redirecting to Product Registration');
          navigate(`/app/register/product?id=${t_id}`, { replace: true });
        } else if (t_t === '2') {
          console.log('Redirecting to Health Registration');
          navigate(`/app/register/health?id=${t_id}`, { replace: true });
        } else {
          console.log('Unknown tag type, going to dashboard');
          navigate('/app/dashboard', { replace: true });
        }
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
