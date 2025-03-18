import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/ViewPatients.css'

function ViewPatients() {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    const PORT = process.env.PORT || 5002;

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/admin/get_patients`)
            .then((response) => {
                setPatients(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <div id="view-patients-container">
            <h1 id="page-title">View Patients</h1>
            <div id="patients-grid">
                {patients.map((patient, index) => (
                    <div className="patient-card" key={index}>
                        <div className="patient-card-header">
                            <div className="patient-icon">😷</div>
                            <div className="patient-info">
                                <h3 className="patient-name">{patient.patient_name}</h3>
                                <p className="patient-age">{patient.patient_age} years old</p>
                                <p className="patient-phone">📞 {patient.patient_phone_no}</p>
                                <p className="patient-sex">Gender: {patient.patient_sex}</p>
                                <p className="patient-book-no">Book No: {patient.book_no}</p>
                                <p className="patient-area">Location: {patient.patient_area}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViewPatients;
