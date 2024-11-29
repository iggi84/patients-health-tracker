import { Container, SimpleGrid, Text, VStack, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePatientStore } from "../store/patientStore";
import PatientCard from "../components/PatientCard";

const HomePage = () => {
    const { fetchPatients, patients } = usePatientStore();
    const [loading, setLoading] = useState(true); // State to handle loading

    // Fetch patients when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchPatients();
            setLoading(false);
        };
        fetchData();
    }, [fetchPatients]);

    return (
        <Container maxW="container.xl" py={12}>
            <VStack spacing={8}>
                <Text
                    fontSize="30"
                    fontWeight="bold"
                    bgGradient="linear(to-r, blue.500, blue.500)"
                    bgClip="text"
                    textAlign="center"
                >
                    Patient Management System
                </Text>

                {/* Show spinner while loading */}
                {loading ? (
                    <Spinner size="xl" color="blue.500" />
                ) : (
                    <>
                        {/* Display patients */}
                        <SimpleGrid
                            columns={{
                                base: 1,
                                md: 2,
                                lg: 3,
                            }}
                            spacing={10}
                            w="full"
                        >
                            {patients.map((patient) => (
                                <PatientCard key={patient._id} patient={patient} />
                            ))}
                        </SimpleGrid>

                        {/* Fallback if no patients exist */}
                        {patients.length === 0 && (
                            <Text fontSize="xl" textAlign="center" fontWeight="bold" color="gray.500">
                                No patients found 😢{" "}
                                <Link to="/addPatient">
                                    <Text
                                        as="span"
                                        color="blue.500"
                                        _hover={{ textDecoration: "underline" }}
                                    >
                                        Add a new patient
                                    </Text>
                                </Link>
                            </Text>
                        )}
                    </>
                )}
            </VStack>
        </Container>
    );
};

export default HomePage;
