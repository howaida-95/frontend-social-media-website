import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants";

const ProtectedRoute= ({ children }) => {
    const token = true; // Replace with your authentication logic

    if (!token) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return children;
}
export default ProtectedRoute;