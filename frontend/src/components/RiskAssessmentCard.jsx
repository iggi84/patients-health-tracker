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
    Spacer
} from '@chakra-ui/react';
import { WarningIcon, CheckCircleIcon } from '@chakra-ui/icons';

const RiskAssessmentCard = ({ patientId }) => {
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const bg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.200");

    useEffect(() => {
        const fetchRiskAssessment = async () => {
            try {
                setLoading(true);
                setError(null);

                const idToken = localStorage.getItem('idToken');
                const response = await fetch(
                    `${API_URL}/patient/${patientId}/risk-assessment`,
                    {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        }
                    }
                );

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message);
                }

                setAssessment(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchRiskAssessment();
        }
    }, [patientId, API_URL]);

    if (loading) {
        return (
            <Box bg={bg} p={6} rounded="lg" shadow="lg" textAlign="center" minH="200px" display="flex" alignItems="center" justifyContent="center">
                <VStack>
                    <Spinner size="lg" color="blue.500" />
                    <Text mt={2} color={textColor} fontSize="sm">Loading AI assessment...</Text>
                </VStack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bg} p={6} rounded="lg" shadow="lg">
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
            h="100%"
            display="flex"
            flexDirection="column"
        >
            <VStack align="stretch" spacing={4} flex="1">
                <Heading size="md">AI Risk Assessment</Heading>

                <HStack>
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
                    <Box>
                        <Heading size="sm" mb={2}>Risk Factors Identified:</Heading>
                        <List spacing={2}>
                            {assessment.riskFactors.map((factor, idx) => (
                                <ListItem
                                    key={idx}
                                    p={3}
                                    bg={
                                        factor.severity === 'critical' ? 'red.50' :
                                            factor.severity === 'high' ? 'orange.50' :
                                                'yellow.50'
                                    }
                                    rounded="md"
                                >
                                    <HStack align="start">
                                        <ListIcon
                                            as={WarningIcon}
                                            color={
                                                factor.severity === 'critical' ? 'red.500' :
                                                    factor.severity === 'high' ? 'orange.500' :
                                                        'yellow.500'
                                            }
                                            mt={1}
                                        />
                                        <Box>
                                            <Text fontWeight="bold">{factor.factor}</Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Value: {factor.value}
                                            </Text>
                                            <Text fontSize="sm" color="gray.500" mt={1}>
                                                {factor.explanation}
                                            </Text>
                                        </Box>
                                    </HStack>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {assessment.riskFactors && assessment.riskFactors.length === 0 && (
                    <HStack color="green.500">
                        <CheckCircleIcon />
                        <Text>No significant risk factors identified</Text>
                    </HStack>
                )}

                <Spacer />

                <Text fontSize="xs" color="gray.500" pt={2} borderTopWidth="1px">
                    Last assessed: {new Date(assessment.timestamp).toLocaleString()}
                </Text>
            </VStack>
        </Box>
    );
};

export default RiskAssessmentCard;