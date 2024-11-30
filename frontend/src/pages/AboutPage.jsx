import {Box, Container, Heading, Text, useColorModeValue, VStack} from '@chakra-ui/react';
import React from 'react';

const AboutPage = () => {
    const textColor = useColorModeValue("blue.500", "blue.300");
    return (
        <Container maxW="1140px" py={8}>
            {/* Page Header */}
            <VStack spacing={4} align="start">
                <Heading
                    bg={textColor}
                    as="h1"
                    size="xl"
                    textAlign="left"
                    bgClip="text"
                >
                    About PSMS
                </Heading>
                <Text fontSize="lg" color="gray.400">
                    Welcome to the Patient Safety Management System (PSMS), developed as part of a university project for ITW601 (N03812) Info Tech Work Inter Learn at Torrens University.
                </Text>
            </VStack>

            {/* Description Section */}
            <Box mt={6}>
                <Heading as="h2" size="md" color={textColor} mb={2}>
                    Project Overview
                </Heading>
                <Text fontSize="md" color="gray.400" lineHeight="1.8">
                    PSMS is a comprehensive system designed to enhance patient safety through streamlined data management and intelligent monitoring.
                    It was developed by a team of three dedicated students as part of our academic endeavor to provide a practical solution to real-world challenges in healthcare management.
                </Text>
            </Box>

            {/* Problem Solved */}
            <Box mt={6}>
                <Heading as="h2" size="md" color={textColor} mb={2}>
                    What Are We Solving?
                </Heading>
                <Text fontSize="md" color="gray.400" lineHeight="1.8">
                    The PSMS aims to address the critical need for efficient monitoring and alerting in healthcare settings. By ensuring timely data access and streamlined processes, we hope to empower healthcare professionals to make informed decisions and improve patient outcomes. This project demonstrates the application of modern technologies like cloud computing and data management to create impactful solutions.
                </Text>
            </Box>

            {/* Team Acknowledgment */}
            <Box mt={6}>
                <Heading as="h2" size="md" color={textColor} mb={2}>
                    Team Members
                </Heading>
                <Text fontSize="md" color="gray.400" lineHeight="1.8">
                    This project was collaboratively developed by:
                </Text>
                <VStack align="start" mt={2} spacing={1} pl={4}>
                    <Text fontSize="md" color="gray.400">• Igor Vojinovic A00137965 Focused on Backend Development and helping with testing.</Text>
                    <Text fontSize="md" color="gray.400">• Jonathan Josipp Guachamin Jimenez A00109506 Specialized in Frontend Development and UI Design.</Text>
                    <Text fontSize="md" color="gray.400">• Mehmet Emin Seyhan  A00111734 Led Project Management and Deployment to AWS.</Text>
                </VStack>
            </Box>
        </Container>
    );
};
export default AboutPage;
