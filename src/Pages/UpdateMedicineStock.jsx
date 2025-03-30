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
  const [updatedExpiryDates, setUpdatedExpiryDates] = useState({});
  const [newEntry, setNewEntry] = useState({
    medicine_name: "",
    expiry_date: "",
    quantity: ""
  });
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  const PORT = process.env.PORT || 5002;

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/admin/get_medicines`);
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
      const foundMedicine = medicines.find(med => med.medicine_id === medicineId);

      if (!foundMedicine) {
        throw new Error("Medicine not found with the given ID");
      }

      setMedicine(foundMedicine);

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

  const handleExpiryDateChange = (index, value) => {
    setUpdatedExpiryDates({
      ...updatedExpiryDates,
      [index]: value
    });
  };

  const handleUpdateExpiryDate = async (index) => {
    const selectedDetail = medicine.medicine_details[index];
    const newExpiryDate = updatedExpiryDates[index];

    if (!newExpiryDate) {
      setError("Please select a new expiry date");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const oldFormattedDate = new Date(selectedDetail.expiry_date).toISOString().split('T')[0];
      const newFormattedDate = new Date(newExpiryDate).toISOString().split('T')[0];

      await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/admin/update_medicine_expiry_date`,
        {
          medicine_id: medicineId,
          old_expiry_date: oldFormattedDate,
          new_expiry_date: newFormattedDate
        }
      );

      const updatedMedicine = { ...medicine };
      updatedMedicine.medicine_details[index].expiry_date = newExpiryDate;

      setMedicine(updatedMedicine);
      setMedicines(prev =>
        prev.map(med => med.medicine_id === medicineId ? updatedMedicine : med)
      );

      setSuccess("Expiry date updated successfully!");
    } catch (error) {
      console.error("Error updating expiry date:", error);
      setError(error.response?.data || "Failed to update expiry date");
    } finally {
      setLoading(false);
    }
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
      const updatedMedicine = { ...medicine };

      updatedMedicine.medicine_details = medicine.medicine_details.map((detail, index) => ({
        ...detail,
        quantity: updatedQuantities[index]
      }));

      updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
        (total, detail) => total + detail.quantity, 0
      );

      await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/admin/update_medicine_stock`,
        {
          medicine_id: medicineId,
          expiry_date: new Date(),
          quantity: updatedQuantities[0]
        }
      );

      setSuccess("Batch updated successfully!");

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

  const handleAddNewEntry = async () => {
    if (!newEntry.medicine_name || !newEntry.expiry_date || !newEntry.quantity) {
      setError("All fields are required for adding a new batch");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formattedDate = new Date(newEntry.expiry_date).toISOString().split('T')[0];

      const payload = {
        medicine_id: medicineId,
        medicine_name: newEntry.medicine_name,
        expiry_date: formattedDate,
        quantity: newEntry.quantity
      };

      console.log("Adding new batch with payload:", payload);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/admin/add_new_medicine_details`,
        payload
      );

      console.log("Response from adding new batch:", response.data);

      const foundMedicine = medicines.find(med => med.medicine_id === medicineId);
      if (foundMedicine) {
        const updatedMedicine = { ...foundMedicine };
        updatedMedicine.medicine_details.push({
          medicine_name: newEntry.medicine_name,
          expiry_date: newEntry.expiry_date,
          quantity: newEntry.quantity
        });

        updatedMedicine.total_quantity = updatedMedicine.medicine_details.reduce(
          (total, detail) => total + detail.quantity, 0
        );

        setMedicine(updatedMedicine);
        setMedicines(prev =>
          prev.map(med => med.medicine_id === medicineId ? updatedMedicine : med)
        );

        const quantities = {};
        updatedMedicine.medicine_details.forEach((detail, index) => {
          quantities[index] = detail.quantity;
        });
        setUpdatedQuantities(quantities);
      }

      setSuccess("New batch added successfully!");

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

      const formattedDate = new Date(selectedDetail.expiry_date).toISOString().split('T')[0];

      await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/admin/update_medicine_stock`,
        {
          medicine_id: medicineId,
          expiry_date: formattedDate,
          quantity: updatedQuantities[index]
        }
      );

      const updatedMedicine = { ...medicine };
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

      {(!medicine) ? (
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
                    {/* <td>{formatDate(detail.expiry_date)}</td> */}
                    <td>
                      <div className="expiry-date-container">
                        <span>{formatDate(detail.expiry_date)}</span>
                        <input
                          type="date"
                          value={updatedExpiryDates[index] || ''}
                          onChange={(e) => handleExpiryDateChange(index, e.target.value)}
                          className="expiry-date-input"
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <button
                          className="action-btn update-date-btn"
                          onClick={() => handleUpdateExpiryDate(index)}
                          disabled={!updatedExpiryDates[index]}
                        >
                          Update Date
                        </button>
                      </div>
                    </td>
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

      {success && (
        <div className="update-medicine-popup-overlay">
          <div className="update-medicine-popup">
            <p>{success}</p>
            <button className="update-medicine-close-popup" onClick={() => setSuccess("")}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateMedicineStock;
