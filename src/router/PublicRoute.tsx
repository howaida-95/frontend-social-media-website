// routes/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = true; // Replace with your real auth logic, e.g. useAuth()

  if (token) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default PublicRoute;