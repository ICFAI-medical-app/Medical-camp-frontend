import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./Components/Navbar";
import Dashboard from './Pages/Dashboard';
import PatientRegistration from './Pages/PatientRegistration';
import Vitals from './Pages/Vitals';
import DoctorPrescription from './Pages/DoctorPrescription';
import DoctorAssigning from './Pages/DoctorAssigning';
import MedicinePickup from './Pages/MedicinePickup'; 
import './App.css';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route path="/patient-registration" element={<PatientRegistration/>} />
        <Route path="/vitals" element={<Vitals/>} />
        <Route path="/doctor-assigning" element={<DoctorAssigning />} />
        <Route path="/doctor-prescription" element={<DoctorPrescription/>} />
        <Route path="/medicine-pickup" element={<MedicinePickup />} />
        <Route path="/medicine-verification" element={<div>Medicine Verification Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;