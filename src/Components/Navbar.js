// src/Components/Navbar.js

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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const type = localStorage.getItem('userType');
    setIsLoggedIn(!!token);
    setUserType(type);
    setMenuOpen(false); // close menu on navigation
  }, [pathname]);

  const handleLogout = async () => {
    await privateAxios.post('/api/logs', { action: 'Logout' });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Dashboard paths
  const ADMIN_DASH = '/dashboard-admin';
  const VOLUNTEER_DASH = '/dashboard';

  // Determine if we should show the hamburger menu
  const showMenuIcon =
    isLoggedIn &&
    (userType === 'admin' || userType === 'volunteer') &&
    pathname !== ADMIN_DASH &&
    pathname !== VOLUNTEER_DASH;

  // Full nav sets
  const adminNavLinks = [
    { path: ADMIN_DASH, label: 'Admin Dashboard' },
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
    { path: VOLUNTEER_DASH, label: 'Volunteer Dashboard' },
    { path: '/patient-registration', label: 'Patient Registration' },
    { path: '/vitals', label: 'Vitals' },
    { path: '/doctor-assigning', label: 'Doctor Assigning' },
    { path: '/doctor-prescription', label: 'Doctor Prescription' },
    { path: '/medicine-pickup', label: 'Medicine Pickup' },
    { path: '/medicine-verification', label: 'Medicine Verification' },
  ];

  // Choose which links to show
  let linksToDisplay = [];
  if (isLoggedIn && userType === 'admin') {
    linksToDisplay = pathname === ADMIN_DASH ? [] : adminNavLinks;
  } else if (isLoggedIn && userType === 'volunteer') {
    linksToDisplay = pathname === VOLUNTEER_DASH ? [] : volunteerNavLinks;
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={SwechaLogo} alt="Swecha Logo" className="logo-img" />
        </Link>
      </div>

      {showMenuIcon && (
        <button
          className="menu-icon"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      )}

      <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
        {linksToDisplay.map((link, idx) => (
          <li key={idx}>
            <Link
              to={link.path}
              onClick={() => setMenuOpen(false)} // close menu on select
            >
              {link.label}
            </Link>
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
