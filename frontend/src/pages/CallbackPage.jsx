// frontend/src/pages/CallbackPage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Container,
    Spinner,
    Text,
    VStack,
    Alert,
    AlertIcon,
    Button
} from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore";

const CallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { exchangeCodeForTokens, user, isAuthenticated, error } = useAuthStore();
    const [processing, setProcessing] = useState(true);
    const [callbackError, setCallbackError] = useState(null);
    const hasProcessed = useRef(false); // Prevent double execution

    useEffect(() => {
        // Skip if already processed (prevents double execution on hot reload)
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const handleCallback = async () => {
            const code = searchParams.get("code");
            const errorParam = searchParams.get("error");
            const errorDescription = searchParams.get("error_description");

            // Check for OAuth errors
            if (errorParam) {
                setCallbackError(errorDescription || errorParam);
                setProcessing(false);
                return;
            }

            // Check for authorization code
            if (!code) {
                setCallbackError("No authorization code received");
                setProcessing(false);
                return;
            }

            // Exchange code for tokens
            const result = await exchangeCodeForTokens(code);

            if (!result.success) {
                // Only show error if it's not the common "already used" error
                if (!result.message?.includes("invalid_grant")) {
                    setCallbackError(result.message || "Authentication failed");
                }
                setProcessing(false);
                return;
            }

            setProcessing(false);
        };

        handleCallback();
    }, []); // Empty dependency array - run once

    // Redirect after successful authentication
    useEffect(() => {
        if (isAuthenticated && user && !processing && !callbackError) {
            // Small delay to ensure state is fully updated
            const timer = setTimeout(() => {
                if (user.role === "Admin") {
                    navigate("/admin", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, user, processing, callbackError, navigate]);

    // Show error state
    if (callbackError && !isAuthenticated) {
        return (
            <Container maxW="md" py={20}>
                <VStack spacing={6}>
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        {callbackError}
                    </Alert>
                    <Button
                        colorScheme="blue"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </Button>
                </VStack>
            </Container>
        );
    }

    // Show loading state
    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <VStack spacing={4}>
                <Spinner
                    size="xl"
                    color="blue.500"
                    thickness="4px"
                />
                <Text fontSize="lg" color="gray.600">
                    {processing ? "Completing sign in..." : "Redirecting..."}
                </Text>
            </VStack>
        </Box>
    );
};

export default CallbackPage;