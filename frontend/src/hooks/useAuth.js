import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('scannhelp_user'));

  useEffect(() => {
    if (!user) {
      // Redirect to login with the current path as a redirect param
      const redirectPath = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirectPath}`, { replace: true });
    }
  }, [user, navigate, location]);

  return user;
}
