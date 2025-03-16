// import React from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";

// function UpdateMedicineStock() {
//     const [medicines , setMedicines] = useState("");
//     const navigate = useNavigate();

//     // Ask him to enter the medicine id only.
//     // Based on that, show the details of the medicine
//     // Now show him the details of medicine, and give him the option to add the quantity in a index of the medicine_details array
//     // And also an option to create a new index in the medicine_details array
//     // Total Quantity should be updated automatically
//     // Show the medicine details in a card

//     useEffect(() => {
//         axios.get("http://localhost:5002/api/admin/get_medicines")
//         .then((response) => {
//             setMedicines(response.data);
//         })
//         .catch((error) => {
//             console.log(error);
//         })
//     }, [])

//     // First ask him to enter the medicine id only

//     return (
//         <div>

//         </div>
//     )

// }

// export default UpdateMedicineStock;



import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../Styles/Doctor.css"; // Reusing the doctor styling

function UpdateMedicineStock() {
    const [medicines, setMedicines] = useState([]);
    const [searchId, setSearchId] = useState("");
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [batchQuantity, setBatchQuantity] = useState("");
    const [batchExpiryDate, setBatchExpiryDate] = useState("");
    const [editBatchIndex, setEditBatchIndex] = useState(null);
    const [isAddingNewBatch, setIsAddingNewBatch] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:5002/api/admin/get_medicines")
            .then((response) => {
                setMedicines(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleSearch = () => {
        if (!searchId.trim()) return;
        
        const medicine = medicines.find(m => m._id === searchId || m.medicine_id === searchId);
        if (medicine) {
            setSelectedMedicine(medicine);
            setBatchQuantity("");
            setBatchExpiryDate("");
            setEditBatchIndex(null);
            setIsAddingNewBatch(false);
        } else {
            alert("Medicine not found. Please check the ID.");
        }
    };

    const handleUpdateBatch = (index) => {
        setIsAddingNewBatch(false);
        setEditBatchIndex(index);
        setBatchQuantity(selectedMedicine.medicine_details[index].quantity.toString());
        setBatchExpiryDate(selectedMedicine.medicine_details[index].expiry_date.split('T')[0]);
    };

    const handleAddNewBatch = () => {
        setIsAddingNewBatch(true);
        setEditBatchIndex(null);
        setBatchQuantity("");
        setBatchExpiryDate("");
    };

    const handleSaveBatch = () => {
        if (!batchQuantity || !batchExpiryDate) {
            alert("Please fill in all fields");
            return;
        }

        let updatedMedicine = { ...selectedMedicine };
        
        if (isAddingNewBatch) {
            // Add new batch
            updatedMedicine.medicine_details.push({
                quantity: parseInt(batchQuantity),
                expiry_date: batchExpiryDate
            });
        } else if (editBatchIndex !== null) {
            // Update existing batch
            updatedMedicine.medicine_details[editBatchIndex] = {
                ...updatedMedicine.medicine_details[editBatchIndex],
                quantity: parseInt(batchQuantity),
                expiry_date: batchExpiryDate
            };
        }

        // Calculate total quantity
        updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
            (total, batch) => total + batch.quantity, 0
        );

        // Send update to server
        axios.put(`http://localhost:5002/api/admin/update_medicine/${updatedMedicine._id}`, updatedMedicine)
            .then((response) => {
                // Update local state
                setSelectedMedicine(response.data);
                setMedicines(medicines.map(m => 
                    m._id === response.data._id ? response.data : m
                ));
                
                // Reset form
                setBatchQuantity("");
                setBatchExpiryDate("");
                setEditBatchIndex(null);
                setIsAddingNewBatch(false);
            })
            .catch((error) => {
                console.log(error);
                alert("Failed to update medicine stock.");
            });
    };

    return (
        <div className="doctor-container">
            <header className="doctor-header">
                <h1>Update Medicine Stock</h1>
                <button className="button-secondary" onClick={() => navigate('/')}>
                    Back to Dashboard
                </button>
            </header>
            
            <div className="doctor-content-wrapper">
                <main className="doctor-content">
                    <div className="doctor-card">
                        <h2>Find Medicine by ID</h2>
                        <div className="doctor-form">
                            <div className="form-group">
                                <label htmlFor="medicineId">Medicine ID</label>
                                <input
                                    id="medicineId"
                                    type="text"
                                    placeholder="Enter medicine ID"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                />
                            </div>
                            <button onClick={handleSearch}>Search</button>
                        </div>
                    </div>

                    {selectedMedicine && (
                        <div className="doctor-card">
                            <h2>Medicine Details</h2>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <p><strong>Name:</strong> {selectedMedicine.name}</p>
                                <p><strong>ID:</strong> {selectedMedicine.medicine_id}</p>
                                <p><strong>Type:</strong> {selectedMedicine.type}</p>
                                <p><strong>Manufacturer:</strong> {selectedMedicine.manufacturer}</p>
                                <p><strong>Total Quantity:</strong> {selectedMedicine.total_quantity}</p>
                            </div>

                            <h3 style={{ marginBottom: "1rem" }}>Batch Details</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Batch</th>
                                        <th>Quantity</th>
                                        <th>Expiry Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedMedicine.medicine_details.map((batch, index) => (
                                        <tr key={index}>
                                            <td>Batch {index + 1}</td>
                                            <td>{batch.quantity}</td>
                                            <td>{new Date(batch.expiry_date).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    className="button-secondary" 
                                                    style={{ padding: "0.5rem 0.8rem", marginRight: "0.5rem" }}
                                                    onClick={() => handleUpdateBatch(index)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button 
                                style={{ marginTop: "1rem" }} 
                                onClick={handleAddNewBatch}
                            >
                                Add New Batch
                            </button>

                            {(isAddingNewBatch || editBatchIndex !== null) && (
                                <div className="doctor-card" style={{ marginTop: "1.5rem" }}>
                                    <h3>
                                        {isAddingNewBatch ? "Add New Batch" : `Update Batch ${editBatchIndex + 1}`}
                                    </h3>
                                    <div className="doctor-form">
                                        <div className="form-group">
                                            <label htmlFor="quantity">Quantity</label>
                                            <input
                                                id="quantity"
                                                type="number"
                                                min="1"
                                                placeholder="Enter quantity"
                                                value={batchQuantity}
                                                onChange={(e) => setBatchQuantity(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="expiryDate">Expiry Date</label>
                                            <input
                                                id="expiryDate"
                                                type="date"
                                                value={batchExpiryDate}
                                                onChange={(e) => setBatchExpiryDate(e.target.value)}
                                            />
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <button onClick={handleSaveBatch}>
                                                {isAddingNewBatch ? "Add Batch" : "Update Batch"}
                                            </button>
                                            <button 
                                                className="button-secondary"
                                                onClick={() => {
                                                    setIsAddingNewBatch(false);
                                                    setEditBatchIndex(null);
                                                    setBatchQuantity("");
                                                    setBatchExpiryDate("");
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default UpdateMedicineStock;