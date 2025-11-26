import { useState, useEffect, useRef } from 'react';
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
    Divider,
    Collapse,
    IconButton,
    SimpleGrid
} from '@chakra-ui/react';
import { WarningIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const RiskAssessmentCard = ({ patientId, demoMode = false, demoVitals = null, patientInfo = null }) => {
    const [assessment, setAssessment] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [demoAssessment, setDemoAssessment] = useState(null);
    const [demoLoading, setDemoLoading] = useState(false);
    const demoFetchRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const bg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.200");
    const historyBg = useColorModeValue("gray.50", "gray.700");

    // Fetch real assessment data (when not in demo mode)
    useEffect(() => {
        if (demoMode) return;

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
    }, [patientId, API_URL, demoMode]);

    // Fetch demo assessment when vitals change
    useEffect(() => {
        if (!demoMode || !demoVitals) {
            setDemoAssessment(null);
            return;
        }

        // Debounce the API calls to avoid overwhelming the server
        if (demoFetchRef.current) {
            clearTimeout(demoFetchRef.current);
        }

        demoFetchRef.current = setTimeout(async () => {
            try {
                setDemoLoading(true);
                const idToken = localStorage.getItem('idToken');

                const response = await fetch(`${API_URL}/patient/demo-risk-assessment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                        vitals: demoVitals,
                        patientInfo: patientInfo
                    })
                });

                const data = await response.json();

                if (data.success) {
                    setDemoAssessment(data.data);
                }
            } catch (err) {
                console.error('Demo assessment error:', err);
            } finally {
                setDemoLoading(false);
            }
        }, 500); // Wait 500ms after last vital change before fetching

        return () => {
            if (demoFetchRef.current) {
                clearTimeout(demoFetchRef.current);
            }
        };
    }, [demoMode, demoVitals, patientInfo, API_URL]);

    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Determine which assessment to display
    const displayAssessment = demoMode ? demoAssessment : assessment;
    const isLoading = demoMode ? (demoLoading && !demoAssessment) : loading;

    if (isLoading) {
        return (
            <Box bg={bg} p={6} rounded="lg" shadow="lg" textAlign="center" minH="400px" display="flex" alignItems="center" justifyContent="center">
                <VStack>
                    <Spinner size="lg" color="blue.500" />
                    <Text mt={2} color={textColor} fontSize="sm">
                        {demoMode ? "Analyzing vitals..." : "Loading AI assessment..."}
                    </Text>
                </VStack>
            </Box>
        );
    }

    if (!demoMode && error) {
        return (
            <Box bg={bg} p={6} rounded="lg" shadow="lg" minH="400px">
                <Alert status="warning">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!displayAssessment) {
        return (
            <Box bg={bg} p={6} rounded="lg" shadow="lg" minH="400px">
                <Heading size="md" mb={4}>AI Risk Assessment</Heading>
                <Text color={textColor}>
                    {demoMode ? "Waiting for vital signs data..." : "No assessment available"}
                </Text>
            </Box>
        );
    }

    const isHighRisk = displayAssessment.riskLevel === 'High Risk';

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
            transition="border-color 0.3s"
        >
            <VStack align="stretch" spacing={4} flex="1">
                <HStack justify="space-between" align="center">
                    <Heading size="md">AI Risk Assessment</Heading>
                    {demoMode && (
                        <Badge colorScheme="purple" variant="solid">
                            LIVE DEMO
                        </Badge>
                    )}
                </HStack>

                {/* Demo loading indicator */}
                {demoMode && demoLoading && (
                    <HStack spacing={2}>
                        <Spinner size="xs" color="purple.500" />
                        <Text fontSize="xs" color="purple.500">Updating prediction...</Text>
                    </HStack>
                )}

                {/* Current Assessment */}
                <Box>
                    <HStack mb={2}>
                        <Badge
                            colorScheme={isHighRisk ? "red" : "green"}
                            fontSize="lg"
                            px={3}
                            py={1}
                            rounded="md"
                            transition="all 0.3s"
                        >
                            {displayAssessment.riskLevel}
                        </Badge>
                        <Text color={textColor} fontSize="sm">
                            {(displayAssessment.confidence * 100).toFixed(0)}% confidence
                        </Text>
                    </HStack>

                    {/* Probabilities */}
                    {displayAssessment.probabilities && (
                        <HStack spacing={4} mb={2} fontSize="xs" color={textColor}>
                            <Text>
                                Low: {(displayAssessment.probabilities['Low Risk'] * 100).toFixed(1)}%
                            </Text>
                            <Text>
                                High: {(displayAssessment.probabilities['High Risk'] * 100).toFixed(1)}%
                            </Text>
                        </HStack>
                    )}

                    {displayAssessment.riskFactors && displayAssessment.riskFactors.length > 0 && (
                        <Box mt={2}>
                            <Text fontSize="sm" fontWeight="bold" mb={1}>Risk Factors:</Text>
                            <List spacing={1}>
                                {displayAssessment.riskFactors.map((factor, idx) => (
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
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="medium">{factor.factor}: {factor.value}</Text>
                                                <Text fontSize="xs" color={textColor}>{factor.explanation}</Text>
                                            </VStack>
                                        </HStack>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {displayAssessment.riskFactors && displayAssessment.riskFactors.length === 0 && (
                        <HStack color="green.500" fontSize="sm">
                            <CheckCircleIcon />
                            <Text>No significant risk factors identified</Text>
                        </HStack>
                    )}

                    <Text fontSize="xs" color="gray.500" mt={2}>
                        {demoMode ? "Live prediction" : `Assessed: ${new Date(displayAssessment.timestamp).toLocaleString()}`}
                    </Text>
                </Box>

                {/* Assessment History - Only show when not in demo mode */}
                {!demoMode && history.length > 0 && (
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