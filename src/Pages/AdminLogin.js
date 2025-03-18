import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css';

const AdminLogin = () => {
  const [user_name, setUserName] = useState('');
  const [user_password, setUserPassword] = useState('');
  const navigate = useNavigate();
  const PORT = process.env.PORT || 5002;

  const handleAdminLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/login`, { user_name, user_password, user_type: 'admin' });
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.token);
        navigate('/dashboard-admin');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Server error');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Admin Login</h2>
      <div className="login-admin-form">
        <input
          type="text"
          placeholder="Username"
          value={user_name}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={user_password}
          onChange={(e) => setUserPassword(e.target.value)}
        />
        <button onClick={handleAdminLogin} className="login-submit-btn">Submit</button>
      </div>
    </div>
  );
};

export default AdminLogin;
