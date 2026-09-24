import { Link, Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { ROUTES } from '@/constants';

const AuthLayout = () => {
  return (
    <div className="auth-shell relative">
      <header className="absolute left-6 top-6 z-10 sm:left-10 sm:top-8">
        <Link to={ROUTES.HOME} className="auth-shell-logo">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white shadow-sm">
            <Zap className="h-4 w-4 fill-(--color-primary) text-(--color-primary)" strokeWidth={0} />
          </span>
          pingup
        </Link>
      </header>

      <Outlet />
    </div>
  );
};

export default AuthLayout;
