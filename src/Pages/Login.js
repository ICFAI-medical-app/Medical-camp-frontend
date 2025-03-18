import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    '/images/healthcare1.jpg',
    '/images/healthcare2.jpg',
    '/images/healthcare3.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  const handleVolunteerClick = () => {
    navigate('/dashboard');
  };

  const handleAdminClick = () => {
    navigate('/admin-login');
  };

  return (
    <div className="page-container">
      <header className="app-header">
        <h1 className='login-heading'>SWECHA Healthcare</h1>
      </header>
      
      <div className="login-container">
        <div className="login-section">
          <div className="login-content">
            <h2 className="login-title">Login</h2>
            <div className="login-button-group">
              <button onClick={handleVolunteerClick} className="login-volunteer-btn">Volunteer</button>
              <button onClick={handleAdminClick} className="login-admin-btn">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;