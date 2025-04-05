import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/ViewMedicines.css'

// Helper function to format the date into a readable format
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

function ViewMedicines() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const PORT = process.env.PORT || 5002;

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND}/api/admin/get_medicines`)
            .then((response) => {
                setMedicines(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleDeleteMedicine = async (medicineId) => {
        // Ask to make sure the user wants to delete the medicine
        const confirmDelete = window.confirm("Are you sure you want to delete this medicine?");
        if (!confirmDelete) return;
        // Make the delete request
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/delete_medicine`, {
                medicine_id: medicineId,
            });
            
            alert("Medicine deleted successfully");
            // Update the state to remove the deleted medicine
            setMedicines((prevMedicines) =>
                prevMedicines.filter((medicine) => medicine.medicine_id !== medicineId)
            );
        } catch (error) {
            console.log("Error deleting medicine");
            console.error(error);
            // Show the error message to the user
            alert("Error deleting medicine. Please try again " + error.message);
        }
    };

    const handleDeleteMedicineBatch = async (medicineId, expiryDate) => {
        // Ask to make sure the user wants to delete the medicine
        const medicine = medicines.find(med => med.medicine_id === medicineId);
        if (!medicine) return;
        
        const confirmDelete = window.confirm(`Are you sure you want to delete this medicine batch with expiry date ${expiryDate} with formulation ${medicine.medicine_formulation}?`);
        if (!confirmDelete) return;
        
        // Make the delete request
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/delete_medicine_batch`, {
                medicine_id: medicineId,
                expiry_date: expiryDate,
            });

            // Fetch updated medicine list after deletion
            alert("Medicine batch deleted successfully");
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/admin/get_medicines`);
            setMedicines(response.data);
        } catch (error) {
            console.log("Error deleting medicine batch");
            console.error(error);
            // Show the error message to the user
            alert("Error deleting medicine batch. Please try again " + error.message);
        }
    };

    return (
        <div id="medicine-container">
            <h1 id="medicine-title">View Medicines</h1>
            <div id="medicine-list">
                {medicines.map((medicine, index) => (
                    <div className="medicine-card" key={index}>
                        <div className="medicine-card-header">
                            <div className="medicine-icon">💊</div>
                            <h3 className="medicine-formulation">
                                Formulation: {medicine.medicine_formulation}
                            </h3>
                            <button 
                                className="delete-medicine-btn" 
                                onClick={() => handleDeleteMedicine(medicine.medicine_id)}
                            >
                                Delete Med
                            </button>
                        </div>
                        <div className="medicine-card-body">
                            <div className="medicine-info">
                                <p className="medicine-id">Medicine Id:{medicine.medicine_id}</p>
                                <p className="medicine-quantity">Total Quantity: {medicine.total_quantity}</p>
                                <div className="medicine-details">
                                    <h4 className="details-heading">Details:</h4>
                                    {medicine.medicine_details.map((detail, index) => {
                                        // Check if the medicine is expired
                                        const isExpired = new Date(detail.expiry_date) < new Date();
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className={`medicine-detail-card ${isExpired ? 'expired-medicine' : ''}`}
                                            >
                                                <p className="medicine-name">{detail.medicine_name}</p>
                                                <p className={`expiry-date ${isExpired ? 'expired-text' : ''}`}>
                                                    Expiry Date: {formatDate(detail.expiry_date)}
                                                    {isExpired && <span className="expired-label"> (EXPIRED)</span>}
                                                </p>
                                                <p className="detail-quantity">Quantity: {detail.quantity}</p>
                                                <button 
                                                    className="delete-batch-btn" 
                                                    onClick={() => handleDeleteMedicineBatch(medicine.medicine_id, detail.expiry_date)}
                                                >
                                                    Delete Batch
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViewMedicines;