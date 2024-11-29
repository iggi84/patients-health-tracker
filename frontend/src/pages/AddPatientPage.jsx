import {Box, Button, Container, Heading, Input, Textarea, useColorModeValue, useToast, VStack} from "@chakra-ui/react";
import React, { useState } from "react";
import { usePatientStore } from "../store/patientStore.js";

const AddPatientPage = () => {
    const [newPatient, setNewPatient] = useState({
        name: "",
        age: "",
        email: "",
        phone: "",
        medicalHistory: "",
        assignedDeviceId: "",
    });

    const toast = useToast();

    const { createPatient } = usePatientStore();

    const handleAddPatient = async () => {
        // Convert medical history from string to array
        const formattedPatient = {
            ...newPatient,
            medicalHistory: newPatient.medicalHistory
                ? newPatient.medicalHistory.split(",").map((item) => item.trim())
                : [],
        };

        const { success, message } = await createPatient(formattedPatient);

        if (!success) {
            toast({
                title: "Error",
                description: message,
                status: "error",
                isClosable: true,
            });
        } else {
            toast({
                title: "Success",
                description: message,
                status: "success",
                isClosable: true,
            });
        }

        // Reset form fields
        setNewPatient({
            name: "",
            age: "",
            email: "",
            phone: "",
            medicalHistory: "",
            assignedDeviceId: "",
        });
    };

    return (
        <Container maxW={"container.sm"}>
            <VStack spacing={8}>
                <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
                    Add New Patient
                </Heading>
                <Box
                    w={"full"}
                    bg={useColorModeValue("white", "gray.800")}
                    p={8}
                    rounded={"lg"}
                    shadow={"md"}
                >
                    <VStack spacing={4}>
                        <Input
                            placeholder="Patient Name"
                            name="name"
                            value={newPatient.name}
                            onChange={(e) =>
                                setNewPatient({ ...newPatient, name: e.target.value })
                            }
                            required
                        />

                        {/* Age */}
                        <Input
                            placeholder="Age"
                            name="age"
                            type="number"
                            value={newPatient.age}
                            onChange={(e) =>
                                setNewPatient({ ...newPatient, age: e.target.value })
                            }
                            required
                        />

                        {/* Email */}
                        <Input
                            placeholder="Email"
                            name="email"
                            type="email"
                            value={newPatient.email}
                            onChange={(e) =>
                                setNewPatient({ ...newPatient, email: e.target.value })
                            }
                            required
                        />

                        {/* Phone */}
                        <Input
                            placeholder="Phone Number"
                            name="phone"
                            value={newPatient.phone}
                            onChange={(e) =>
                                setNewPatient({ ...newPatient, phone: e.target.value })
                            }
                            required
                        />

                        {/* Medical History */}
                        <Textarea
                            placeholder="Medical History (comma-separated)"
                            name="medicalHistory"
                            value={newPatient.medicalHistory}
                            onChange={(e) =>
                                setNewPatient({ ...newPatient, medicalHistory: e.target.value })
                            }
                        />

                        {/* Assigned Device ID */}
                        <Input
                            placeholder="Assigned Device ID"
                            name="assignedDeviceId"
                            value={newPatient.assignedDeviceId}
                            onChange={(e) =>
                                setNewPatient({
                                    ...newPatient,
                                    assignedDeviceId: e.target.value,
                                })
                            }
                        />

                        {/* Submit Button */}
                        <Button colorScheme="blue" onClick={handleAddPatient} w={"full"}>
                            Add Patient
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default AddPatientPage;
