import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./Components/Navbar";
import Dashboard from './Pages/Dashboard';
import PatientRegistration from './Pages/PatientRegistration';
import Vitals from './Pages/Vitals';
import DoctorPrescription from './Pages/DoctorPrescription';
import DoctorAssigning from './Pages/DoctorAssigning';
import MedicinePickup from './Pages/MedicinePickup'; 
import Doctor from './Pages/Doctor';
import DashboardAdmin from './Pages/DashBoardAdmin';
import DoctorAvailability from './Pages/DoctorAvailability';
import ViewPatients from './Pages/ViewPatients';
import ViewMedicines from './Pages/ViewMedicines';
import UpdateMedicineStock from './Pages/UpdateMedicineStock';
import AddMedicine from './Pages/AddMedicine';

import './App.css';

function App() {
  // For admin dashboard, we will use DashboardAdmin component in place of Dashboard component
  return (
    <Router>
      <Navbar/>
      <Routes>
        {/* <Route exact path="/" element={<Dashboard />} /> */}
        <Route exact path="/" element={<DashboardAdmin />} />
        <Route path="/patient-registration" element={<PatientRegistration/>} />
        <Route path="/vitals" element={<Vitals/>} />
        <Route path="/doctor-assigning" element={<DoctorAssigning />} />
        <Route path="/doctor-prescription" element={<DoctorPrescription/>} />
        <Route path="/medicine-pickup" element={<MedicinePickup />} />
        <Route path="/medicine-verification" element={<div>Medicine Verification Page</div>} />
        <Route path="/doctor" element={<Doctor/>} />
        <Route path="/doctor-availability" element={<DoctorAvailability/>} />
        <Route path="/view-patients" element={<ViewPatients
        />} />
        <Route path="/get-medicines" element={<ViewMedicines/>} />
        <Route path="/update-medicine-stock" element={<UpdateMedicineStock/>}/>
        <Route path="/add-new-medicine" element={<AddMedicine/>} />
      </Routes>
    </Router>
  );
}

export default App;