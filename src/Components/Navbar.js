import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../Styles/Navbar.css";
import SwechaLogo from "./SwechaLogo.png"; // Adjust path if needed

const Navbar = () => {
  const location = useLocation();

  // Hide navbar links if on Dashboard
  const isDashboard = location.pathname === "/";

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src={SwechaLogo} alt="Swecha Logo" className="logo-img" />
        </Link>
      </div>
      {!isDashboard && (
        <ul className="nav-links">
          <li><Link to="/">DASHBOARD</Link></li>
          <li><Link to="/patient-registration">Patient Registration</Link></li>
          <li><Link to="/vitals">Vitals</Link></li>
          <li><Link to="/doctor-assigning">Doctor Assigning</Link></li>
          <li><Link to="/doctor-prescription">Doctor Prescription</Link></li>
          <li><Link to="/medicine-pickup">Medicine Pickup</Link></li>
          <li><Link to="/medicine-verification">Medicine Verification</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
