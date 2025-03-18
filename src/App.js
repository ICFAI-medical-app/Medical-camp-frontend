import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./Components/Navbar";
import Dashboard from './Pages/Dashboard';
import PatientRegistration from './Pages/PatientRegistration';
import Vitals from './Pages/Vitals';
import DoctorPrescription from './Pages/DoctorPrescription';
import DoctorAssigning from './Pages/DoctorAssigning';
import MedicinePickup from './Pages/MedicinePickup'; 
import MedicineVerification from './Pages/MedicineVerification';
import AddDoctor from './Pages/AddDoctor';
import ViewDoctors from './Pages/ViewDoctors';
import DashboardAdmin from './Pages/DashBoardAdmin';
import DoctorAvailability from './Pages/DoctorAvailability';
import ViewPatients from './Pages/ViewPatients';
import ViewMedicines from './Pages/ViewMedicines';
import UpdateMedicineStock from './Pages/UpdateMedicineStock';
import AddMedicine from './Pages/AddMedicine';
import Login from './Pages/Login';
import AdminLogin from './Pages/AdminLogin';
import Footer from './Components/Footer';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/patient-registration" element={<PatientRegistration />} />
            <Route path="/vitals" element={<Vitals />} />
            <Route path="/doctor-assigning" element={<DoctorAssigning />} />
            <Route path="/doctor-prescription" element={<DoctorPrescription />} />
            <Route path="/medicine-pickup" element={<MedicinePickup />} />
            <Route path="/medicine-verification" element={<MedicineVerification />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/doctor-availability" element={<DoctorAvailability />} />
            <Route path="/view-patients" element={<ViewPatients />} />
            <Route path="/get-medicines" element={<ViewMedicines />} />
            <Route path="/update-medicine-stock" element={<UpdateMedicineStock />} />
            <Route path="/add-new-medicine" element={<AddMedicine />} />
            <Route path='/get-doctors' element={<ViewDoctors />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
