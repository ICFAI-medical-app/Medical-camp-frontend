import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import PatientRegistration from './Pages/PatientRegistration';
import Vitals from './Pages/Vitals';
import DoctorPrescription from './Pages/DoctorPrescription'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route path="/patient-registration" element={<PatientRegistration/>} />
        <Route path="/vitals" element={<Vitals/>} />
        <Route path="/doctor-assigning" element={<div>Doctor Assigning Page</div>} />
        <Route path="/doctor-prescription" element={<DoctorPrescription/>} />
        <Route path="/medicine-pickup" element={<div>Medicine Pickup Page</div>} />
        <Route path="/medicine-verification" element={<div>Medicine Verification Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;