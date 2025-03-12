import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Pages/Dashboard';
import PatientRegistration from './components/Pages/PatientRegistration';
import Vitals from './components/Pages/Vitals';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route path="/patient-registration" element={<PatientRegistration/>} />
        <Route path="/vitals" element={<Vitals/>} />
        <Route path="/doctor-assigning" element={<div>Doctor Assigning Page</div>} />
        <Route path="/doctor-prescription" element={<div>Doctor Prescription Page</div>} />
        <Route path="/medicine-pickup" element={<div>Medicine Pickup Page</div>} />
        <Route path="/medicine-verification" element={<div>Medicine Verification Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;