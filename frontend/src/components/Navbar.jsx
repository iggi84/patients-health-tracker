// frontend/src/components/Navbar.jsx
import {
    Button,
    Container,
    Flex,
    HStack,
    Text,
    useColorMode,
    useColorModeValue,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Avatar,
    Badge
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { PlusSquareIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { LuSun } from "react-icons/lu";
import { IoMoon } from "react-icons/io5";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const textColor = useColorModeValue("blue.500", "blue.300");
    const { isAuthenticated, user, performLogout, isAdmin } = useAuthStore();
    const location = useLocation();

    return (
        <Container maxW="1140px" px={4}>
            <Flex
                h={16}
                alignItems="center"
                justifyContent="space-between"
                flexDir={{ base: "column", sm: "row" }}
                py={2}
            >
                {/* Logo */}
                <HStack spacing={2} alignItems="center">
                    <img
                        src="/patientoTopSmallIcon.svg"
                        alt="App Icon"
                        style={{ width: "32px", height: "32px" }}
                    />
                    <Text
                        color={textColor}
                        fontSize={{ base: "22", sm: "28" }}
                        fontWeight="bold"
                        textTransform="uppercase"
                    >
                        <Link to="/">PSMS</Link>
                    </Text>
                </HStack>

                {/* Navigation */}
                <HStack spacing={4} alignItems="center">
                    {isAuthenticated ? (
                        <>
                            {/* Add Patient Button - Only show in Doctor Dashboard */}
                            {location.pathname !== '/admin' && !location.pathname.startsWith('/admin/') && (
                                <Link to="/addPatient">
                                    <Button size="sm">
                                        <PlusSquareIcon fontSize={16} mr={2} />
                                        Add Patient
                                    </Button>
                                </Link>
                            )}

                            {/* Dashboards Menu */}
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    size="sm"
                                    rightIcon={<ChevronDownIcon />}
                                    colorScheme="purple"
                                    variant="outline"
                                >
                                    Dashboards
                                </MenuButton>
                                <MenuList>
                                    <Link to="/">
                                        <MenuItem>
                                            Doctor Dashboard
                                        </MenuItem>
                                    </Link>
                                    {isAdmin() && (
                                        <>
                                            <MenuDivider />
                                            <Link to="/admin">
                                                <MenuItem>
                                                    Admin Panel
                                                </MenuItem>
                                            </Link>
                                        </>
                                    )}
                                </MenuList>
                            </Menu>

                            {/* User Menu */}
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    rightIcon={<ChevronDownIcon />}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <HStack spacing={2}>
                                        <Avatar size="xs" name={user?.email} />
                                        <Text display={{ base: "none", md: "block" }}>
                                            {user?.email?.split('@')[0] || "User"}
                                        </Text>
                                        <Badge
                                            colorScheme={user?.role === "Admin" ? "purple" : "blue"}
                                            fontSize="xs"
                                        >
                                            {user?.role}
                                        </Badge>
                                    </HStack>
                                </MenuButton>
                                <MenuList>
                                    <MenuItem isDisabled>
                                        <Text fontSize="sm" color="gray.500">
                                            {user?.email}
                                        </Text>
                                    </MenuItem>
                                    <MenuDivider />
                                    <Link to="/about">
                                        <MenuItem>About</MenuItem>
                                    </Link>
                                    <MenuDivider />
                                    <MenuItem onClick={performLogout} color="red.500">
                                        Sign Out
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button colorScheme="blue" size="sm">
                                Sign In
                            </Button>
                        </Link>
                    )}

                    {/* Dark Mode Toggle */}
                    <Button onClick={toggleColorMode} size="sm">
                        {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
                    </Button>
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;