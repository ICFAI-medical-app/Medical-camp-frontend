import React, { useState, useEffect } from "react";
import { privateAxios } from "../api/axios";
import { useNavigate } from "react-router-dom";
import '../Styles/ViewPatients.css';

function ViewPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        privateAxios
            .get("/api/admin/get_patients")
            .then((response) => {
                setPatients(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handlePatientClick = (patientId) => {
        navigate(`/patient/${patientId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div id="view-patients-container">
            <h1 id="page-title">View Patients</h1>
            <div id="patients-grid">
                {patients.map((patient) => (
                    <div 
                        key={patient._id} 
                        className="patient-card"
                        onClick={() => handlePatientClick(patient._id)}
                    >
                        <div className="patient-card-header">
                            <span className="patient-icon">👤</span>
                        </div>
                        <div className="patient-info">
                            <p className="patient-name">{patient.patient_name}</p>
                            <p className="patient-details">Book #: {patient.book_no}</p>
                            <p className="patient-details">Age: {patient.patient_age}</p>
                            <p className="patient-details">Sex: {patient.patient_sex}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViewPatients;
