import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/Doctor.css';

function AddDoctor() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        doctor_name: '',
        doctor_email: '',
        doctor_phone_no: '',
        doctor_age: '',
        specialization: '',
        doctor_sex: ''
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id === 'addDoctorName' ? 'doctor_name' :
                id === 'addDoctorEmail' ? 'doctor_email' :
                    id === 'addDoctorPhone' ? 'doctor_phone_no' :
                        id === 'addDoctorAge' ? 'doctor_age' :
                            id === 'addDoctorSpecialization' ? 'specialization' :
                                id === 'addDoctorSex' ? 'doctor_sex' : id]: value
        });
    };

    // const validateForm = () => {
    //     if (!formData.doctor_name) return "Doctor name is required";
    //     if (!formData.doctor_email) return "Email is required";
    //     if (!/\S+@\S+\.\S+/.test(formData.doctor_email)) return "Email is invalid";
    //     if (!formData.doctor_phone_no) return "Phone number is required";
    //     if (!formData.doctor_age) return "Age is required";
    //     if (!formData.specialization) return "Specialization is required";
    //     if (!formData.doctor_sex) return "Sex is required";
    //     return "";
    // };

    const validateForm = () => {
        if (!formData.doctor_name) return "Doctor name is required";
        if (!formData.doctor_phone_no) return "Phone number is required";
        // if (!formData.specialization) return "Specialization is required";

        // Check email format only if email is provided
        if (formData.doctor_email && !/\S+@\S+\.\S+/.test(formData.doctor_email)) {
            return "Email is invalid";
        }

        return "";
    };

    const addDoctor = () => {
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        const PORT = process.env.PORT || 5002;

        axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/add_doctor`, formData)
            .then((response) => {
                if (response.data) {
                    setFormData({
                        doctor_name: '',
                        doctor_email: '',
                        doctor_phone_no: '',
                        doctor_age: '',
                        specialization: '',
                        doctor_sex: ''
                    });
                    alert('Doctor added successfully');
                } else {
                    setError('Received invalid response from server');
                }
            })
            .catch((error) => {
                console.log(error);
                if (error.response && error.response.status === 400 && error.response.data) {
                    // Display the specific error message from the server
                    setError(error.response.data);
                } else {
                    // Use the fallback message for other errors
                    setError(error.response?.data?.message || 'Error while adding a doctor');
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="add-doctor-page">
            <header className="add-doctor-header">
                <h1>Add New Doctor</h1>
            </header>

            <div className="add-doctor-content">
                <div className="add-doctor-form-section">
                    <h2>Doctor Information</h2>
                    <div className="add-doctor-form">
                        {error && <div className="add-doctor-error">{error}</div>}
                        <div className="add-doctor-group">
                            <label htmlFor="addDoctorName">Name</label>
                            <input
                                id="addDoctorName"
                                type="text"
                                placeholder="Name"
                                value={formData.doctor_name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="add-doctor-group">
                            <label htmlFor="addDoctorEmail">Email</label>
                            <input
                                id="addDoctorEmail"
                                type="email"
                                placeholder="Email"
                                value={formData.doctor_email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="add-doctor-group">
                            <label htmlFor="addDoctorPhone">Phone</label>
                            <input
                                id="addDoctorPhone"
                                type="text"
                                placeholder="Phone"
                                value={formData.doctor_phone_no}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="add-doctor-group">
                            <label htmlFor="addDoctorAge">Age</label>
                            <input
                                id="addDoctorAge"
                                type="number"
                                placeholder="Age"
                                value={formData.doctor_age}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="add-doctor-group">
                            <label htmlFor="addDoctorSpecialization">Specialization</label>
                            <input
                                id="addDoctorSpecialization"
                                type="text"
                                placeholder="Specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="add-doctor-group">
                            <label htmlFor="addDoctorSex">Sex</label>
                            <select
                                id="addDoctorSex"
                                value={formData.doctor_sex}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button
                            className="add-doctor-btn"
                            onClick={addDoctor}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add Doctor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddDoctor;
