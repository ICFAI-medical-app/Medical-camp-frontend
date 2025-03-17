import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css';

const Login = () => {
    const [user_name, setUserName] = useState('');
    const [user_password, setUserPassword] = useState('');
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const navigate = useNavigate();

    const handleVolunteerClick = () => {
        navigate('/dashboard');
    };

    const handleAdminClick = () => {
        setShowAdminLogin(true);
    };

    const handleAdminLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5002/api/admin/login', { user_name, user_password, user_type: 'admin' });

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
            <h2>Login</h2>
            {!showAdminLogin ? (
                <div className="button-group">
                    <button onClick={handleVolunteerClick}>Volunteer</button>
                    <button onClick={handleAdminClick}>Admin</button>
                </div>
            ) : (
                <div className="admin-login">
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
                    <button onClick={handleAdminLogin}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default Login;