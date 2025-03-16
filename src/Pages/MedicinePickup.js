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

  // Fetch prescription from the database
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
        `http://localhost:5002/api/patient-history/medicine-pickup/${bookNo}`
      );
      
      if (!response.data.medicines_prescribed || response.data.medicines_prescribed.length === 0) {
        setError('No medicines found for this patient.');
        return;
      }
  
      // Ensure that fetched medicines are the latest
      setPrescribedMeds(response.data.medicines_prescribed.map(med => ({
        ...med,
        isGiven: false
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prescription.');
    }
  };
  // Submit the medicines that were picked up
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const givenMeds = prescribedMeds.filter((med) => med.isGiven);

    if (givenMeds.length === 0) {
      setError('No medicines were selected as given.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5002/api/patient-history/medicine-pickup',
        {
          book_no: bookNo,
          medicinesGiven: givenMeds,
        }
      );

      setMessage(response.data.message || 'Medicines given updated successfully!');
      // **Remove picked up medicines from the list**
      setPrescribedMeds(prevMeds => prevMeds.filter(med => !med.isGiven));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medicines given.');
    }
  };

  // Toggle checkboxes
  const handleCheckboxChange = (index) => {
    setPrescribedMeds(prevMeds =>
      prevMeds.map((med, i) => (i === index ? { ...med, isGiven: !med.isGiven } : med))
    );
  };

  return (
    <div className="prescription-container">
      <div className="prescription-card">
        <h2 className="prescription-title">Medicine Pickup</h2>

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
          <button
            type="button"
            className="fetch-btn"
            onClick={handleFetchPrescription}
          >
            Fetch Prescription
          </button>
        </div>

        {prescribedMeds.length > 0 && (
          <form onSubmit={handleSubmit}>
            <h3 className="subheading">Prescribed Medicines</h3>

            {prescribedMeds.map((med, index) => (
              <div key={index} className="prescription-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={med.isGiven}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    Medicine ID: {med.medicine_id}
                  </label>
                </div>
                <div className="form-group">
                  <strong>Quantity:</strong> {med.quantity}
                </div>
              </div>
            ))}

            <div className="btn-container">
              <button type="submit" className="submit-btn">
                Confirm Pickup
              </button>
            </div>
          </form>
        )}
      </div>

      {message && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{message}</p>
            <button className="close-popup" onClick={() => setMessage('')}>
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{error}</p>
            <button className="close-popup" onClick={() => setError('')}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicinePickup;
