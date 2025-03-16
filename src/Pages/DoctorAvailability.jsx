import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/DoctorAvailability.css';

function DoctorAvailabiltiy() {
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    // Fetch all the doctors from the backend.
    useEffect(() => {
        axios.get('http://localhost:5002/api/admin/get_doctors')
            .then((response) => {
                setDoctors(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    // Update the availability of the doctor
    const updateAvailability = (id) => {
        const doctor = doctors.find((doc) => doc._id === id);
        const newAvailability = !doctor.doctor_availability;
        axios.put(`http://localhost:5002/api/admin/update_doctor_availability/${id}`, { doctor_availability: newAvailability })
            .then((response) => {
                setDoctors(doctors.map((doc) => {
                    if (doc._id === id) {
                        return response.data;
                    }
                    return doc;
                }));
            })
            .catch((error) => {
                console.log(error);
            });
    }
    
    return (
        <div className="availability-container">
            <div className="availability-header">
                <h1>Doctor Availability</h1>
            </div>
            
            <div className="availability-grid">
                {doctors.map((doctor) => (
                    <div className="availability-card" key={doctor._id}>
                        <h3>{doctor.name}</h3>
                        <p><strong>Specialization:</strong> {doctor.specialization || 'General Practice'}</p>
                        <p><strong>Name:</strong> {doctor.doctor_name}</p>
                        <p><strong>Email:</strong> {doctor.doctor_email}</p>
                        <p><strong>Phone:</strong> {doctor.doctor_phone_no}</p>
                        <div className={`availability-status ${doctor.doctor_availability ? 'status-available' : 'status-unavailable'}`}>
                            {doctor.doctor_availability ? 'Available' : 'Not Available'}
                        </div>
                        <button onClick={() => updateAvailability(doctor._id)}>
                            {doctor.doctor_availability ? 'Set Unavailable' : 'Set Available'}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="back-button-container">
                <button className="button-secondary" onClick={() => navigate('/')}>Back to Dashboard</button>
            </div>
        </div>
    );
};

export default DoctorAvailabiltiy;