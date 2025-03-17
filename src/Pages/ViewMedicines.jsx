import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/ViewMedicines.css'

function ViewPatients() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:5002/api/admin/get_medicines")
            .then((response) => {
                setMedicines(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <div id="medicine-container">
            <h1 id="medicine-title">View Medicines</h1>
            <div id="medicine-list">
                {medicines.map((medicine, index) => (
                    <div className="medicine-card" key={index}>
                        <div className="medicine-card-body">
                            <div className="medicine-icon">💊</div>
                            <div className="medicine-info">
                                <h3 className="medicine-formulation">
                                    Formulation: {medicine.medicine_formulation}
                                </h3>
                                <p className="medicine-id">{medicine.medicine_id}</p>
                                <p className="medicine-quantity">Quantity: {medicine.total_quantity}</p>
                                <div className="medicine-details">
                                    <h4 className="details-heading">Details:</h4>
                                    {medicine.medicine_details.map((detail, index) => (
                                        <div key={index} className="medicine-detail-card">
                                            <p className="medicine-name">{detail.medicine_name}</p>
                                            <p className="expiry-date">Expiry Date: {detail.expiry_date}</p>
                                            <p className="detail-quantity">Quantity: {detail.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViewPatients;
