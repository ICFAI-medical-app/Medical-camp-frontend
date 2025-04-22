// AddVolunteer.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { privateAxios } from '../api/axios';
import '../Styles/AddVolunteer.css';

const AddVolunteer = () => {
    const [formData, setFormData] = useState({
        user_name: '',
        user_phone_no: '',
        user_email: '',
        user_age: '',
        user_password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await privateAxios.post(
                '/api/admin/add_volunteer',
                formData
            );

            setMessage('Volunteer added successfully!');
            setFormData({
                user_name: '',
                user_phone_no: '',
                user_email: '',
                user_age: '',
                user_password: ''
            });

            setTimeout(() => {
                navigate('/get-volunteers');
            }, 2000);

        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'Failed to add volunteer');
            } else {
                setError('Server error. Please try again later.');
            }
            console.error('Error adding volunteer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-volunteer-container">
            <h2>Add New Volunteer</h2>

            {message && <div className="add-volunteer-success">{message}</div>}
            {error && <div className="add-volunteer-error">{error}</div>}

            <form onSubmit={handleSubmit} className="add-volunteer-form">
                <div className="add-volunteer-group">
                    <label htmlFor="user_name">Username</label>
                    <input
                        type="text"
                        id="user_name"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                    />
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_email">Email</label>
                    <input
                        type="email"
                        id="user_email"
                        name="user_email"
                        value={formData.user_email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        required
                    />
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_phone_no">Phone Number</label>
                    <input
                        type="tel"
                        id="user_phone_no"
                        name="user_phone_no"
                        value={formData.user_phone_no}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                        pattern="^(\d{10})?$"
                        title="Phone number must be exactly 10 digits or empty"
                        maxLength="10"
                    />
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_age">Age</label>
                    <input
                        type="number"
                        id="user_age"
                        name="user_age"
                        value={formData.user_age}
                        onChange={handleChange}
                        min="18"
                        max="100"
                        placeholder="Enter age"
                        required
                    />
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_password">Password</label>
                    <input
                        type="password"
                        id="user_password"
                        name="user_password"
                        value={formData.user_password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                    />
                </div>

                <div className="add-volunteer-actions">
                    {/* <button
                        type="button"
                        onClick={() => navigate('/dashboard-admin')}
                        className="add-volunteer-cancel"
                        disabled={isLoading}
                    >
                        Cancel
                    </button> */}
                    <button
                        type="submit"
                        className="add-volunteer-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding...' : 'Add Volunteer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddVolunteer;