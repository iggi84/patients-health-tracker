import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    Badge,
    VStack,
    HStack,
    useColorModeValue,
    Alert,
    AlertIcon,
    List,
    ListItem,
    ListIcon,
    Spinner,
    Spacer,
    Divider,
    Collapse,
    IconButton,
    SimpleGrid
} from '@chakra-ui/react';
import { WarningIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const RiskAssessmentCard = ({ patientId }) => {
    const [assessment, setAssessment] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

    const API_URL = import.meta.env.VITE_API_URL;
    const bg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.200");
    const historyBg = useColorModeValue("gray.50", "gray.700");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const idToken = localStorage.getItem('idToken');

                // Fetch current assessment
                const assessmentResponse = await fetch(
                    `${API_URL}/patient/${patientId}/risk-assessment`,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        }
                    }
                );

                const assessmentData = await assessmentResponse.json();

                if (!assessmentData.success) {
                    throw new Error(assessmentData.message);
                }

                setAssessment(assessmentData.data);

                // Fetch assessment history
                const historyResponse = await fetch(
                    `${API_URL}/patient/${patientId}/risk-assessment-history?limit=10`,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        }
                    }
                );

                const historyData = await historyResponse.json();

                if (historyData.success) {
                    // Remove the first item (current assessment) from history to avoid duplication
                    setHistory(historyData.data.slice(1));
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchData();
        }
    }, [patientId, API_URL]);

    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (loading) {
        return (
            <Box bg={bg} p={6} rounded="lg" shadow="lg" textAlign="center" minH="400px" display="flex" alignItems="center" justifyContent="center">
                <VStack>
                    <Spinner size="lg" color="blue.500" />
                    <Text mt={2} color={textColor} fontSize="sm">Loading AI assessment...</Text>
                </VStack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bg} p={6} rounded="lg" shadow="lg" minH="400px">
                <Alert status="warning">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!assessment) return null;

    const isHighRisk = assessment.riskLevel === 'High Risk';

    return (
        <Box
            bg={bg}
            p={6}
            rounded="lg"
            shadow="lg"
            borderWidth="2px"
            borderColor={isHighRisk ? "red.400" : "green.400"}
            minH="400px"
            maxH="400px"
            overflowY="auto"
            display="flex"
            flexDirection="column"
        >
            <VStack align="stretch" spacing={4} flex="1">
                <Heading size="md">AI Risk Assessment</Heading>

                {/* Current Assessment */}
                <Box>
                    <HStack mb={2}>
                        <Badge
                            colorScheme={isHighRisk ? "red" : "green"}
                            fontSize="lg"
                            px={3}
                            py={1}
                            rounded="md"
                        >
                            {assessment.riskLevel}
                        </Badge>
                        <Text color={textColor} fontSize="sm">
                            {(assessment.confidence * 100).toFixed(0)}% confidence
                        </Text>
                    </HStack>

                    {assessment.riskFactors && assessment.riskFactors.length > 0 && (
                        <Box mt={2}>
                            <Text fontSize="sm" fontWeight="bold" mb={1}>Risk Factors:</Text>
                            <List spacing={1}>
                                {assessment.riskFactors.map((factor, idx) => (
                                    <ListItem key={idx} fontSize="sm">
                                        <HStack align="start">
                                            <ListIcon
                                                as={WarningIcon}
                                                color={
                                                    factor.severity === 'critical' ? 'red.500' :
                                                        factor.severity === 'high' ? 'orange.500' :
                                                            'yellow.500'
                                                }
                                                mt={0.5}
                                            />
                                            <Text>{factor.factor}</Text>
                                        </HStack>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {assessment.riskFactors && assessment.riskFactors.length === 0 && (
                        <HStack color="green.500" fontSize="sm">
                            <CheckCircleIcon />
                            <Text>No significant risk factors identified</Text>
                        </HStack>
                    )}

                    <Text fontSize="xs" color="gray.500" mt={2}>
                        Assessed: {new Date(assessment.timestamp).toLocaleString()}
                    </Text>
                </Box>

                {/* Assessment History */}
                {history.length > 0 && (
                    <>
                        <Divider />

                        <Box>
                            <Heading size="sm" mb={3}>Assessment History</Heading>

                            <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
                                {history.map((item, index) => (
                                    <Box
                                        key={index}
                                        bg={historyBg}
                                        p={3}
                                        rounded="md"
                                        borderWidth="1px"
                                        borderColor={item.riskLevel === 'High Risk' ? "red.200" : "green.200"}
                                    >
                                        <HStack justify="space-between">
                                            <VStack align="start" spacing={0} flex="1">
                                                <HStack>
                                                    <Badge
                                                        colorScheme={item.riskLevel === 'High Risk' ? "red" : "green"}
                                                        size="sm"
                                                    >
                                                        {item.riskLevel}
                                                    </Badge>
                                                    <Text fontSize="xs" color={textColor}>
                                                        {(item.confidence * 100).toFixed(0)}%
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="xs" color="gray.500">
                                                    {new Date(item.assessmentTimestamp).toLocaleString()}
                                                </Text>
                                            </VStack>

                                            <IconButton
                                                size="xs"
                                                icon={expandedItems[index] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                                onClick={() => toggleExpand(index)}
                                                aria-label="Toggle details"
                                                variant="ghost"
                                            />
                                        </HStack>

                                        <Collapse in={expandedItems[index]} animateOpacity>
                                            <Box mt={3} pt={3} borderTopWidth="1px">
                                                <Text fontSize="xs" fontWeight="bold" mb={2}>Vital Signs at Assessment:</Text>
                                                <SimpleGrid columns={2} spacing={2} fontSize="xs">
                                                    <Text>HR: {item.vitalSignsSnapshot?.heartRate || 'N/A'} BPM</Text>
                                                    <Text>RR: {item.vitalSignsSnapshot?.respiratoryRate || 'N/A'} /min</Text>
                                                    <Text>O₂: {item.vitalSignsSnapshot?.oxygenSaturation || 'N/A'}%</Text>
                                                    <Text>Temp: {item.vitalSignsSnapshot?.temperature || 'N/A'}°C</Text>
                                                    <Text>
                                                        BP: {item.vitalSignsSnapshot?.bloodPressure?.systolic || 'N/A'}/
                                                        {item.vitalSignsSnapshot?.bloodPressure?.diastolic || 'N/A'}
                                                    </Text>
                                                </SimpleGrid>

                                                {item.patientMetadata?.bmi && (
                                                    <Text fontSize="xs" mt={2}>
                                                        BMI: {item.patientMetadata.bmi.toFixed(1)}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </Box>
                                ))}
                            </VStack>
                        </Box>
                    </>
                )}
            </VStack>
        </Box>
    );
};

export default RiskAssessmentCard;