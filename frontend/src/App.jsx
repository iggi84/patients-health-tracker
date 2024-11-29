import {Box, useColorModeValue} from "@chakra-ui/react";
import Navbar from "./components/Navbar.jsx";
import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import AddPatientPage from "./pages/AddPatientPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";


function App() {
  return (
      <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
          <Navbar/>
          <Routes>
              <Route path="/" element={<HomePage/>}/>
              <Route path="/addPatient" element={<AddPatientPage/>}/>
              <Route path="/about" element={<AboutPage/>}/>
          </Routes>
      </Box>
  )
}

export default App
