import {Button, Container, Flex, HStack, Text, useColorMode, useColorModeValue} from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusSquareIcon } from "@chakra-ui/icons";
import { LuSun } from "react-icons/lu";
import { IoMoon } from "react-icons/io5";

const Navbar = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const textColor = useColorModeValue("blue.500", "blue.300");

    return (
        <Container maxW="1140px" px={4}>
            <Flex
                h={16}
                alignItems="center"
                justifyContent="space-between"
                flexDir={{
                    base: "column",
                    sm: "row"
                }}
            >
                {/* Icon and Text */}
                <HStack spacing={2} alignItems="center">
                    <img
                        src="/patientoTopSmallIcon.svg"
                        alt="App Icon"
                        style={{ width: "32px", height: "32px" }}
                    />
                    <Text
                        color={textColor}
                        fontSize={{ base: "22", sm: "28" }}
                        fontWeight="bold"
                        textTransform="uppercase"
                    >
                        <Link to="/">PSMS</Link>
                    </Text>
                </HStack>

                {/* Buttons */}
                <HStack spacing={4} alignItems="center">
                    {/* Link to Add Patient */}
                    <Link to="/addPatient">
                        <Button>
                            <PlusSquareIcon fontSize={20} />
                            Add Patient
                        </Button>
                    </Link>
                    {/* Link to Another Page */}
                    <Link to="/about">
                        <Button colorScheme="blue">
                            About
                        </Button>
                    </Link>
                    {/* Toggle Light/Dark Mode */}
                    <Button onClick={toggleColorMode}>
                        {colorMode === "light" ? <IoMoon /> : <LuSun size="20" />}
                    </Button>
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;
