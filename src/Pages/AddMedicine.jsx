import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/AddMedicine.css";

function AddMedicine() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    medicine_formulation: "",
    medicine_name: "",
    expiry_date: "",
    quantity: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? (value === "" ? "" : parseInt(value, 10)) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5002/api/admin/add_new_medicine",
        formData
      );

      setSuccess("Medicine added successfully!");
      setFormData({
        medicine_formulation: "",
        medicine_name: "",
        expiry_date: "",
        quantity: ""
      });

      // Navigate back to inventory after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error adding medicine:", error);
      setError(
        error.response?.data?.message || 
        "An error occurred while adding the medicine."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-medicine-container">
      <h2>Add New Medicine</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="medicine-form">
        <div className="form-group">
          <label htmlFor="medicine_formulation">Medicine Formulation</label>
          <input
            type="text"
            id="medicine_formulation"
            name="medicine_formulation"
            value={formData.medicine_formulation}
            onChange={handleChange}
            placeholder="Enter medicine formulation (e.g., Tablet, Syrup)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicine_name">Medicine Name</label>
          <input
            type="text"
            id="medicine_name"
            name="medicine_name"
            value={formData.medicine_name}
            onChange={handleChange}
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
            value={formData.expiry_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            min="1"
            required
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate("/inventory")}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Medicine"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddMedicine;