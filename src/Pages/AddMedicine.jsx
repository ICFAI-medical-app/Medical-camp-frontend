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
  const PORT = process.env.PORT || 5002;

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
        `${process.env.REACT_APP_BACKEND}/api/admin/add_new_medicine`,
        formData
      );

      setSuccess("Medicine added successfully!");
      setFormData({
        medicine_formulation: "",
        medicine_name: "",
        expiry_date: "",
        quantity: ""
      });

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
    <div className="add-medicine-page">
      <h2>Add New Medicine</h2>
      
      {error && <div className="add-medicine-error">{error}</div>}
      {success && <div className="add-medicine-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="add-medicine-form">
        <div className="add-medicine-group">
          <label htmlFor="add-medicine-formulation">Medicine Formulation</label>
          <input
            type="text"
            id="add-medicine-formulation"
            name="medicine_formulation"
            value={formData.medicine_formulation}
            onChange={handleChange}
            placeholder="Enter medicine formulation (e.g., Tablet, Syrup)"
            required
          />
        </div>

        <div className="add-medicine-group">
          <label htmlFor="add-medicine-name">Medicine Name</label>
          <input
            type="text"
            id="add-medicine-name"
            name="medicine_name"
            value={formData.medicine_name}
            onChange={handleChange}
            placeholder="Enter medicine name"
            required
          />
        </div>

        <div className="add-medicine-group">
          <label htmlFor="add-expiry-date">Expiry Date</label>
          <input
            type="date"
            id="add-expiry-date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="add-medicine-group">
          <label htmlFor="add-quantity">Quantity</label>
          <input
            type="number"
            id="add-quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            min="1"
            required
          />
        </div>

        <div className="add-medicine-actions">
          <button 
            type="submit" 
            className="add-medicine-submit" 
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
