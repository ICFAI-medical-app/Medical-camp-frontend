import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/UpdateMedicineStock.css";

function UpdateMedicineStock() {
  const navigate = useNavigate();
  const [medicineId, setMedicineId] = useState("");
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

  const handleFetchMedicine = async (e) => {
    e.preventDefault();
    if (!medicineId.trim()) {
      setError("Please enter a medicine ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`http://localhost:5002/api/admin/get_medicine/${medicineId}`);
      setMedicine(response.data);
      
      // Initialize updatedQuantities with current values
      const quantities = {};
      response.data.medicine_details.forEach((detail, index) => {
        quantities[index] = detail.quantity;
      });
      setUpdatedQuantities(quantities);
      
    } catch (error) {
      console.error("Error fetching medicine:", error);
      setError(
        error.response?.data?.message || 
        "Medicine not found or an error occurred while fetching data."
      );
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

      // Send update request
      await axios.put(
        `http://localhost:5002/api/admin/update_medicine_stock/${medicineId}`,
        updatedMedicine
      );

      setSuccess("Medicine stock updated successfully!");
      
      // Refresh medicine data
      const response = await axios.get(`http://localhost:5002/api/admin/get_medicine/${medicineId}`);
      setMedicine(response.data);
      
      // Reset updated quantities
      const quantities = {};
      response.data.medicine_details.forEach((detail, index) => {
        quantities[index] = detail.quantity;
      });
      setUpdatedQuantities(quantities);
      
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
      // Create updated medicine object with new entry added
      const updatedMedicine = { ...medicine };
      updatedMedicine.medicine_details = [
        ...medicine.medicine_details,
        newEntry
      ];
      
      // Recalculate total quantity
      updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
        (total, detail) => total + detail.quantity, 0
      );

      // Send update request
      await axios.put(
        `http://localhost:5002/api/admin/update_medicine_stock/${medicineId}`,
        updatedMedicine
      );

      setSuccess("New batch added successfully!");
      
      // Refresh medicine data
      const response = await axios.get(`http://localhost:5002/api/admin/get_medicine/${medicineId}`);
      setMedicine(response.data);
      
      // Reset updated quantities
      const quantities = {};
      response.data.medicine_details.forEach((detail, index) => {
        quantities[index] = detail.quantity;
      });
      setUpdatedQuantities(quantities);
      
      // Reset new entry form
      setNewEntry({
        medicine_name: "",
        expiry_date: "",
        quantity: ""
      });
      
      // Hide new entry form
      setShowNewEntryForm(false);
      
    } catch (error) {
      console.error("Error adding new batch:", error);
      setError(
        error.response?.data?.message || 
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

  return (
    <div className="update-medicine-container">
      <h2>Update Medicine Stock</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {!medicine ? (
        <form onSubmit={handleFetchMedicine} className="medicine-id-form">
          <div className="form-group">
            <label htmlFor="medicine_id">Medicine ID</label>
            <input
              type="text"
              id="medicine_id"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              placeholder="Enter medicine ID"
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch Medicine"}
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
                        onClick={() => {
                          const newQuantities = { ...updatedQuantities };
                          for (const key in newQuantities) {
                            if (key !== index.toString()) {
                              newQuantities[key] = medicine.medicine_details[key].quantity;
                            }
                          }
                          setUpdatedQuantities(newQuantities);
                          handleUpdateStock();
                        }}
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
              Back to Medicine ID
            </button>
            <button 
              className="inventory-btn"
              onClick={() => navigate("/inventory")}
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