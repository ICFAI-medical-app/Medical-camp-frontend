import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/MedicineVerification.css';

function MedicineVerification() {
  const [bookNo, setBookNo] = useState('');
  const [medicinesGiven, setMedicinesGiven] = useState([]);
  const [error, setError] = useState('');
  
  const handleFetchVerification = async () => {
    setError('');
    setMedicinesGiven([]);

    if (!bookNo) {
      setError('Please enter a valid Book No.');
      return;
    }

    const PORT = process.env.PORT || 5002;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/patient-history/medicine-verification/${bookNo}`
      );
      setMedicinesGiven(response.data.medicines_given);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verification data.');
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2 className="verification-title">Medicine Verification</h2>
        
        <div className="form-group">
          <label>Book No</label>
          <input
            type="text"
            value={bookNo}
            onChange={(e) => setBookNo(e.target.value)}
            required
            placeholder="Enter Book No"
          />
        </div>

        <div className="btn-container">
          <button type="button" className="fetch-btn" onClick={handleFetchVerification}>
            Fetch Medicines Given
          </button>
        </div>

        {medicinesGiven.length > 0 && (
          <div className="medicines-list">
            <h3 className="subheading">Medicines Given</h3>
            {medicinesGiven.map((med, index) => (
              <div key={index} className="medicine-row">
                <div className="medicine-details">
                  <strong>Medicine ID:</strong> {med.medicine_id}
                </div>
                <div className="medicine-details">
                  <strong>Quantity:</strong> {med.quantity}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicineVerification;
