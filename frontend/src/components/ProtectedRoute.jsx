// frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { Box, Spinner, Flex } from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore";

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string} requiredRole - Optional role required to access (e.g., "Admin")
 * @param {string} redirectTo - Where to redirect if not authorized (default: /login)
 */
const ProtectedRoute = ({ children, requiredRole = null, redirectTo = "/login" }) => {
    const { isAuthenticated, isLoading, user, hasRole } = useAuthStore();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <Flex minH="100vh" align="center" justify="center">
                <Spinner size="xl" color="blue.500" thickness="4px" />
            </Flex>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role if required
    if (requiredRole && !hasRole(requiredRole)) {
        // User doesn't have required role - redirect to home or unauthorized page
        return <Navigate to="/" replace />;
    }

    // Authorized - render children
    return children;
};

export default ProtectedRoute;