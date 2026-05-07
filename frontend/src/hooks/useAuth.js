import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('scannhelp_token');

  useEffect(() => {
    if (!token || token === 'null') {
      // Redirect to login with the current path as a redirect param
      const redirectPath = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirectPath}`, { replace: true });
    }
  }, [token, navigate, location]);

  return token;
}
