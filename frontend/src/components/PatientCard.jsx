import { DeleteIcon, EditIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Heading,
    HStack,
    IconButton,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
    Textarea,
} from "@chakra-ui/react";
import { usePatientStore } from "../store/patientStore";
import { useState } from "react";
import {Link} from "react-router-dom";

const PatientCard = ({ patient }) => {
    const [updatedPatient, setUpdatedPatient] = useState(patient);

    const textColor = useColorModeValue("gray.600", "gray.200");
    const bg = useColorModeValue("white", "gray.800");

    const { deletePatient, updatePatient } = usePatientStore();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleDeletePatient = async (pid) => {
        const { success, message } = await deletePatient(pid);
        if (!success) {
            toast({
                title: "Error",
                description: message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: "Success",
                description: message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleUpdatePatient = async (pid, updatedPatient) => {
        const { success, message } = await updatePatient(pid, updatedPatient);
        onClose();
        if (!success) {
            toast({
                title: "Error",
                description: message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: "Success",
                description: "Patient updated successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box
            shadow="lg"
            rounded="lg"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
            bg={bg}
        >
            {/* Fixed Placeholder Image */}
            <Image
                src="userAvatar.svg"
                alt={patient.name}
                h={40}
                w={40}
                objectFit="cover"
                objectPosition="center"
                display="block"
                mx="auto"
            />

            {/* Patient Details */}
            <Box p={4}>
                <Heading as="h3" size="md" mb={2}>
                    {patient.name}
                </Heading>

                <Text fontSize="sm" color={textColor}>
                    Age: {patient.age}
                </Text>

                <Text fontSize="sm" color={textColor}>
                    Device ID: {patient.assignedDeviceId || "N/A"}
                </Text>

                <Text fontSize="sm" color={textColor} mb={4}>
                    Email: {patient.contactInfo?.email || "N/A"}
                </Text>

                <Text fontSize="sm" color={textColor} mb={4}>
                    Phone: {patient.contactInfo?.phone || "N/A"}
                </Text>

                {/* Action Buttons */}
                <HStack spacing={2}>
                    <Link to={`/patient/${patient._id}`}>
                        <IconButton
                            icon={<InfoOutlineIcon />}
                            colorScheme="teal"
                            aria-label="Details"
                        />
                    </Link>
                    <IconButton icon={<EditIcon />} onClick={onOpen} colorScheme="blue"  aria-label={"Edit"}/>
                    <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => handleDeletePatient(patient._id)}
                        colorScheme="red"
                     aria-label={"Delete"}/>
                </HStack>
            </Box>

            {/* Modal for Editing Patient */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update Patient</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Input
                                placeholder="Patient Name"
                                name="name"
                                value={updatedPatient.name}
                                onChange={(e) =>
                                    setUpdatedPatient({ ...updatedPatient, name: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Age"
                                name="age"
                                type="number"
                                value={updatedPatient.age}
                                onChange={(e) =>
                                    setUpdatedPatient({ ...updatedPatient, age: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Email"
                                name="email"
                                value={updatedPatient.contactInfo?.email || ""}
                                onChange={(e) =>
                                    setUpdatedPatient({
                                        ...updatedPatient,
                                        contactInfo: {
                                            ...updatedPatient.contactInfo,
                                            email: e.target.value,
                                        },
                                    })
                                }
                            />
                            <Input
                                placeholder="Phone"
                                name="phone"
                                value={updatedPatient.contactInfo?.phone || ""}
                                onChange={(e) =>
                                    setUpdatedPatient({
                                        ...updatedPatient,
                                        contactInfo: {
                                            ...updatedPatient.contactInfo,
                                            phone: e.target.value,
                                        },
                                    })
                                }
                            />
                            <Textarea
                                placeholder="Medical History"
                                name="medicalHistory"
                                value={updatedPatient.medicalHistory?.join(", ") || ""}
                                onChange={(e) =>
                                    setUpdatedPatient({
                                        ...updatedPatient,
                                        medicalHistory: e.target.value.split(",").map((item) => item.trim()),
                                    })
                                }
                            />
                            <Input
                                placeholder="Device ID"
                                name="assignedDeviceId"
                                value={updatedPatient.assignedDeviceId || ""}
                                onChange={(e) =>
                                    setUpdatedPatient({
                                        ...updatedPatient,
                                        assignedDeviceId: e.target.value,
                                    })
                                }
                            />
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={() => handleUpdatePatient(patient._id, updatedPatient)}
                        >
                            Update
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PatientCard;
