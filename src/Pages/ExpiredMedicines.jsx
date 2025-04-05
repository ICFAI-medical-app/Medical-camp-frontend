// import React from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import '../Styles/ExpiredMedicines.css';
// import { useState, useEffect } from "react";

// function ExpiredMedicines() {
//     const navigate = useNavigate();
//     const [expiredMedicines, setExpiredMedicines] = useState([]);
//     const [loading, setLoading] = useState(true);
    
//     useEffect(() => {
//         fetchMedicines();
//     }, []);

//     const fetchMedicines = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/admin/get_medicines`);
//             const currentDate = new Date();
            
//             // Process the data to identify expired batches
//             const medicinesWithExpiredBatches = response.data.map(medicine => {
//                 // Find expired batches for this medicine
//                 const expiredBatches = medicine.medicine_details.filter(batch => {
//                     const expiryDate = new Date(batch.expiry_date);
//                     return expiryDate < currentDate;
//                 });
                
//                 // Return the medicine with only the expired batches
//                 return {
//                     ...medicine,
//                     expiredBatches: expiredBatches
//                 };
//             }).filter(medicine => medicine.expiredBatches.length > 0);
            
//             setExpiredMedicines(medicinesWithExpiredBatches);
//         } catch (error) {
//             console.error("Error fetching medicines:", error);
//             alert("Failed to fetch medicines. Please try again later.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDeleteMedicine = async (medicineId) => {
//         const confirmDelete = window.confirm("Are you sure you want to delete this medicine? This will delete ALL batches.");
//         if (!confirmDelete) return;
        
//         try {
//             await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/delete_medicine`, {
//                 medicine_id: medicineId,
//             });
            
//             alert("Medicine deleted successfully");
//             // Refresh the medicine list
//             fetchMedicines();
//         } catch (error) {
//             console.error("Error deleting medicine:", error);
//             alert(`Error deleting medicine: ${error.message || "Unknown error"}`);
//         }
//     };

//     const handleDeleteMedicineBatch = async (medicineId, expiryDate) => {
//         const medicine = expiredMedicines.find(med => med.medicine_id === medicineId);
//         if (!medicine) return;
        
//         const confirmDelete = window.confirm(`Are you sure you want to delete the batch with expiry date ${new Date(expiryDate).toLocaleDateString()}?`);
//         if (!confirmDelete) return;
        
//         try {
//             await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/delete_medicine_batch`, {
//                 medicine_id: medicineId,
//                 expiry_date: expiryDate,
//             });

//             alert("Medicine batch deleted successfully");
//             // Refresh medicine list
//             fetchMedicines();
//         } catch (error) {
//             console.error("Error deleting medicine batch:", error);
//             alert(`Error deleting medicine batch: ${error.message || "Unknown error"}`);
//         }
//     };

//     const handleBack = () => {
//         navigate("/get-medicines");
//     };

//     return (
//         <div className="expired-medicines-container">
//             <h1>Expired Medicines</h1>
//             <button onClick={handleBack} className="back-button">Back to Medicines</button>
            
//             {loading ? (
//                 <p>Loading medicines...</p>
//             ) : expiredMedicines.length === 0 ? (
//                 <p>No expired medicines found.</p>
//             ) : (
//                 <table className="expired-medicines-table">
//                     <thead>
//                         <tr>
//                             <th>Medicine ID</th>
//                             <th>Name</th>
//                             <th>Formulation</th>
//                             <th>Expired Batches</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {expiredMedicines.map((medicine) => (
//                             <tr key={medicine.medicine_id}>
//                                 <td>{medicine.medicine_id}</td>
//                                 <td>{medicine.medicine_name}</td>
//                                 <td>{medicine.medicine_formulation}</td>
//                                 <td>
//                                     <ul className="batch-list">
//                                         {medicine.expiredBatches.map((batch, index) => (
//                                             <li key={index}>
//                                                 Expiry: {new Date(batch.expiry_date).toLocaleDateString()} 
//                                                 - Quantity: {batch.quantity}
//                                                 <button 
//                                                     className="delete-batch-btn"
//                                                     onClick={() => handleDeleteMedicineBatch(medicine.medicine_id, batch.expiry_date)}
//                                                 >
//                                                     Delete Batch
//                                                 </button>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </td>
//                                 <td>
//                                     <button 
//                                         className="delete-medicine-btn"
//                                         onClick={() => handleDeleteMedicine(medicine.medicine_id)}
//                                     >
//                                         Delete All Batches
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// }

// export default ExpiredMedicines;


import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/ExpiredMedicines.css';
import { useState, useEffect } from "react";

function ExpiredMedicines() {
    const navigate = useNavigate();
    const [expiredMedicines, setExpiredMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/admin/get_medicines`);
            const currentDate = new Date();
            
            // Process the data to identify expired batches
            const medicinesWithExpiredBatches = response.data.map(medicine => {
                // Find expired batches for this medicine
                const expiredBatches = medicine.medicine_details.filter(batch => {
                    const expiryDate = new Date(batch.expiry_date);
                    return expiryDate < currentDate;
                });
                
                // Return the medicine with only the expired batches
                return {
                    ...medicine,
                    expiredBatches: expiredBatches
                };
            }).filter(medicine => medicine.expiredBatches.length > 0);
            
            setExpiredMedicines(medicinesWithExpiredBatches);
        } catch (error) {
            console.error("Error fetching medicines:", error);
            alert("Failed to fetch medicines. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMedicine = async (medicineId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this medicine? This will delete ALL batches.");
        if (!confirmDelete) return;
        
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/delete_medicine`, {
                medicine_id: medicineId,
            });
            
            alert("Medicine deleted successfully");
            // Refresh the medicine list
            fetchMedicines();
        } catch (error) {
            console.error("Error deleting medicine:", error);
            alert(`Error deleting medicine: ${error.message || "Unknown error"}`);
        }
    };

    const handleDeleteMedicineBatch = async (medicineId, expiryDate) => {
        const medicine = expiredMedicines.find(med => med.medicine_id === medicineId);
        if (!medicine) return;
        
        const confirmDelete = window.confirm(`Are you sure you want to delete the batch with expiry date ${new Date(expiryDate).toLocaleDateString()}?`);
        if (!confirmDelete) return;
        
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/delete_medicine_batch`, {
                medicine_id: medicineId,
                expiry_date: expiryDate,
            });

            alert("Medicine batch deleted successfully");
            // Refresh medicine list
            fetchMedicines();
        } catch (error) {
            console.error("Error deleting medicine batch:", error);
            alert(`Error deleting medicine batch: ${error.message || "Unknown error"}`);
        }
    };

    const handleBack = () => {
        navigate("/get-medicines");
    };

    return (
        <div className="expired-medicines-container">
            <div className="page-header">
                <h1>Expired Medicines</h1>
                <button onClick={handleBack} className="back-button">
                    <i className="fas fa-arrow-left"></i> Back to Medicines
                </button>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading medicines...</p>
                </div>
            ) : expiredMedicines.length === 0 ? (
                <div className="no-data-container">
                    <i className="fas fa-box-open fa-3x"></i>
                    <p>No expired medicines found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="expired-medicines-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Medicine Name</th>
                                <th>Formulation</th>
                                <th>Expired Batches</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiredMedicines.map((medicine) => (
                                <tr key={medicine.medicine_id}>
                                    <td className="medicine-id">{medicine.medicine_id}</td>
                                    <td className="medicine-name">{medicine.medicine_name}</td>
                                    <td className="medicine-formulation">{medicine.medicine_formulation}</td>
                                    <td className="expired-batches">
                                        {medicine.expiredBatches.map((batch, index) => (
                                            <div key={index} className="batch-item">
                                                <div className="batch-details">
                                                    <span className="batch-expiry">
                                                        <i className="fas fa-calendar-times"></i> 
                                                        {new Date(batch.expiry_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="batch-quantity">
                                                        <i className="fas fa-cubes"></i> 
                                                        {batch.quantity} units
                                                    </span>
                                                </div>
                                                <button 
                                                    className="delete-batch-btn"
                                                    onClick={() => handleDeleteMedicineBatch(medicine.medicine_id, batch.expiry_date)}
                                                >
                                                    <i className="fas fa-trash-alt"></i> Delete
                                                </button>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="delete-medicine-btn"
                                            onClick={() => handleDeleteMedicine(medicine.medicine_id)}
                                        >
                                            <i className="fas fa-trash"></i> Delete All
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ExpiredMedicines;