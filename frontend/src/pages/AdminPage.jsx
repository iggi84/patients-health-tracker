// frontend/src/pages/AdminPage.jsx
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    SimpleGrid,
    useColorModeValue,
    Icon,
    Flex,
    Badge
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FaUsers, FaHeartbeat, FaBell, FaCog } from "react-icons/fa";

const AdminCard = ({ title, description, icon, to, count, comingSoon }) => {
    const bg = useColorModeValue("white", "gray.800");

    const CardContent = (
        <Box
            bg={bg}
            p={6}
            rounded="lg"
            shadow="md"
            transition="all 0.3s"
            _hover={{ transform: comingSoon ? "none" : "translateY(-5px)", shadow: comingSoon ? "md" : "xl" }}
            opacity={comingSoon ? 0.7 : 1}
            cursor={comingSoon ? "not-allowed" : "pointer"}
            position="relative"
            overflow="hidden"
        >
            {/* Coming Soon Ribbon */}
            {comingSoon && (
                <Box
                    position="absolute"
                    top="10px"
                    right="-35px"
                    bg="orange.400"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                    px={10}
                    py={1}
                    transform="rotate(45deg)"
                    boxShadow="md"
                    zIndex={1}
                >
                    COMING SOON
                </Box>
            )}

            <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                    <Icon as={icon} boxSize={8} color="blue.500" />
                    {count !== undefined && (
                        <Badge colorScheme="blue" fontSize="md" px={2}>
                            {count}
                        </Badge>
                    )}
                </HStack>
                <Heading size="md">{title}</Heading>
                <Text color="gray.500" fontSize="sm">
                    {description}
                </Text>
            </VStack>
        </Box>
    );

    // If coming soon, don't wrap in Link
    return comingSoon ? CardContent : <Link to={to}>{CardContent}</Link>;
};

const AdminPage = () => {
    const { user } = useAuthStore();
    const bg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg" mb={2}>
                            Admin Dashboard
                        </Heading>
                        <Text color="gray.500">
                            Welcome back, {user?.email || "Admin"}
                        </Text>
                    </Box>
                </Flex>

                {/* Admin Cards */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <AdminCard
                        title="Users"
                        description="Manage system users and roles"
                        icon={FaUsers}
                        to="/admin/users"
                        comingSoon={false}
                    />
                    <AdminCard
                        title="Devices"
                        description="Manage monitoring devices"
                        icon={FaHeartbeat}
                        to="/admin/devices"
                        comingSoon={true}
                    />
                    <AdminCard
                        title="Alerts"
                        description="Configure alert thresholds"
                        icon={FaBell}
                        to="/admin/alerts"
                        comingSoon={true}
                    />
                    <AdminCard
                        title="Settings"
                        description="System configuration"
                        icon={FaCog}
                        to="/admin/settings"
                        comingSoon={true}
                    />
                </SimpleGrid>

                {/* Quick Stats */}
                <Box bg={cardBg} p={6} rounded="lg" shadow="md">
                    <Heading size="md" mb={4}>
                        System Overview
                    </Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        <Box textAlign="center" p={4}>
                            <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                                --
                            </Text>
                            <Text color="gray.500">Total Patients</Text>
                        </Box>
                        <Box textAlign="center" p={4}>
                            <Text fontSize="3xl" fontWeight="bold" color="green.500">
                                --
                            </Text>
                            <Text color="gray.500">Active Devices</Text>
                        </Box>
                        <Box textAlign="center" p={4}>
                            <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                                --
                            </Text>
                            <Text color="gray.500">Pending Alerts</Text>
                        </Box>
                        <Box textAlign="center" p={4}>
                            <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                                --
                            </Text>
                            <Text color="gray.500">System Users</Text>
                        </Box>
                    </SimpleGrid>
                </Box>

                {/* Recent Activity Placeholder */}
                <Box bg={cardBg} p={6} rounded="lg" shadow="md">
                    <Heading size="md" mb={4}>
                        Recent Activity
                    </Heading>
                    <Text color="gray.500">
                        Audit log and recent activities will be displayed here.
                    </Text>
                </Box>
            </VStack>
        </Container>
    );
};

export default AdminPage;