// frontend/src/App.jsx
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import AddPatientPage from "./pages/AddPatientPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import PatientDetails from "./pages/PatientDetails.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CallbackPage from "./pages/CallbackPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import { useAuthStore } from "./store/authStore";

function App() {
    const { initAuth, isAuthenticated } = useAuthStore();

    // Initialize auth on app load
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
            {/* Show Navbar only when authenticated */}
            {isAuthenticated && <Navbar />}

            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/callback" element={<CallbackPage />} />

                {/* Protected Routes - Doctor + Admin */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/:id"
                    element={
                        <ProtectedRoute>
                            <PatientDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/addPatient"
                    element={
                        <ProtectedRoute>
                            <AddPatientPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/about"
                    element={
                        <ProtectedRoute>
                            <AboutPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Only Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Box>
    );
}

export default App;