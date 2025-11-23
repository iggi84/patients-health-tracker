// frontend/src/pages/UsersPage.jsx
import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    IconButton,
    useToast,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    VStack,
    Input,
    Select,
    FormControl,
    FormLabel,
    HStack,
    Spinner,
    Text,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Flex,
    Checkbox
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, LockIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useUserStore } from "../store/userStore";
import { Link } from "react-router-dom";

const UsersPage = () => {
    const { users, groups, fetchUsers, fetchGroups, createUser, updateUser, deleteUser, resetPassword, isLoading } = useUserStore();
    const toast = useToast();
    const bg = useColorModeValue("white", "gray.800");

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();

    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({ email: "", role: "Doctor", temporaryPassword: "" });
    const [editRole, setEditRole] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

    useEffect(() => {
        fetchUsers();
        fetchGroups();
    }, [fetchUsers, fetchGroups]);

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.role) {
            toast({
                title: "Error",
                description: "Email and role are required",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        const userData = {
            ...newUser,
            sendEmail: sendWelcomeEmail
        };

        const result = await createUser(userData);

        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
                status: "success",
                duration: 5000,
                isClosable: true
            });
            fetchUsers();
            onCreateClose();
            setNewUser({ email: "", role: "Doctor", temporaryPassword: "" });
            setSendWelcomeEmail(true);
        } else {
            toast({
                title: "Error",
                description: result.message,
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleUpdateUser = async () => {
        if (!editRole) {
            toast({
                title: "Error",
                description: "Role is required",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        const currentRole = selectedUser.groups[0] || "";
        const result = await updateUser(selectedUser.username, {
            role: editRole,
            currentRole
        });

        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
                status: "success",
                duration: 3000,
                isClosable: true
            });
            fetchUsers();
            onEditClose();
        } else {
            toast({
                title: "Error",
                description: result.message,
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleDeleteUser = async () => {
        const result = await deleteUser(selectedUser.username);

        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
                status: "success",
                duration: 3000,
                isClosable: true
            });
            onDeleteClose();
        } else {
            toast({
                title: "Error",
                description: result.message,
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 8) {
            toast({
                title: "Error",
                description: "Password must be at least 8 characters",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        const result = await resetPassword(selectedUser.username, newPassword);

        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
                status: "success",
                duration: 3000,
                isClosable: true
            });
            onPasswordClose();
            setNewPassword("");
        } else {
            toast({
                title: "Error",
                description: result.message,
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditRole(user.groups[0] || "Doctor");
        onEditOpen();
    };

    const openDeleteDialog = (user) => {
        setSelectedUser(user);
        onDeleteOpen();
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setNewPassword("");
        onPasswordOpen();
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <HStack>
                        <Link to="/admin">
                            <IconButton
                                icon={<ArrowBackIcon />}
                                variant="ghost"
                                aria-label="Back to Admin"
                            />
                        </Link>
                        <Heading size="lg">User Management</Heading>
                    </HStack>
                    <Button colorScheme="blue" onClick={onCreateOpen}>
                        Create New User
                    </Button>
                </Flex>

                {/* Users Table */}
                <Box bg={bg} rounded="lg" shadow="md" overflow="hidden">
                    {isLoading ? (
                        <Flex justify="center" align="center" py={10}>
                            <Spinner size="xl" color="blue.500" />
                        </Flex>
                    ) : users.length === 0 ? (
                        <Text textAlign="center" py={10} color="gray.500">
                            No users found
                        </Text>
                    ) : (
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Email</Th>
                                        <Th>Role</Th>
                                        <Th>Status</Th>
                                        <Th>Created</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {users.map((user) => (
                                        <Tr key={user.username}>
                                            <Td>{user.email}</Td>
                                            <Td>
                                                <Badge
                                                    colorScheme={user.groups.includes("Admin") ? "purple" : "blue"}
                                                >
                                                    {user.groups[0] || "No Role"}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <Badge
                                                    colorScheme={
                                                        user.status === "CONFIRMED" ? "green" :
                                                            user.status === "FORCE_CHANGE_PASSWORD" ? "orange" :
                                                                "red"
                                                    }
                                                >
                                                    {user.status}
                                                </Badge>
                                            </Td>
                                            <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                                            <Td>
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        onClick={() => openEditModal(user)}
                                                        aria-label="Edit user"
                                                    />
                                                    <IconButton
                                                        icon={<LockIcon />}
                                                        size="sm"
                                                        colorScheme="orange"
                                                        onClick={() => openPasswordModal(user)}
                                                        aria-label="Reset password"
                                                    />
                                                    <IconButton
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => openDeleteDialog(user)}
                                                        aria-label="Delete user"
                                                    />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </VStack>

            {/* Create User Modal */}
            <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New User</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    {groups.map((group) => (
                                        <option key={group.name} value={group.name}>
                                            {group.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Custom Temporary Password (Optional)</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Leave empty for auto-generated"
                                    value={newUser.temporaryPassword}
                                    onChange={(e) => {
                                        setNewUser({ ...newUser, temporaryPassword: e.target.value });
                                        // Auto-disable email if custom password is provided
                                        if (e.target.value) {
                                            setSendWelcomeEmail(false);
                                        } else {
                                            setSendWelcomeEmail(true);
                                        }
                                    }}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    If provided, email will be suppressed (you must share password manually)
                                </Text>
                            </FormControl>
                            <FormControl>
                                <Checkbox
                                    isChecked={sendWelcomeEmail}
                                    onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                                    isDisabled={!!newUser.temporaryPassword}
                                >
                                    Send welcome email with temporary password
                                </Checkbox>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {sendWelcomeEmail
                                        ? "✉️ User will receive an email from AWS Cognito with login instructions"
                                        : "⚠️ No email will be sent. Share credentials manually."}
                                </Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCreateClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleCreateUser}>
                            Create User
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit User Role</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input value={selectedUser?.email || ""} isReadOnly />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                >
                                    {groups.map((group) => (
                                        <option key={group.name} value={group.name}>
                                            {group.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleUpdateUser}>
                            Update Role
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Reset Password Modal */}
            <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Reset Password</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>User</FormLabel>
                                <Input value={selectedUser?.email || ""} isReadOnly />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>New Temporary Password</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    User will be required to change password on next login
                                </Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onPasswordClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="orange" onClick={handleResetPassword}>
                            Reset Password
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Delete User</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete user <strong>{selectedUser?.email}</strong>? This action cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onDeleteClose}>Cancel</Button>
                            <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Container>
    );
};

export default UsersPage;