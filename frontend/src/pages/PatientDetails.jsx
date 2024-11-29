import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Text, VStack, Heading, Spinner } from "@chakra-ui/react";

const PatientDetails = () => {
    const { id } = useParams(); // Get the patient ID from the route
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL;
                const response = await fetch(`${API_URL}/patient/${id}`);
                const data = await response.json();
                if (data.success) {
                    setPatient(data.data);
                } else {
                    console.error("Error fetching patient details:", data.message);
                }
            } catch (error) {
                console.error("Error:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientDetails();
    }, [id]);

    if (loading) {
        return <Spinner size="xl" color="blue.500" />;
    }

    if (!patient) {
        return <Text color="red.500">Patient not found.</Text>;
    }

    return (
        <Box maxW="container.sm" mx="auto" p={4}>
            <VStack spacing={4}>
                <Heading size="lg">Patient Details</Heading>
                <Text>
                    <strong>Name:</strong> {patient.name}
                </Text>
                <Text>
                    <strong>Age:</strong> {patient.age}
                </Text>
                <Text>
                    <strong>Contact Email:</strong> {patient.contactInfo.email}
                </Text>
                <Text>
                    <strong>Contact Phone:</strong> {patient.contactInfo.phone}
                </Text>
                <Text>
                    <strong>Medical History:</strong> {patient.medicalHistory.join(", ") || "N/A"}
                </Text>
                <Text>
                    <strong>Assigned Device ID:</strong> {patient.assignedDeviceId || "N/A"}
                </Text>
            </VStack>
        </Box>
    );
};

export default PatientDetails;
