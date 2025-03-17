import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css';

const Login = () => {
  const navigate = useNavigate();

  const handleVolunteerClick = () => {
    navigate('/dashboard');
  };

  const handleAdminClick = () => {
    navigate('/admin-login');
  };
  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <div className="login-button-group">
        <button onClick={handleVolunteerClick} className="login-volunteer-btn">Volunteer</button>
        <button onClick={handleAdminClick} className="login-admin-btn">Admin</button>
      </div>
    </div>
  );
};

export default Login;
  