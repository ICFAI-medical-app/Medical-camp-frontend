import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/DoctorPrescription.css';
import { privateAxios } from '../api/axios';

function DoctorPrescription() {
  const navigate = useNavigate();
  const [bookNo, setBookNo] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicine_id: '', medicine_formulation: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0, isMedicine: true }
  ]);
  const [medicineDetails, setMedicineDetails] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchTime = useRef([])
   const handlePrescriptionChange = async (index, field, value) => {
    let updatedPrescriptions;
    if (field === 'medicine_id_formulation') {
      updatedPrescriptions = prescriptions.map((prescription, i) => {
        if (i === index) {
          return {
            ...prescription,
            medicine_id: /^\d+$/.test(value) ? value : '',
            medicine_formulation: /^\d+$/.test(value) ? '' : value,
          };
        }
        return prescription;
      });
      setPrescriptions(updatedPrescriptions);
  
      let detailsCopy = [...medicineDetails];
  
      // Clear previous search timer for this index
      if (searchTime.current[index]) {
        clearTimeout(searchTime.current[index]);
      }
  
      // Clear result if field is empty
      if (value.trim() === '') {
        detailsCopy[index] = null;
        setMedicineDetails(detailsCopy);
        return;
      }

      // Check for minimum length to prevent searching on every keystroke
      // if (!/^\d+$/.test(value) && value.trim().length < 3) {
      //   detailsCopy[index] = { error: 'Please enter at least 3 letters to search by formulation.' };
      //   setMedicineDetails(detailsCopy);
      //   return;
      // }
  
      // Set a new timer
      searchTime.current[index] = setTimeout(async () => {
        setIsLoading(true);
        let response = null;
        try {
          if (/^\d+$/.test(value)) {
            response = await privateAxios.get(`/api/inventory/${value}`);
            if (!response.data || Object.keys(response.data).length === 0) {
              response = await privateAxios.get(`/api/inventory/formulation/${(value)}`);
            }
          } else {
            response = await privateAxios.get(`/api/inventory/formulation/${(value)}`);
          }
          detailsCopy[index] = response.data
        } catch (err) {
          detailsCopy[index] = { error: 'Item not found' };
        } finally {
          setMedicineDetails(detailsCopy);
          setIsLoading(false);
        }
      }, 500); // 500ms delay
    } else {
      updatedPrescriptions = prescriptions.map((prescription, i) => {
        if (i === index) {
          const updated = { ...prescription, [field]: value };
          if (updated.isMedicine && field !== 'quantity') {
            const trueCount =
              (updated.morning ? 1 : 0) +
              (updated.afternoon ? 1 : 0) +
              (updated.night ? 1 : 0);
            updated.quantity = updated.days * trueCount;
          }
          return updated;
        }
        return prescription;
      });
      setPrescriptions(updatedPrescriptions);
    }
  };

  useEffect(() => {
    return () => {
      searchTime.current.forEach(timerId => clearTimeout(timerId));
    };
  }, []);

  const handlePrescriptionTypeChange = (index, isMedicine) => {
    const updatedPrescriptions = prescriptions.map((prescription, i) => {
      if (i === index) {
        if (isMedicine) {
          return {
            ...prescription,
            isMedicine: true,
            medicine_id: '',
            medicine_formulation: '',
            days: 0,
            morning: false,
            afternoon: false,
            night: false,
            quantity: 0
          };
        } else {
          return {
            ...prescription,
            isMedicine: false,
            medicine_id: '',
            medicine_formulation: '',
            quantity: 0,
            days: 0,
            morning: false,
            afternoon: false,
            night: false
          };
        }
      }
      return prescription;
    });
  
    const updatedMedicineDetails = [...medicineDetails];
    updatedMedicineDetails[index] = null;
  
    setPrescriptions(updatedPrescriptions);
    setMedicineDetails(updatedMedicineDetails);
  };
  
  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine_id: '', medicine_formulation: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0, isMedicine: true }
    ]);
    setMedicineDetails([...medicineDetails, null]);
  };
  
  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
    setMedicineDetails(medicineDetails.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const formattedPrescriptions = prescriptions.map(p => {
      if (p.isMedicine) {
        return {
          medicine_id: p.medicine_id.toString(),
          medicine_formulation: p.medicine_formulation,
          dosage_schedule: {
            days: Number(p.days),
            morning: p.morning,
            afternoon: p.afternoon,
            night: p.night,
          },
          quantity: p.quantity,
        };
      } else {
        return {
          medicine_id: p.medicine_id || "NON-MED",
          medicine_formulation: p.medicine_formulation,
          quantity: Number(p.quantity),
          is_medicine: false
        };
      }
    });
  
    const payload = {
      book_no: bookNo,
      prescriptions: formattedPrescriptions
    };
  
    try {
      const response = await privateAxios.post(
        `/api/patient-history/doctor-prescription`,
        payload
      );
      if (response.status >= 200 && response.status < 300) {
        setMessage('Prescription submitted successfully!');
        setBookNo('');
        setPrescriptions([
          { medicine_id: '', medicine_formulation: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0, isMedicine: true }
        ]);
        setMedicineDetails([]);
      } else {
        setMessage('Failed to submit prescription.');
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
            />
          </div>
          <h3 className="doctor-prescription-subheading">Medicines</h3>
          {prescriptions.map((prescription, index) => (
            <div key={index} className="doctor-prescription-row">
              <div className="prescription-type-toggle">
                <div className={`toggle-option ${prescription.isMedicine ? 'active' : ''}`}
                  onClick={() => handlePrescriptionTypeChange(index, true)}>
                  By Dosing Schedule
                </div>
                <div className={`toggle-option ${!prescription.isMedicine ? 'active' : ''}`}
                  onClick={() => handlePrescriptionTypeChange(index, false)}>
                  By Quantity
                </div>
              </div>

              <div className="doctor-prescription-form-group">
                <label>Medicine ID / Medicine Formulation </label>
                <input
                  type="text"
                  value={prescription.medicine_id || prescription.medicine_formulation}
                  onChange={(e) =>
                    handlePrescriptionChange(index, 'medicine_id_formulation', e.target.value)
                  }
                  required
                  placeholder="e.g. 101"
                />
              </div>
             {medicineDetails[index] && (
              <div className="doctor-prescription-medicine-info">
                {medicineDetails[index].error ? (
                  <p style={{ color: 'red' }}>{medicineDetails[index].error}</p>
                ) : Array.isArray(medicineDetails[index]) ? (
                  <ul>
                    {medicineDetails[index].map((item, i) => (
                      <li key={i}>
                        <strong>{item.medicine_formulation}</strong>
                        <ul>
                          {item.details.map((med, j) => (
                            <li key={j}>
                              {med.medicine_name} — Qty: {med.quantity} — Exp: {new Date(med.expiry_date).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <p>
                      <strong>
                        {prescription.isMedicine ? "Formulation" : "Item"}:
                      </strong>{" "}
                      {medicineDetails[index].medicine_formulation}
                    </p>
                    <ul>
                      {medicineDetails[index].details &&
                        medicineDetails[index].details.map((med, i) => (
                          <li key={i}>
                            {med.medicine_name} — Qty: {med.quantity} — Exp:{" "}
                            {new Date(med.expiry_date).toLocaleDateString()}
                          </li>
                        ))}
                    </ul>
                  </>
                )}
              </div>
            )}
              {prescription.isMedicine ? (
                <>
                  <div className="doctor-prescription-form-group">
                    <label>Days</label>
                    <input
                      type="number"
                      value={prescription.days === 0 ? '' : prescription.days}
                      onChange={(e) =>
                        handlePrescriptionChange(index, 'days', (e.target.value))
                      }
                      required
                      placeholder="e.g. 3"
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      Night
                    </label>
                  </div>

                  <div className="doctor-prescription-form-group">
                    <strong>Calculated Quantity:</strong> {prescription.quantity}
                  </div>
                </>
              ) : (
                <div className="doctor-prescription-form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={prescription.quantity === 0 ? '' : prescription.quantity}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'quantity', (e.target.value))
                    }
                    required
                    placeholder="Enter quantity"
                    min="1"
                    disabled={isLoading}
                  />
                </div>
              )}

              <button
                type="button"
                className="doctor-prescription-remove-btn"
                onClick={() => removePrescriptionRow(index)}
                disabled={isLoading}
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
              disabled={isLoading}
            >
              Add Item
            </button>
          </div>

          <div className="doctor-prescription-btn-container">
            <button
              type="submit"
              className="doctor-prescription-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Prescription'}
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
