import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/Doctor.css';

function Doctor() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5002/api/admin/get_doctors')
            .then((response) => {
                if (response.data && response.data.length > 0) {
                    setDoctors(response.data);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const deleteDoctor = (id) => {
        axios.delete(`http://localhost:5002/api/admin/delete_doctor/${id}`)
            .then(() => {
                setDoctors(doctors.filter((doctor) => doctor._id !== id));
                alert('Doctor deleted successfully');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const DoctorCard = ({ doctor }) => (
        <div className="doctor-card-item">
            <h3 className="doctor-name">{doctor.doctor_name}</h3>
            <p className="doctor-detail"><strong>Email:</strong> {doctor.doctor_email}</p>
            <p className="doctor-detail"><strong>Phone:</strong> {doctor.doctor_phone_no}</p>
            <p className="doctor-detail"><strong>Age:</strong> {doctor.doctor_age}</p>
            <p className="doctor-detail"><strong>Sex:</strong> {doctor.doctor_sex}</p>
            <p className="doctor-detail"><strong>Specialization:</strong> {doctor.specialization}</p>
            <button className="delete-doctor-btn" onClick={() => deleteDoctor(doctor._id)}>Delete</button>
        </div>
    );

    const [doctorName, setDoctorName] = useState('');
    const [doctorEmail, setDoctorEmail] = useState('');
    const [doctorPhone, setDoctorPhone] = useState('');
    const [doctorAge, setDoctorAge] = useState('');
    const [doctorSpecialization, setDoctorSpecialization] = useState('');
    const [doctorSex, setDoctorSex] = useState('');

    const addDoctor = () => {
        axios.post('http://localhost:5002/api/admin/add_doctor', {
            doctor_name: doctorName,
            doctor_email: doctorEmail,
            doctor_phone_no: doctorPhone,
            doctor_age: doctorAge,
            specialization: doctorSpecialization,
            doctor_sex: doctorSex
        })
            .then((response) => {
                setDoctors([...doctors, response.data]);
                alert('Doctor added successfully');
            })
            .catch((error) => {
                console.log(error);
                alert('Error while adding a doctor');
            });

        setDoctorName('');
        setDoctorEmail('');
        setDoctorPhone('');
        setDoctorAge('');
        setDoctorSpecialization('');
        setDoctorSex('');
    };

    return (
        <div className="doctor-page">
            <header className="doctor-header">
                <h1>Doctor Management</h1>
            </header>

            <div className="doctor-content">
                <div className="doctor-stats">
                    <div className="stats-box">
                        <h3>Total Doctors</h3>
                        <p>{doctors.length}</p>
                    </div>
                </div>

                <div className="doctor-form-section">
                    <h2>Add a Doctor</h2>
                    <div className="doctor-form">
                        <div className="form-group">
                            <label htmlFor="doctorName">Name</label>
                            <input
                                id="doctorName"
                                type="text"
                                placeholder="Name"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorEmail">Email</label>
                            <input
                                id="doctorEmail"
                                type="email"
                                placeholder="Email"
                                value={doctorEmail}
                                onChange={(e) => setDoctorEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorPhone">Phone</label>
                            <input
                                id="doctorPhone"
                                type="text"
                                placeholder="Phone"
                                value={doctorPhone}
                                onChange={(e) => setDoctorPhone(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorAge">Age</label>
                            <input
                                id="doctorAge"
                                type="number"
                                placeholder="Age"
                                value={doctorAge}
                                onChange={(e) => setDoctorAge(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorSpecialization">Specialization</label>
                            <input
                                id="doctorSpecialization"
                                type="text"
                                placeholder="Specialization"
                                value={doctorSpecialization}
                                onChange={(e) => setDoctorSpecialization(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorSex">Sex</label>
                            <select
                                id="doctorSex"
                                value={doctorSex}
                                onChange={(e) => setDoctorSex(e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button className="add-doctor-btn" onClick={addDoctor}>Add Doctor</button>
                    </div>
                </div>

                <div className="doctor-list-section">
                    <h2>Doctors List</h2>
                    <div className="doctor-list">
                        {doctors.length > 0 ? (
                            doctors.map((doctor) => (
                                <DoctorCard doctor={doctor} key={doctor._id} />
                            ))
                        ) : (
                            <p>No doctors found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Doctor;
