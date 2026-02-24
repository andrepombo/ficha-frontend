import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const sanitizeRedirect = (path: string | null) => {
  if (!path) return '/dashboard';
  let target = path;
  if (target.startsWith('/painel')) {
    target = target.replace(/^\/painel/, '');
  }
  if (!target.startsWith('/')) {
    target = `/${target}`;
  }
  // Avoid looping back to login
  if (target === '/login') return '/dashboard';
  return target || '/dashboard';
};

const DemoLoginRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();

  useEffect(() => {
    const run = async () => {
      const redirectTarget = sanitizeRedirect(searchParams.get('redirect'));
      await logout();
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, { replace: true });
    };
    run();
  }, [logout, navigate, searchParams]);

  return null;
};

export default DemoLoginRedirect;
