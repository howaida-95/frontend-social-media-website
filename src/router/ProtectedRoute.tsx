import { type ReactNode } from 'react';
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { useAuth } from "@/features/auth/context/useAuth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.SIGN_IN} replace />;
    }
    return <>{children}</>;
}
export default ProtectedRoute;