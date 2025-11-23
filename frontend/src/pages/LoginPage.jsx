// frontend/src/pages/LoginPage.jsx
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    useColorModeValue,
    Image,
    Flex
} from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
    const { isAuthenticated, isLoading, getLoginUrl, user } = useAuthStore();
    const bg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.300");

    // If already authenticated, redirect based on role
    if (isAuthenticated && user) {
        if (user.role === "Admin") {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }

    const handleLogin = () => {
        window.location.href = getLoginUrl();
    };

    return (
        <Flex minH="100vh" align="center" justify="center">
            <Container maxW="md">
                <Box
                    bg={bg}
                    p={8}
                    rounded="xl"
                    shadow="xl"
                    textAlign="center"
                >
                    <VStack spacing={6}>
                        {/* Logo */}
                        <Image
                            src="/patientoTopSmallIcon.svg"
                            alt="PSMS Logo"
                            boxSize="80px"
                        />

                        {/* Title */}
                        <Heading
                            size="xl"
                            bgGradient="linear(to-r, blue.400, blue.600)"
                            bgClip="text"
                        >
                            PSMS
                        </Heading>

                        <Text color={textColor} fontSize="lg">
                            Patient Safety Management System
                        </Text>

                        <Text color={textColor} fontSize="sm">
                            Sign in to access your dashboard
                        </Text>

                        {/* Login Button */}
                        <Button
                            colorScheme="blue"
                            size="lg"
                            width="full"
                            onClick={handleLogin}
                            isLoading={isLoading}
                            loadingText="Loading..."
                        >
                            Sign in with AWS
                        </Button>

                        <Text fontSize="xs" color="gray.500">
                            Secure authentication powered by AWS Cognito
                        </Text>
                    </VStack>
                </Box>
            </Container>
        </Flex>
    );
};

export default LoginPage;