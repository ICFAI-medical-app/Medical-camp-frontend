import React , { useState , useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ViewPatients() {
    const [patients , setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:5002/api/admin/get_patients")
        .then((response) => {
            setPatients(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
    })

    // DO a mapping of patients here
    // Show the patient details in a card by card basis


    return (
        <div>
            <h1>View Patients</h1>
            <div className="card-grid">
                {patients.map((patient, index) => (
                    <div className="card-link" key={index}>
                        <div className="card">
                            <div className="card-icon">😷</div>
                            <div className="card-content">
                                <h3>{patient.patient_name}</h3>
                                <p>{patient.patient_age} years old</p>
                                <p>{patient.patient_phone_no}</p>
                                <p>{patient.patient_sex}</p>
                                <p>{patient.book_no}</p>
                                <p>{patient.patient_area}</p>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
                <div>
                    <button onClick={() => navigate("/")}>Back to Dashboard</button>
                </div>
        </div>
        
    )
}

export default ViewPatients;