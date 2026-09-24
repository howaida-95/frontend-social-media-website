// routes/PublicRoute.tsx
import {type ReactNode} from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

const PublicRoute = ({ children }: {children: ReactNode}) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // if user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};
export default PublicRoute;