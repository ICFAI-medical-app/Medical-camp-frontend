import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/DoctorPrescription.css';
import { privateAxios } from '../api/axios';

function DoctorPrescription() {
  const navigate = useNavigate();
  const [bookNo, setBookNo] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicine_id: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0 }
  ]);
  // Holds fetched medicine info per row
  const [medicineDetails, setMedicineDetails] = useState([]);
  const [message, setMessage] = useState('');

  const handlePrescriptionChange = async (index, field, value) => {
    const updatedPrescriptions = prescriptions.map((prescription, i) => {
      if (i === index) {
        const updated = { ...prescription, [field]: value };
        const trueCount =
          (updated.morning ? 1 : 0) +
          (updated.afternoon ? 1 : 0) +
          (updated.night ? 1 : 0);
        updated.quantity = updated.days * trueCount;
        return updated;
      }
      return prescription;
    });

    setPrescriptions(updatedPrescriptions);

    // Fetch medicine info when ID changes
    if (field === 'medicine_id' && value !== '') {
      try {
        const response = await privateAxios.get(`/api/inventory/${value}`);
        const detailsCopy = [...medicineDetails];
        detailsCopy[index] = response.data;
        setMedicineDetails(detailsCopy);
      } catch (err) {
        const detailsCopy = [...medicineDetails];
        detailsCopy[index] = { error: 'Medicine not found' };
        setMedicineDetails(detailsCopy);
      }
    }
  };

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine_id: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0 }
    ]);
    setMedicineDetails([...medicineDetails, null]);
  };

  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
    setMedicineDetails(medicineDetails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      book_no: bookNo,
      prescriptions: prescriptions.map((p) => ({
        medicine_id: p.medicine_id.toString(),
        dosage_schedule: {
          days: Number(p.days),
          morning: p.morning,
          afternoon: p.afternoon,
          night: p.night,
        },
        quantity: p.quantity,
      })),
    };

    try {
      const response = await privateAxios.post(
        `/api/patient-history/doctor-prescription`,
        payload
      );
      // Axios resolves non-2xx as exceptions, so response here indicates success
      if (response.status >= 200 && response.status < 300) {
        setMessage('Prescription submitted successfully!');
        setBookNo('');
        setPrescriptions([
          { medicine_id: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0 }
        ]);
        setMedicineDetails([]);
      } else {
        setMessage('Failed to submit prescription.');
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="doctor-prescription-container">
      <div className="doctor-prescription-card">
        <h1 className="doctor-prescription-title">Doctor Prescription</h1>
        <form onSubmit={handleSubmit} className="doctor-prescription-form">
          <div className="doctor-prescription-form-group">
            <label>Book No</label>
            <input
              type="text"
              value={bookNo}
              onChange={(e) => setBookNo(e.target.value)}
              required
              placeholder="Enter Book No"
            />
          </div>
          <h3 className="doctor-prescription-subheading">Medicines</h3>
          {prescriptions.map((prescription, index) => (
            <div key={index} className="doctor-prescription-row">
              <div className="doctor-prescription-form-group">
                <label>Medicine ID</label>
                <input
                  type="number"
                  value={prescription.medicine_id}
                  onChange={(e) =>
                    handlePrescriptionChange(index, 'medicine_id', e.target.value)
                  }
                  required
                  placeholder="e.g. 101"
                />
                {medicineDetails[index] && (
                  <div className="doctor-prescription-medicine-info">
                    {medicineDetails[index].error ? (
                      <p style={{ color: 'red' }}>{medicineDetails[index].error}</p>
                    ) : (
                      <>
                        <p><strong>Formulation:</strong> {medicineDetails[index].medicine_formulation}</p>
                        <ul>
                          {medicineDetails[index].details.map((med, i) => (
                            <li key={i}>
                              {med.medicine_name} — Qty: {med.quantity} — Exp: {new Date(med.expiry_date).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="doctor-prescription-form-group">
                <label>Days</label>
                <input
                  type="number"
                  value={prescription.days === 0 ? '' : prescription.days}
                  onChange={(e) =>
                    handlePrescriptionChange(index, 'days', Number(e.target.value))
                  }
                  required
                  placeholder="e.g. 3"
                />
              </div>

              <div className="doctor-prescription-form-group doctor-prescription-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={prescription.morning}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'morning', e.target.checked)
                    }
                  />
                  Morning
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={prescription.afternoon}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'afternoon', e.target.checked)
                    }
                  />
                  Afternoon
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={prescription.night}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'night', e.target.checked)
                    }
                  />
                  Night
                </label>
              </div>

              <div className="doctor-prescription-form-group">
                <strong>Calculated Quantity:</strong> {prescription.quantity}
              </div>

              <button
                type="button"
                className="doctor-prescription-remove-btn"
                onClick={() => removePrescriptionRow(index)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="doctor-prescription-btn-container">
            <button
              type="button"
              className="doctor-prescription-add-btn"
              onClick={addPrescriptionRow}
            >
              Add Medicine
            </button>
          </div>

          <div className="doctor-prescription-btn-container">
            <button type="submit" className="doctor-prescription-submit-btn">
              Submit Prescription
            </button>
          </div>
        </form>
      </div>
      {message && (
        <div className="doctor-prescription-popup-overlay">
          <div className="doctor-prescription-popup">
            <p>{message}</p>
            <button className="doctor-prescription-close-popup" onClick={() => setMessage('')}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPrescription;
