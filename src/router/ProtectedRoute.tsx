import { type ReactNode } from 'react';
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const token = true; // Replace with your authentication logic

    if (!token) {
        return <Navigate to={ROUTES.SIGN_IN} replace />;
    }

    return <>{children}</>;
}
export default ProtectedRoute;