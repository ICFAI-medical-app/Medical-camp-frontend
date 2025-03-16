import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/UpdateMedicineStock.css";

function UpdateMedicineStock() {
  const navigate = useNavigate();
  const [medicineId, setMedicineId] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [newEntry, setNewEntry] = useState({
    medicine_name: "",
    expiry_date: "",
    quantity: ""
  });
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  // Fetch all medicines when component mounts
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5002/api/admin/get_medicines");
        setMedicines(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching medicines:", err);
        setError("Failed to load medicines list");
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleFetchMedicine = async (e) => {
    e.preventDefault();
    if (!medicineId.trim()) {
      setError("Please enter a medicine ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Find the medicine from our list
      const foundMedicine = medicines.find(med => med.medicine_id === medicineId);
      
      if (!foundMedicine) {
        throw new Error("Medicine not found with the given ID");
      }
      
      setMedicine(foundMedicine);
      
      // Initialize updatedQuantities with current values
      const quantities = {};
      foundMedicine.medicine_details.forEach((detail, index) => {
        quantities[index] = detail.quantity;
      });
      setUpdatedQuantities(quantities);
      
    } catch (error) {
      console.error("Error fetching medicine:", error);
      setError(error.message || "Medicine not found or an error occurred while fetching data.");
      setMedicine(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index, value) => {
    setUpdatedQuantities({
      ...updatedQuantities,
      [index]: value === "" ? "" : parseInt(value, 10)
    });
  };

  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: name === "quantity" ? (value === "" ? "" : parseInt(value, 10)) : value
    });
  };

  const handleUpdateStock = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create updated medicine object
      const updatedMedicine = { ...medicine };
      
      // Update quantities in the medicine_details array
      updatedMedicine.medicine_details = medicine.medicine_details.map((detail, index) => ({
        ...detail,
        quantity: updatedQuantities[index]
      }));
      
      // Recalculate total quantity
      updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
        (total, detail) => total + detail.quantity, 0
      );

      // Send update request - based on your admin routes, you're using a POST request
      await axios.post(
        "http://localhost:5002/api/admin/update_medicine_stock",
        {
          medicine_id: medicineId,
          expiry_date: new Date(), // This might need to be adjusted based on your API
          quantity: updatedQuantities[0] // This might need adjustment too
        }
      );

      setSuccess("Medicine stock updated successfully!");
      
      // Update the local state and list
      setMedicine(updatedMedicine);
      setMedicines(prev => 
        prev.map(med => med.medicine_id === medicineId ? updatedMedicine : med)
      );
      
    } catch (error) {
      console.error("Error updating medicine stock:", error);
      setError(
        error.response?.data?.message || 
        "An error occurred while updating medicine stock."
      );
    } finally {
      setLoading(false);
    }
  };

//   const handleAddNewEntry = async () => {
//     // Validate new entry
//     if (!newEntry.medicine_name || !newEntry.expiry_date || !newEntry.quantity) {
//       setError("All fields are required for adding a new batch");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setSuccess("");

//     try {
//       // Create updated medicine object with new entry added
//       const updatedMedicine = { ...medicine };
//       updatedMedicine.medicine_details = [
//         ...medicine.medicine_details,
//         newEntry
//       ];
      
//       // Recalculate total quantity
//       updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
//         (total, detail) => total + detail.quantity, 0
//       );

//       // Send update request for adding a new entry
//       await axios.post(
//         "http://localhost:5002/api/admin/add_new_medicine_details",
//         {
//           medicine_id: medicineId,
//           medicine_name: newEntry.medicine_name,
//           expiry_date: newEntry.expiry_date,
//           quantity: newEntry.quantity
//         }
//       );

//       setSuccess("New batch added successfully!");
      
//       // Update local state
//       setMedicine(updatedMedicine);
//       setMedicines(prev => 
//         prev.map(med => med.medicine_id === medicineId ? updatedMedicine : med)
//       );
      
//       // Reset form
//       setNewEntry({
//         medicine_name: "",
//         expiry_date: "",
//         quantity: ""
//       });
      
//       setShowNewEntryForm(false);
      
//     } catch (error) {
//       console.error("Error adding new batch:", error);
//       setError(
//         error.response?.data?.message || 
//         "An error occurred while adding new batch."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
const handleAddNewEntry = async () => {
    // Validate new entry
    if (!newEntry.medicine_name || !newEntry.expiry_date || !newEntry.quantity) {
      setError("All fields are required for adding a new batch");
      return;
    }
  
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      // Format the expiry date to YYYY-MM-DD
      const formattedDate = new Date(newEntry.expiry_date).toISOString().split('T')[0];
      
      // Create the request payload
      const payload = {
        medicine_id: medicineId,
        medicine_name: newEntry.medicine_name,
        expiry_date: formattedDate,
        quantity: newEntry.quantity
      };
      
      console.log("Adding new batch with payload:", payload);
      
      // Send update request for adding a new entry
      const response = await axios.post(
        "http://localhost:5002/api/admin/add_new_medicine_details",
        payload
      );
  
      console.log("Response from adding new batch:", response.data);
      
      // Refresh medicine data from server to ensure we have the latest state
      const foundMedicine = medicines.find(med => med.medicine_id === medicineId);
      if (foundMedicine) {
        // Add the new entry to our local medicine state
        const updatedMedicine = { ...foundMedicine };
        updatedMedicine.medicine_details.push({
          medicine_name: newEntry.medicine_name,
          expiry_date: newEntry.expiry_date,
          quantity: newEntry.quantity
        });
        
        // Recalculate total quantity
        updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
          (total, detail) => total + detail.quantity, 0
        );
        
        // Update local state
        setMedicine(updatedMedicine);
        setMedicines(prev => 
          prev.map(med => med.medicine_id === medicineId ? updatedMedicine : med)
        );
        
        // Initialize updatedQuantities with new values
        const quantities = {};
        updatedMedicine.medicine_details.forEach((detail, index) => {
          quantities[index] = detail.quantity;
        });
        setUpdatedQuantities(quantities);
      }
  
      setSuccess("New batch added successfully!");
      
      // Reset form
      setNewEntry({
        medicine_name: "",
        expiry_date: "",
        quantity: ""
      });
      
      setShowNewEntryForm(false);
      
    } catch (error) {
      console.error("Error adding new batch:", error);
      setError(
        error.response?.data || 
        "An error occurred while adding new batch."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleUpdateBatch = async (index) => {
    const selectedDetail = medicine.medicine_details[index];
    
    try {
      setLoading(true);
      setError("");
      
      // Format date as string in YYYY-MM-DD format
      const formattedDate = new Date(selectedDetail.expiry_date).toISOString().split('T')[0];
      
      await axios.post(
        "http://localhost:5002/api/admin/update_medicine_stock",
        {
          medicine_id: medicineId,
          expiry_date: formattedDate,
          quantity: updatedQuantities[index]
        }
      );
      
      // Update local state for this specific change
      const updatedMedicine = {...medicine};
      updatedMedicine.medicine_details[index].quantity = updatedQuantities[index];
      updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
        (total, detail) => total + detail.quantity, 0
      );
      
      setMedicine(updatedMedicine);
      setMedicines(prev => 
        prev.map(med => med.medicine_id === medicineId ? updatedMedicine : med)
      );
      
      setSuccess("Batch updated successfully!");
    } catch (error) {
      console.error("Error updating batch:", error);
      setError(error.response?.data || "Failed to update batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-medicine-container">
      <h2>Update Medicine Stock</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {!medicine ? (
        <form onSubmit={handleFetchMedicine} className="medicine-id-form">
          <div className="form-group">
            <label htmlFor="medicine_id">Select Medicine</label>
            <select
              id="medicine_id"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              required
              className="medicine-select"
            >
              <option value="">-- Select a Medicine --</option>
              {medicines.map(med => (
                <option key={med.medicine_id} value={med.medicine_id}>
                  {med.medicine_id} - {med.medicine_formulation}
                </option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || !medicineId}
          >
            {loading ? "Loading..." : "Fetch Medicine"}
          </button>
        </form>
      ) : (
        <div className="medicine-details">
          <div className="medicine-info">
            <h3>{medicine.medicine_formulation}</h3>
            <p><strong>Medicine ID:</strong> {medicine.medicine_id}</p>
            <p><strong>Total Quantity:</strong> {medicine.total_quantity}</p>
          </div>
          
          <h4>Medicine Batches</h4>
          <div className="table-container">
            <table className="medicine-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicine.medicine_details.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.medicine_name}</td>
                    <td>{formatDate(detail.expiry_date)}</td>
                    <td>
                      <input
                        type="number"
                        value={updatedQuantities[index]}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        min="0"
                        className="quantity-input"
                      />
                    </td>
                    <td>
                      <button 
                        className="action-btn update-btn"
                        onClick={() => handleUpdateBatch(index)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {showNewEntryForm ? (
            <div className="new-entry-form">
              <h4>Add New Batch</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="medicine_name">Medicine Name</label>
                  <input
                    type="text"
                    id="medicine_name"
                    name="medicine_name"
                    value={newEntry.medicine_name}
                    onChange={handleNewEntryChange}
                    placeholder="Enter medicine name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expiry_date">Expiry Date</label>
                  <input
                    type="date"
                    id="expiry_date"
                    name="expiry_date"
                    value={newEntry.expiry_date}
                    onChange={handleNewEntryChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newEntry.quantity}
                    onChange={handleNewEntryChange}
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowNewEntryForm(false);
                    setNewEntry({
                      medicine_name: "",
                      expiry_date: "",
                      quantity: ""
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="submit-btn" 
                  onClick={handleAddNewEntry}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Batch"}
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="add-entry-btn"
              onClick={() => setShowNewEntryForm(true)}
            >
              Add New Batch
            </button>
          )}
          
          <div className="navigation-buttons">
            <button 
              className="back-btn"
              onClick={() => {
                setMedicine(null);
                setMedicineId("");
              }}
            >
              Back to Medicine Selection
            </button>
            <button 
              className="inventory-btn"
              onClick={() => navigate("/get-medicines")}
            >
              Return to Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateMedicineStock;