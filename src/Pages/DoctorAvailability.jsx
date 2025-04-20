import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import { privateAxios } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/DoctorAvailability.css';

function DoctorAvailability() {
    const [doctorList, setDoctorList] = useState([]);
    const navigate = useNavigate();
    const PORT = process.env.PORT || 5002;

    useEffect(() => {
        // axios.get(`${process.env.REACT_APP_BACKEND}/api/admin/get_doctors`)
        privateAxios.get('/api/admin/get_doctors')
            .then((response) => {
                setDoctorList(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);
    const handleDoctorClick = (id) => {
        navigate(`/doctor/${id}`); // Navigate to the doctor details page
    };

    const toggleDoctorAvailability = (id) => {
        const doctor = doctorList.find((doc) => doc._id === id);
        const updatedAvailability = !doctor.doctor_availability;
        // axios.put(`${process.env.REACT_APP_BACKEND}/api/admin/update_doctor_availability/${id}`, { doctor_availability: updatedAvailability })
        privateAxios.put(`/api/admin/update_doctor_availability/${id}`, { doctor_availability: updatedAvailability })
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
                    <table className="doctor-availability-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Specialization</th>
                                <th>Availability</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctorList.map((doctor) => (
                                <tr
                                    key={doctor._id}
                                    className="doctor-row"
                                    onClick={() => handleDoctorClick(doctor._id)}
                                >
                                    <td>{doctor.doctor_name}</td>
                                    <td>{doctor.specialization || 'General Practice'}</td>
                                    <td className={`doctor-availability-status ${doctor.doctor_availability ? 'available' : 'unavailable'}`}>
                                        {doctor.doctor_availability ? 'Available' : 'Not Available'}
                                    </td>
                                    <td>
                                        <button
                                            className="toggle-availability-btn"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent row click
                                                toggleDoctorAvailability(doctor._id);
                                            }}
                                        >
                                            {doctor.doctor_availability ? 'Mark Unavailable' : 'Mark Available'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-doctors-message">No doctors found.</p>
                )}
            </main>
        </div>
    );
};

export default DoctorAvailability;
