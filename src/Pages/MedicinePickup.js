import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/MedicinePickup.css';

function MedicinePickup() {
  const navigate = useNavigate();
  const [bookNo, setBookNo] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const PORT = process.env.PORT || 5002;

  const handleFetchPrescription = async () => {
    setError('');
    setMessage('');
    setPrescribedMeds([]);
  
    if (!bookNo) {
      setError('Please enter a valid Book No.');
      return;
    }
  
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND}/api/patient-history/medicine-pickup/${bookNo}`
      );
      
      if (!response.data.medicines_prescribed || response.data.medicines_prescribed.length === 0) {
        setError('No medicines found for this patient.');
        return;
      }
  
      setPrescribedMeds(response.data.medicines_prescribed.map(med => ({
        ...med,
        isGiven: false
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prescription.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const givenMeds = prescribedMeds.filter((med) => med.isGiven);

    if (givenMeds.length === 0) {
      setError('No medicines were selected as given.');
      return;
    }

    const PORT = process.env.PORT || 5002;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/patient-history/medicine-pickup`,
        {
          book_no: bookNo,
          medicinesGiven: givenMeds,
        }
      );

      setMessage(response.data.message || 'Medicines given updated successfully!');
      setPrescribedMeds(prevMeds => prevMeds.filter(med => !med.isGiven));
      setBookNo('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medicines given.');
    }
  };

  const handleCheckboxChange = (index) => {
    setPrescribedMeds(prevMeds =>
      prevMeds.map((med, i) => (i === index ? { ...med, isGiven: !med.isGiven } : med))
    );
  };

  return (
    <div className="medicine-pickup-container">
      <div className="medicine-pickup-card">
        <h1 className="medicine-pickup-title">Medicine Pickup</h1>

        <div className="medicine-pickup-form-group">
          <label>Book No</label>
          <input
            type="text"
            value={bookNo}
            onChange={(e) => setBookNo(e.target.value)}
            required
            placeholder="Enter Book No"
          />
        </div>

        <div className="medicine-pickup-btn-container">
          <button
            type="button"
            className="medicine-pickup-fetch-btn"
            onClick={handleFetchPrescription}
          >
            Fetch Prescription
          </button>
        </div>

        {prescribedMeds.length > 0 && (
          <form onSubmit={handleSubmit} className="medicine-pickup-form">
            <h3 className="medicine-pickup-subheading">Prescribed Medicines</h3>

            {prescribedMeds.map((med, index) => (
              <div key={index} className="medicine-pickup-row">
                <div className="medicine-pickup-form-group medicine-pickup-checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={med.isGiven}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    Medicine ID: {med.medicine_id}
                  </label>
                </div>
                <div className="medicine-pickup-form-group">
                  <strong>Quantity:</strong> {med.quantity}
                </div>
              </div>
            ))}

            <div className="medicine-pickup-btn-container">
              <button type="submit" className="medicine-pickup-submit-btn">
                Confirm Pickup
              </button>
            </div>
          </form>
        )}
      </div>

      {message && (
        <div className="medicine-pickup-popup-overlay">
          <div className="medicine-pickup-popup">
            <p>{message}</p>
            <button className="medicine-pickup-close-popup" onClick={() => setMessage('')}>
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="medicine-pickup-popup-overlay">
          <div className="medicine-pickup-popup">
            <p>{error}</p>
            <button className="medicine-pickup-close-popup" onClick={() => setError('')}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicinePickup;
