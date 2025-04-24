// AddVolunteer.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const [fieldErrors, setFieldErrors] = useState({
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

    const validateField = (name, value) => {
        let errorMessage = '';
        
        if (!value.trim()) {
            return 'This field is required';
        }
        
        switch (name) {
            case 'user_email':
                if (!/\S+@\S+\.\S+/.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'user_phone_no':
                if (!/^\d{10}$/.test(value)) {
                    errorMessage = 'Phone number must be exactly 10 digits';
                }
                break;
            case 'user_age':
                const age = parseInt(value);
                if (isNaN(age) || age < 18 || age > 100) {
                    errorMessage = 'Age must be between 18 and 100';
                }
                break;
            case 'user_password':
                if (value.length < 6) {
                    errorMessage = 'Password must be at least 6 characters long';
                }
                break;
            default:
                break;
        }
        
        return errorMessage;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear field error when user starts typing
        setFieldErrors({ ...fieldErrors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        
        // Validate each field
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });
        
        setFieldErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            setError('Please correct the errors before submitting');
            return;
        }
        
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
                    <label htmlFor="user_name">
                        Username <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="user_name"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                        placeholder="Enter username"
                        className={fieldErrors.user_name ? "error-input" : ""}
                    />
                    {fieldErrors.user_name && <div className="field-error">{fieldErrors.user_name}</div>}
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_email">
                        Email <span className="required">*</span>
                    </label>
                    <input
                        type="email"
                        id="user_email"
                        name="user_email"
                        value={formData.user_email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className={fieldErrors.user_email ? "error-input" : ""}
                    />
                    {fieldErrors.user_email && <div className="field-error">{fieldErrors.user_email}</div>}
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_phone_no">
                        Phone Number <span className="required">*</span>
                    </label>
                    <input
                        type="tel"
                        id="user_phone_no"
                        name="user_phone_no"
                        value={formData.user_phone_no}
                        onChange={handleChange}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                        className={fieldErrors.user_phone_no ? "error-input" : ""}
                    />
                    {fieldErrors.user_phone_no && <div className="field-error">{fieldErrors.user_phone_no}</div>}
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_age">
                        Age <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        id="user_age"
                        name="user_age"
                        value={formData.user_age}
                        onChange={handleChange}
                        min="18"
                        max="100"
                        placeholder="Enter age (18-100)"
                        className={fieldErrors.user_age ? "error-input" : ""}
                    />
                    {fieldErrors.user_age && <div className="field-error">{fieldErrors.user_age}</div>}
                </div>

                <div className="add-volunteer-group">
                    <label htmlFor="user_password">
                        Password <span className="required">*</span>
                    </label>
                    <input
                        type="password"
                        id="user_password"
                        name="user_password"
                        value={formData.user_password}
                        onChange={handleChange}
                        placeholder="Enter password (min 6 characters)"
                        className={fieldErrors.user_password ? "error-input" : ""}
                    />
                    {fieldErrors.user_password && <div className="field-error">{fieldErrors.user_password}</div>}
                </div>

                <div className="add-volunteer-actions">
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