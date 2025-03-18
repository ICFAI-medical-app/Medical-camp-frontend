import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/DoctorAvailability.css';

function DoctorAvailability() {
    const [doctorList, setDoctorList] = useState([]);
    const navigate = useNavigate();
    const PORT = process.env.PORT || 5002;

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND}/api/admin/get_doctors`)
            .then((response) => {
                setDoctorList(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const toggleDoctorAvailability = (id) => {
        const doctor = doctorList.find((doc) => doc._id === id);
        const updatedAvailability = !doctor.doctor_availability;
        axios.put(`${process.env.REACT_APP_BACKEND}/api/admin/update_doctor_availability/${id}`, { doctor_availability: updatedAvailability })
            .then((response) => {
                setDoctorList(doctorList.map((doc) =>
                    doc._id === id ? response.data : doc
                ));
            })
            .catch((error) => {
                console.log(error);
            });
    }
    
    return (
        <div className="doctor-availability-container">
            <header className="doctor-availability-header">
                <h1>Doctor Availability</h1>
            </header>
            
            <main className="doctor-availability-main">
                {doctorList.length > 0 ? (
                    <div className="doctor-availability-grid">
                        {doctorList.map((doctor) => (
                            <div className="doctor-availability-card" key={doctor._id}>
                                <h3 className="doctor-name">{doctor.doctor_name}</h3>
                                <p className="doctor-specialization"><strong>Specialization:</strong> {doctor.specialization || 'General Practice'}</p>
                                <p className="doctor-email"><strong>Email:</strong> {doctor.doctor_email}</p>
                                <p className="doctor-phone"><strong>Phone:</strong> {doctor.doctor_phone_no}</p>
                                <div className={`doctor-availability-status ${doctor.doctor_availability ? 'available' : 'unavailable'}`}>
                                    {doctor.doctor_availability ? 'Available' : 'Not Available'}
                                </div>
                                <button className="doctor-availability-button" onClick={() => toggleDoctorAvailability(doctor._id)}>
                                    {doctor.doctor_availability ? 'Mark Unavailable' : 'Mark Available'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-doctors-message">No doctors found.</p>
                )}
            </main>
        </div>
    );
};

export default DoctorAvailability;
