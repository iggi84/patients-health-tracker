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
    Switch,
    FormControl,
    FormLabel,
    Select,
    Badge,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useMonitoringStore } from "../store/monitoringStore";
import { usePatientStore } from "../store/patientStore";
import RiskAssessmentCard from "../components/RiskAssessmentCard";

// Demo scenario configurations
const SCENARIOS = {
    stable: {
        name: "Stable",
        description: "Normal healthy vitals",
        color: "green",
        baseVitals: {
            heartRate: 72,
            respiratoryRate: 14,
            temperature: 36.8,
            oxygenSaturation: 98,
            systolic: 120,
            diastolic: 80,
        },
        variance: {
            heartRate: 5,
            respiratoryRate: 2,
            temperature: 0.2,
            oxygenSaturation: 1,
            systolic: 5,
            diastolic: 3,
        },
        trend: 0, // No trend
    },
    deteriorating: {
        name: "Deteriorating",
        description: "Vitals gradually worsening",
        color: "orange",
        baseVitals: {
            heartRate: 85,
            respiratoryRate: 18,
            temperature: 37.5,
            oxygenSaturation: 95,
            systolic: 135,
            diastolic: 88,
        },
        variance: {
            heartRate: 8,
            respiratoryRate: 3,
            temperature: 0.3,
            oxygenSaturation: 2,
            systolic: 8,
            diastolic: 5,
        },
        trend: 1, // Getting worse
        trendRate: 0.05, // How fast it deteriorates
    },
    recovering: {
        name: "Recovering",
        description: "Vitals gradually improving",
        color: "blue",
        baseVitals: {
            heartRate: 95,
            respiratoryRate: 20,
            temperature: 38.0,
            oxygenSaturation: 93,
            systolic: 145,
            diastolic: 92,
        },
        variance: {
            heartRate: 5,
            respiratoryRate: 2,
            temperature: 0.2,
            oxygenSaturation: 1,
            systolic: 5,
            diastolic: 3,
        },
        trend: -1, // Getting better
        trendRate: 0.03,
    },
    critical: {
        name: "Critical",
        description: "Dangerous vital signs",
        color: "red",
        baseVitals: {
            heartRate: 125,
            respiratoryRate: 28,
            temperature: 39.5,
            oxygenSaturation: 88,
            systolic: 85,
            diastolic: 55,
        },
        variance: {
            heartRate: 15,
            respiratoryRate: 5,
            temperature: 0.5,
            oxygenSaturation: 3,
            systolic: 10,
            diastolic: 8,
        },
        trend: 0,
    },
};

const PatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchPatients, patients, deletePatient, updatePatient } = usePatientStore();
    const { monitoringData, fetchMonitoringDataByPatientId } = useMonitoringStore();

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [patient, setPatient] = useState(null);
    const [updatedPatient, setUpdatedPatient] = useState(null);

    // Demo mode state
    const [demoEnabled, setDemoEnabled] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState("stable");
    const [demoVitals, setDemoVitals] = useState(null);
    const [demoProgress, setDemoProgress] = useState(0); // Track progress for trending scenarios
    const demoIntervalRef = useRef(null);

    const textColor = useColorModeValue("gray.600", "gray.200");
    const bg = useColorModeValue("white", "gray.800");
    const demoBg = useColorModeValue("purple.50", "purple.900");

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

    // Refresh monitoring data every 30 seconds (only when demo is off)
    useEffect(() => {
        if (demoEnabled) return;

        const interval = setInterval(() => {
            if (id) {
                fetchMonitoringDataByPatientId(id);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [id, fetchMonitoringDataByPatientId, demoEnabled]);

    // Demo mode effect
    useEffect(() => {
        if (demoEnabled) {
            // Initialize demo vitals
            const scenario = SCENARIOS[selectedScenario];
            setDemoVitals({ ...scenario.baseVitals });
            setDemoProgress(0);

            // Start the demo interval
            demoIntervalRef.current = setInterval(() => {
                setDemoProgress((prev) => {
                    const newProgress = prev + scenario.trendRate || prev;
                    return Math.min(newProgress, 1); // Cap at 1
                });

                setDemoVitals((currentVitals) => {
                    if (!currentVitals) return scenario.baseVitals;

                    const { baseVitals, variance, trend, trendRate } = scenario;

                    // Calculate new vitals with randomness and trend
                    const trendMultiplier = trend * (trendRate || 0) * 10;

                    const newVitals = {
                        heartRate: Math.round(
                            baseVitals.heartRate +
                            (Math.random() - 0.5) * 2 * variance.heartRate +
                            trendMultiplier * (trend > 0 ? 5 : -3)
                        ),
                        respiratoryRate: Math.round(
                            baseVitals.respiratoryRate +
                            (Math.random() - 0.5) * 2 * variance.respiratoryRate +
                            trendMultiplier * (trend > 0 ? 2 : -1)
                        ),
                        temperature: parseFloat(
                            (
                                baseVitals.temperature +
                                (Math.random() - 0.5) * 2 * variance.temperature +
                                trendMultiplier * (trend > 0 ? 0.1 : -0.05)
                            ).toFixed(1)
                        ),
                        oxygenSaturation: Math.min(
                            100,
                            Math.max(
                                80,
                                Math.round(
                                    baseVitals.oxygenSaturation +
                                    (Math.random() - 0.5) * 2 * variance.oxygenSaturation +
                                    trendMultiplier * (trend > 0 ? -1 : 0.5)
                                )
                            )
                        ),
                        systolic: Math.round(
                            baseVitals.systolic +
                            (Math.random() - 0.5) * 2 * variance.systolic +
                            trendMultiplier * (trend > 0 ? 3 : -2)
                        ),
                        diastolic: Math.round(
                            baseVitals.diastolic +
                            (Math.random() - 0.5) * 2 * variance.diastolic +
                            trendMultiplier * (trend > 0 ? 2 : -1)
                        ),
                    };

                    return newVitals;
                });
            }, 2000); // Update every 2 seconds

            return () => {
                if (demoIntervalRef.current) {
                    clearInterval(demoIntervalRef.current);
                }
            };
        } else {
            // Clear demo state when disabled
            setDemoVitals(null);
            setDemoProgress(0);
            if (demoIntervalRef.current) {
                clearInterval(demoIntervalRef.current);
            }
        }
    }, [demoEnabled, selectedScenario]);

    // Get display vitals (demo or real)
    const displayVitals = demoEnabled && demoVitals
        ? {
            heartRate: demoVitals.heartRate,
            respiratoryRate: demoVitals.respiratoryRate,
            temperature: demoVitals.temperature,
            oxygenSaturation: demoVitals.oxygenSaturation,
            bloodPressure: {
                systolic: demoVitals.systolic,
                diastolic: demoVitals.diastolic,
            },
        }
        : monitoringData?.vitalSigns;

    // Helper to get vital status color
    const getVitalColor = (type, value) => {
        if (!demoEnabled) return textColor;

        switch (type) {
            case "heartRate":
                if (value < 60 || value > 100) return "red.500";
                if (value < 65 || value > 90) return "orange.500";
                return "green.500";
            case "respiratoryRate":
                if (value < 12 || value > 25) return "red.500";
                if (value < 14 || value > 20) return "orange.500";
                return "green.500";
            case "temperature":
                if (value < 36 || value > 38.5) return "red.500";
                if (value < 36.5 || value > 37.5) return "orange.500";
                return "green.500";
            case "oxygenSaturation":
                if (value < 90) return "red.500";
                if (value < 95) return "orange.500";
                return "green.500";
            case "systolic":
                if (value < 90 || value > 160) return "red.500";
                if (value < 100 || value > 140) return "orange.500";
                return "green.500";
            case "diastolic":
                if (value < 60 || value > 100) return "red.500";
                if (value < 70 || value > 90) return "orange.500";
                return "green.500";
            default:
                return textColor;
        }
    };

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

    const currentScenario = SCENARIOS[selectedScenario];

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
                    w={{ base: "100%", lg: "25%" }}
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

                        {/* Demo Mode Toggle */}
                        <Box
                            mt={4}
                            p={3}
                            bg={demoBg}
                            rounded="md"
                            borderWidth={demoEnabled ? "2px" : "1px"}
                            borderColor={demoEnabled ? "purple.400" : "transparent"}
                        >
                            <FormControl display="flex" alignItems="center" mb={2}>
                                <FormLabel htmlFor="demo-mode" mb="0" fontSize="sm" fontWeight="bold">
                                    Demo Mode
                                </FormLabel>
                                <Switch
                                    id="demo-mode"
                                    colorScheme="purple"
                                    isChecked={demoEnabled}
                                    onChange={(e) => setDemoEnabled(e.target.checked)}
                                />
                            </FormControl>

                            {demoEnabled && (
                                <VStack spacing={2} align="stretch">
                                    <Select
                                        size="sm"
                                        value={selectedScenario}
                                        onChange={(e) => setSelectedScenario(e.target.value)}
                                    >
                                        {Object.entries(SCENARIOS).map(([key, scenario]) => (
                                            <option key={key} value={key}>
                                                {scenario.name}
                                            </option>
                                        ))}
                                    </Select>
                                    <Badge colorScheme={currentScenario.color} textAlign="center">
                                        {currentScenario.description}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.500" textAlign="center">
                                        Vitals update every 2 seconds
                                    </Text>
                                </VStack>
                            )}
                        </Box>
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
                        <RiskAssessmentCard
                            patientId={id}
                            demoMode={demoEnabled}
                            demoVitals={demoVitals}
                            patientInfo={{
                                age: patient?.age,
                                weight: patient?.weight,
                                height: patient?.height,
                                dateOfBirth: patient?.dateOfBirth
                            }}
                        />
                    </Box>
                </Flex>
            </Flex>

            {/* Bottom Section: Monitoring Data */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={4} mt={4}>
                <Box
                    shadow="lg"
                    rounded="lg"
                    bg={bg}
                    p={4}
                    textAlign="center"
                    borderWidth={demoEnabled ? "2px" : "0"}
                    borderColor={demoEnabled ? getVitalColor("heartRate", displayVitals?.heartRate) : "transparent"}
                    transition="all 0.3s"
                >
                    <Heading as="h4" size="md" mb={1}>
                        Heart Rate
                    </Heading>
                    <Text
                        color={getVitalColor("heartRate", displayVitals?.heartRate)}
                        fontSize={demoEnabled ? "2xl" : "md"}
                        fontWeight={demoEnabled ? "bold" : "normal"}
                        transition="all 0.3s"
                    >
                        {displayVitals?.heartRate || "N/A"} BPM
                    </Text>
                </Box>
                <Box
                    shadow="lg"
                    rounded="lg"
                    bg={bg}
                    p={4}
                    textAlign="center"
                    borderWidth={demoEnabled ? "2px" : "0"}
                    borderColor={demoEnabled ? getVitalColor("systolic", displayVitals?.bloodPressure?.systolic) : "transparent"}
                    transition="all 0.3s"
                >
                    <Heading as="h4" size="md" mb={1}>
                        Blood Pressure
                    </Heading>
                    <Text
                        color={getVitalColor("systolic", displayVitals?.bloodPressure?.systolic)}
                        fontSize={demoEnabled ? "2xl" : "md"}
                        fontWeight={demoEnabled ? "bold" : "normal"}
                        transition="all 0.3s"
                    >
                        {displayVitals?.bloodPressure?.systolic || "N/A"}/{displayVitals?.bloodPressure?.diastolic || "N/A"} mmHg
                    </Text>
                </Box>
                <Box
                    shadow="lg"
                    rounded="lg"
                    bg={bg}
                    p={4}
                    textAlign="center"
                    borderWidth={demoEnabled ? "2px" : "0"}
                    borderColor={demoEnabled ? getVitalColor("oxygenSaturation", displayVitals?.oxygenSaturation) : "transparent"}
                    transition="all 0.3s"
                >
                    <Heading as="h4" size="md" mb={1}>
                        O₂ Saturation
                    </Heading>
                    <Text
                        color={getVitalColor("oxygenSaturation", displayVitals?.oxygenSaturation)}
                        fontSize={demoEnabled ? "2xl" : "md"}
                        fontWeight={demoEnabled ? "bold" : "normal"}
                        transition="all 0.3s"
                    >
                        {displayVitals?.oxygenSaturation || "N/A"}%
                    </Text>
                </Box>
                <Box
                    shadow="lg"
                    rounded="lg"
                    bg={bg}
                    p={4}
                    textAlign="center"
                    borderWidth={demoEnabled ? "2px" : "0"}
                    borderColor={demoEnabled ? getVitalColor("respiratoryRate", displayVitals?.respiratoryRate) : "transparent"}
                    transition="all 0.3s"
                >
                    <Heading as="h4" size="md" mb={1}>
                        Respiratory Rate
                    </Heading>
                    <Text
                        color={getVitalColor("respiratoryRate", displayVitals?.respiratoryRate)}
                        fontSize={demoEnabled ? "2xl" : "md"}
                        fontWeight={demoEnabled ? "bold" : "normal"}
                        transition="all 0.3s"
                    >
                        {displayVitals?.respiratoryRate || "N/A"} /min
                    </Text>
                </Box>
                <Box
                    shadow="lg"
                    rounded="lg"
                    bg={bg}
                    p={4}
                    textAlign="center"
                    borderWidth={demoEnabled ? "2px" : "0"}
                    borderColor={demoEnabled ? getVitalColor("temperature", displayVitals?.temperature) : "transparent"}
                    transition="all 0.3s"
                >
                    <Heading as="h4" size="md" mb={1}>
                        Temperature
                    </Heading>
                    <Text
                        color={getVitalColor("temperature", displayVitals?.temperature)}
                        fontSize={demoEnabled ? "2xl" : "md"}
                        fontWeight={demoEnabled ? "bold" : "normal"}
                        transition="all 0.3s"
                    >
                        {displayVitals?.temperature || "N/A"}°C
                    </Text>
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