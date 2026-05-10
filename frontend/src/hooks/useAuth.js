import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('scannhelp_token');

  useEffect(() => {
    const user = localStorage.getItem('scannhelp_user');
    if (!token || token === 'null' || token === 'undefined' || !user) {
      // Redirect to login with the current path as a redirect param
      const redirectPath = encodeURIComponent(location.pathname + location.search);
      console.log('Strict Auth: Redirecting to login from', location.pathname);
      navigate(`/login?redirect=${redirectPath}`, { replace: true });
    }
  }, [token, navigate, location]);

  return token;
}
