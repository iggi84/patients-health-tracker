// frontend/src/App.jsx
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes, Navigate } from "react-router-dom";
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


    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>

            {isAuthenticated && <Navbar />}

            <Routes>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/callback" element={<CallbackPage />} />


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

                <Route
                    path="*"
                    element={
                        <ProtectedRoute>
                            <Navigate to="/" replace />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Box>
    );
}

export default App;