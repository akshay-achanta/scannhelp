import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ScanRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const t_t = searchParams.get('t_t');
    const t_id = searchParams.get('t_id');
    const user = localStorage.getItem('scannhelp_user');

    if (!user) {
      // Redirect to login with full current URL as redirect target
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${currentUrl}`, { replace: true });
      return;
    }

    if (!t_id || !t_t) {
      navigate('/app/dashboard', { replace: true });
      return;
    }

    const records = JSON.parse(localStorage.getItem('scannhelp_records') || '[]');
    const existing = records.find(r => r.id === t_id);

    if (existing) {
      if (existing.type === 'product') {
        navigate(`/app/view/product/${t_id}`, { replace: true });
      } else if (existing.type === 'health') {
        navigate(`/app/view/health/${t_id}`, { replace: true });
      }
    } else {
      // Record not found, redirect to registration based on type
      if (t_t === '1') {
        navigate(`/app/register/product?id=${t_id}`, { replace: true });
      } else if (t_t === '2') {
        navigate(`/app/register/health?id=${t_id}`, { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
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
