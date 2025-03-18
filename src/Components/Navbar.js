import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../Styles/Navbar.css";
import SwechaLogo from "./SwechaLogo.png";

const Navbar = () => {
  const { pathname } = useLocation();

  const adminLinks = [
    { path: '/dashboard-admin', label: 'Admin Dashboard' },
    { path: '/doctor-availability', label: 'Doctor Availability' },
    { path: '/add-doctor', label: 'Add Doctor' },
    { path: '/update-medicine-stock', label: 'Update Medicine Stock' },
    { path: '/add-new-medicine', label: 'Add New Medicine' },
    {path: '/get-doctors', label: 'View Doctors'},
    { path: '/view-patients', label: 'View Patients' },
    { path: '/get-medicines', label: 'View Medicines' },
  ];

  const userLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/patient-registration', label: 'Patient Registration' },
    { path: '/vitals', label: 'Vitals' },
    { path: '/doctor-assigning', label: 'Doctor Assigning' },
    { path: '/doctor-prescription', label: 'Doctor Prescription' },
    { path: '/medicine-pickup', label: 'Medicine Pickup' },
    { path: '/medicine-verification', label: 'Medicine Verification' },
  ];

  if (pathname === '/dashboard' || pathname === '/dashboard-admin') {
    return (
      <nav className="navbar">
        <div className="logo">
          <Link to="/"><img src={SwechaLogo} alt="Swecha Logo" className="logo-img" /></Link>
        </div>
      </nav>
    );
  }

  const adminPages = adminLinks.map(link => link.path);
  const userPages = userLinks.map(link => link.path);

  let linksToDisplay = [];
  if (adminPages.includes(pathname)) {
    linksToDisplay = adminLinks;
  } else if (userPages.includes(pathname)) {
    linksToDisplay = userLinks;
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/"><img src={SwechaLogo} alt="Swecha Logo" className="logo-img" /></Link>
      </div>
      <ul className="nav-links">
        {linksToDisplay.map((link, index) => (
          <li key={index}>
            <Link to={link.path}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
