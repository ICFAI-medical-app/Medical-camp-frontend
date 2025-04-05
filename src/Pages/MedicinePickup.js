import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/MedicinePickup.css';
import MedicineVerification from './MedicineVerification';

function MedicinePickup() {
  const navigate = useNavigate();
  const [bookNo, setBookNo] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleFetchPrescription = async () => {
    setError('');
    setMessage('');
    setPrescribedMeds([]);
    setShowVerification(false);

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

      // Add quantity_taken field to each batch
      const medsWithInput = response.data.medicines_prescribed.map((med) => ({
        ...med,
        batches: med.batches.map((batch) => ({
          ...batch,
          quantity_taken: 0
        }))
      }));

      setPrescribedMeds(medsWithInput);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prescription.');
    }
  };

  const handleQuantityChange = (medIndex, batchIndex, value) => {
    setPrescribedMeds(prevMeds =>
      prevMeds.map((med, i) => {
        if (i === medIndex) {
          const updatedBatches = med.batches.map((batch, j) => {
            if (j === batchIndex) {
              return { ...batch, quantity_taken: value === '' ? '' : Math.max(0, parseInt(value)) };
            }
            return batch;
          });
          return { ...med, batches: updatedBatches };
        }
        return med;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Check if quantities match prescribed amounts
    const quantityMismatch = prescribedMeds.filter(med => {
      const totalGiven = med.batches.reduce((sum, batch) => 
        sum + (parseInt(batch.quantity_taken) || 0), 0);
      return totalGiven !== parseInt(med.quantity);
    });

    if (quantityMismatch.length > 0) {
      const mismatchItems = quantityMismatch.map(med => 
        `${med.medicine_id} (Prescribed: ${med.quantity}, Given: ${med.batches.reduce((sum, batch) => 
          sum + (parseInt(batch.quantity_taken) || 0), 0)})`
      ).join(', ');
      
      setError(`Quantity mismatch for medicine(s): ${mismatchItems}. Please ensure the total quantity given matches the prescribed amount.`);
      return;
    }

    const medicinesGiven = [];

    prescribedMeds.forEach((med) => {
      med.batches.forEach((batch) => {
        if (batch.quantity_taken > 0) {
          medicinesGiven.push({
            medicine_id: med.medicine_id,
            medicine_name: batch.medicine_name,
            expiry_date: batch.expiry_date,
            quantity: batch.quantity_taken
          });
        }
      });
    });

    if (medicinesGiven.length === 0) {
      setError('No medicines were selected as given.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}/api/patient-history/medicine-pickup`,
        {
          book_no: bookNo,
          medicinesGiven
        }
      );

      setMessage(response.data.message || 'Medicines given updated successfully!');
      setPrescribedMeds([]);
      // Set showVerification to true to display the verification component after successful submission
      setShowVerification(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medicines given.');
    }
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
        
        {/* Separate container for verify button to avoid overlap */}
        {bookNo && (
          <div className="medicine-pickup-btn-container">
            <button
              type="button"
              className="medicine-pickup-fetch-btn" 
              onClick={() => setShowVerification(true)}
            >
              Verify Medicines
            </button>
          </div>
        )}

        {prescribedMeds.length > 0 && (
          <form onSubmit={handleSubmit} className="medicine-pickup-form">
            <h3 className="medicine-pickup-subheading">Prescribed Medicines</h3>

            {prescribedMeds.map((med, medIndex) => {
              // Calculate total quantity given for this medicine
              const totalGiven = med.batches.reduce(
                (sum, batch) => sum + (parseInt(batch.quantity_taken) || 0), 
                0
              );
              
              return (
                <div key={medIndex} className="medicine-block">
                  <div className="medicine-header">
                    <div className="medicine-id">{med.medicine_id}</div>
                    <div className="medicine-details">
                      <p><strong>Formulation:</strong> {med.medicine_formulation}</p>
                      <p>
                        <strong>Prescribed Quantity:</strong> {med.quantity}
                        <span style={{ marginLeft: '10px', color: totalGiven === parseInt(med.quantity) ? 'green' : 'red' }}>
                          (Given: {totalGiven})
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="batches-row">
                    {/* Limit to maximum 3 batches per row */}
                    {med.batches.map((batch, batchIndex) => (
                      <div key={batchIndex} className="batch-card">
                        <p><strong>Name:</strong> {batch.medicine_name}</p>
                        <p><strong>Expiry:</strong> {new Date(batch.expiry_date).toLocaleDateString()}</p>
                        <p><strong>Available:</strong> {batch.available_quantity}</p>
                        <label>
                          <strong>Quantity to Give:</strong>
                          <input
                            type="number"
                            min="0"
                            max={batch.available_quantity}
                            value={batch.quantity_taken === 0 ? '' : batch.quantity_taken}
                            onChange={(e) =>
                              handleQuantityChange(medIndex, batchIndex, e.target.value)
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

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

      {/* Add the verification component */}
      <MedicineVerification 
        bookNo={bookNo}
        showVerification={showVerification}
        setShowVerification={setShowVerification}
      />
    </div>
  );
}

export default MedicinePickup;