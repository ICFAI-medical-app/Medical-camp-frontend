import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import "../Styles/Navbar.css";
import SwechaLogo from "./SwechaLogo.png";
import { privateAxios } from '../api/axios';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const type = localStorage.getItem('userType');
    setIsLoggedIn(!!token);
    setUserType(type); // "admin" or "volunteer"
  }, [pathname]);

  const handleLogout = async () => {
    await privateAxios.post('/api/logs', { action: 'Logout' });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Dashboard links
  const adminDashboardLink = { path: '/dashboard-admin', label: 'Admin Dashboard' };
  const volunteerDashboardLink = { path: '/dashboard', label: 'Volunteer Dashboard' };

  // Full nav sets
  const adminNavLinks = [
    adminDashboardLink,
    { path: '/doctor-availability', label: 'Doctor Availability' },
    { path: '/add-doctor', label: 'Add Doctor' },
    { path: '/update-medicine-stock', label: 'Update Medicine Stock' },
    { path: '/add-new-medicine', label: 'Add New Medicine' },
    { path: '/get-doctors', label: 'View Doctors' },
    { path: '/get-medicines', label: 'View Medicines' },
    { path: '/get-volunteers', label: 'View Volunteers' },
    { path: '/add-volunteer', label: 'Add Volunteer' },
  ];

  const volunteerNavLinks = [
    volunteerDashboardLink,
    { path: '/patient-registration', label: 'Patient Registration' },
    { path: '/vitals', label: 'Vitals' },
    { path: '/doctor-assigning', label: 'Doctor Assigning' },
    { path: '/doctor-prescription', label: 'Doctor Prescription' },
    { path: '/medicine-pickup', label: 'Medicine Pickup' },
    { path: '/medicine-verification', label: 'Medicine Verification' },
  ];

  let linksToDisplay = [];

  if (isLoggedIn && userType === 'admin') {
    // On admin dashboard → no links; otherwise show all admin links
    linksToDisplay = pathname === adminDashboardLink.path
      ? []
      : adminNavLinks;
  } else if (isLoggedIn && userType === 'volunteer') {
    // On volunteer dashboard → no links; otherwise show all volunteer links
    linksToDisplay = pathname === volunteerDashboardLink.path
      ? []
      : volunteerNavLinks;
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/"><img src={SwechaLogo} alt="Swecha Logo" className="logo-img" /></Link>
      </div>

      <ul className="nav-links">
        {linksToDisplay.map((link, idx) => (
          <li key={idx}>
            <Link to={link.path}>{link.label}</Link>
          </li>
        ))}
      </ul>

      {isLoggedIn && (
        <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
