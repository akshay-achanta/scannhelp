import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';

export default function ScanRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const t_t = searchParams.get('t_t'); // 1 for product, 2 for health
    const t_id = searchParams.get('t_id');
    const user = localStorage.getItem('scannhelp_user');

    if (!t_id) {
      navigate('/app/dashboard', { replace: true });
      return;
    }

    // Force login first
    if (!user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${currentUrl}`, { replace: true });
      return;
    }

    async function checkTag() {
      try {
        const result = await api.scanId(t_id);
        if (result.type === 'product') {
          navigate(`/app/view/product/${t_id}`, { replace: true });
        } else if (result.type === 'health') {
          navigate(`/app/view/health/${t_id}`, { replace: true });
        }
      } catch (err) {
        // Tag not found, redirect to registration
        if (t_t === '1') {
          navigate(`/app/register/product?id=${t_id}`, { replace: true });
        } else if (t_t === '2') {
          navigate(`/app/register/health?id=${t_id}`, { replace: true });
        } else {
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
