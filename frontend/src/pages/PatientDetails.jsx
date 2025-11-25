import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Spinner,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMonitoringStore } from "../store/monitoringStore";
import { usePatientStore } from "../store/patientStore";
import RiskAssessmentCard from "../components/RiskAssessmentCard";

const PatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchPatients, patients, deletePatient, updatePatient } = usePatientStore();
    const { monitoringData, fetchMonitoringDataByPatientId } = useMonitoringStore();

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [patient, setPatient] = useState(null);
    const [updatedPatient, setUpdatedPatient] = useState(null);

    const textColor = useColorModeValue("gray.600", "gray.200");
    const bg = useColorModeValue("white", "gray.800");

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    useEffect(() => {
        const patientData = patients.find((p) => p._id === id);
        setPatient(patientData);
        setUpdatedPatient(patientData);

        if (id) {
            fetchMonitoringDataByPatientId(id);
        }
    }, [id, patients, fetchMonitoringDataByPatientId]);

    // Refresh monitoring data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (id) {
                fetchMonitoringDataByPatientId(id);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [id, fetchMonitoringDataByPatientId]);

    if (!patient) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    const handleDeletePatient = async () => {
        const { success, message } = await deletePatient(patient._id);
        if (success) {
            toast({
                title: "Success",
                description: "Patient deleted successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/");
        } else {
            toast({
                title: "Error",
                description: message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleUpdatePatient = async () => {
        const { success, message } = await updatePatient(patient._id, updatedPatient);
        if (success) {
            toast({
                title: "Success",
                description: "Patient updated successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setPatient(updatedPatient);
            onClose();
        } else {
            toast({
                title: "Error",
                description: message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex direction="column" gap={4} p={6}>
            {/* Top Section */}
            <Flex
                direction={{ base: "column", lg: "row" }}
                gap={4}
                justify="space-between"
            >
                {/* Patient Card */}
                <Box
                    shadow="lg"
                    rounded="lg"
                    overflow="hidden"
                    bg={bg}
                    w={{ base: "100%" , lg: "25%" }}
                >
                    <Image
                        src="/userAvatar.svg"
                        alt={patient.name}
                        h={40}
                        w={40}
                        objectFit="cover"
                        objectPosition="center"
                        display="block"
                        mx="auto"
                    />
                    <Box p={4}>
                        <Heading as="h3" size="lg" mb={2}>
                            {patient.name}
                        </Heading>
                        <Text fontSize="md" color={textColor} mb={1}>
                            Age: {patient.age}
                        </Text>
                        <Text fontSize="md" color={textColor} mb={1}>
                            Device ID: {patient.assignedDeviceId || "N/A"}
                        </Text>
                        <Text fontSize="md" color={textColor} mb={1}>
                            Email: {patient.contactInfo?.email || "N/A"}
                        </Text>
                        <Text fontSize="md" color={textColor} mb={1}>
                            Phone: {patient.contactInfo?.phone || "N/A"}
                        </Text>
                        <HStack spacing={2} mt={4}>
                            <Button
                                leftIcon={<EditIcon />}
                                colorScheme="blue"
                                size="sm"
                                onClick={onOpen}
                            >
                                Update
                            </Button>
                            <Button
                                leftIcon={<DeleteIcon />}
                                colorScheme="red"
                                size="sm"
                                onClick={handleDeletePatient}
                            >
                                Delete
                            </Button>
                        </HStack>
                    </Box>
                </Box>

                {/* Right Side: Medical History and AI Risk Assessment Side by Side */}
                <Flex
                    gap={4}
                    w={{ base: "100%", lg: "75%" }}
                    direction={{ base: "column", md: "row" }}
                >
                    {/* Medical History - Scrollable */}
                    <Box
                        shadow="lg"
                        rounded="lg"
                        bg={bg}
                        p={4}
                        w={{ base: "100%", md: "50%" }}
                        maxH="400px"
                        overflowY="auto"
                    >
                        <Heading as="h3" size="lg" mb={2}>
                            Medical History
                        </Heading>
                        <Text fontSize="sm" color={textColor}>
                            {patient.medicalHistory?.length > 0
                                ? patient.medicalHistory.join(", ")
                                : "No medical history available."}
                        </Text>
                    </Box>

                    {/* AI Risk Assessment - Scrollable */}
                    <Box
                        w={{ base: "100%", md: "50%" }}
                        minH="400px"
                        maxH="400px"
                        overflowY="auto"
                    >
                        <RiskAssessmentCard patientId={id} />
                    </Box>
                </Flex>
            </Flex>

            {/* Bottom Section: Monitoring Data */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mt={4} h={"40"}>
                <Box shadow="lg" rounded="lg" bg={bg} p={4} textAlign="center">
                    <Heading as="h4" size="md" mb={1}>
                        Heart Rate
                    </Heading>
                    <Text color={textColor}>{monitoringData?.vitalSigns?.heartRate || "N/A"} BPM</Text>
                </Box>
                <Box shadow="lg" rounded="lg" bg={bg} p={4} textAlign="center">
                    <Heading as="h4" size="md" mb={1}>
                        Systolic BP
                    </Heading>
                    <Text color={textColor}>{monitoringData?.vitalSigns?.bloodPressure?.systolic || "N/A"} mmHg</Text>
                </Box>
                <Box shadow="lg" rounded="lg" bg={bg} p={4} textAlign="center">
                    <Heading as="h4" size="md" mb={1}>
                        Diastolic BP
                    </Heading>
                    <Text color={textColor}>{monitoringData?.vitalSigns?.bloodPressure?.diastolic || "N/A"} mmHg</Text>
                </Box>
                <Box shadow="lg" rounded="lg" bg={bg} p={4} textAlign="center">
                    <Heading as="h4" size="md" mb={1}>
                        Alerts
                    </Heading>
                    <Text color={textColor}>No recent alerts</Text>
                </Box>
            </SimpleGrid>

            {/* Update Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update Patient</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={3}>
                            <Input
                                placeholder="Patient Name"
                                value={updatedPatient?.name || ""}
                                onChange={(e) =>
                                    setUpdatedPatient({ ...updatedPatient, name: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Age"
                                type="number"
                                value={updatedPatient?.age || ""}
                                onChange={(e) =>
                                    setUpdatedPatient({ ...updatedPatient, age: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Email"
                                value={updatedPatient?.contactInfo?.email || ""}
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
                                value={updatedPatient?.contactInfo?.phone || ""}
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
                                value={updatedPatient?.medicalHistory?.join(", ") || ""}
                                onChange={(e) =>
                                    setUpdatedPatient({
                                        ...updatedPatient,
                                        medicalHistory: e.target.value.split(",").map((item) => item.trim()),
                                    })
                                }
                            />
                            <Input
                                placeholder="Device ID"
                                value={updatedPatient?.assignedDeviceId || ""}
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
                        <Button colorScheme="blue" mr={3} onClick={handleUpdatePatient}>
                            Update
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default PatientDetails;