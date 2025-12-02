import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/DoctorPrescription.css';
import { privateAxios } from '../api/axios';
import { useQrScanner } from '../Context/QrScannerContext'; // Import useQrScanner hook

function DoctorPrescription() {
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation
  const { openScanner } = useQrScanner();
  const [bookNo, setBookNo] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicine_id: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0, isMedicine: true }
  ]);
  const [medicineDetails, setMedicineDetails] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const debounceTimeout = useRef(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // State to disable submit button
  const [quantityExceedsError, setQuantityExceedsError] = useState(''); // State to show quantity exceeds error
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);

  const filteredMedicines = medicines.filter((med) => {
    const id = med.medicine_id.toLowerCase();
    const search = searchText.toLowerCase();
    return id.startsWith(search);
  });
  
  const fetchMedicineInventory = async (medicineId) => {
    try {
      const res = await privateAxios.get(`/api/inventory/${medicineId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return null;
    }
  };

  // Function to validate quantities and update submit button state
  const validateQuantities = () => {
    let disable = false;
    let errorMsg = '';

    for (const [index, prescription] of prescriptions.entries()) {
      // Only validate if medicine details are available and no error in fetching them
      if (medicineDetails[index] && !medicineDetails[index].error) {
        const availableStock = medicineDetails[index].total_quantity;
        const calculatedQuantity = prescription.quantity;

        if (calculatedQuantity > availableStock) {
          disable = true;
          errorMsg = `Calculated quantity for Medicine ID- ${prescription.medicine_id} exceeds available stock (${availableStock}).`;
          break;
        }
      }
    }
    setIsSubmitDisabled(disable);
    setQuantityExceedsError(errorMsg);
  };

  // Call validateQuantities whenever prescriptions or medicineDetails change
  React.useEffect(() => {
    validateQuantities();
  }, [prescriptions, medicineDetails]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await privateAxios.get('/api/inventory/get-all-medicine');
        const medicineList = response.data;

        setMedicines(medicineList);

        // Refresh stock inside medicineDetails (for selected medicines)
        setMedicineDetails(prevDetails =>
          prevDetails.map((details, index) => {
            if (!details) return null;

            // Find updated medicine
            const updated = medicineList.find(
              m => m.medicine_id.toString() === prescriptions[index].medicine_id
            );

            if (!updated) return details;

            console.log("updated quantity: ", updated.total_quantity);

            return {
              ...details,
              total_quantity: updated.total_quantity,
              medicine_name: updated.medicine_details[0].medicine_name,
              medicine_formulation:
                `${updated.medicine_details[0].medicine_name} (${updated.medicine_formulation})`
            };
          })
        );
      } catch (error) {
        console.error('Failed to fetch medicines:', error);
      }
    };

    fetchMedicines();

    const interval = setInterval(fetchMedicines, 30000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    // Set bookNo from location.state if navigating from Dashboard
    if (location.state?.bookNumber) {
      setBookNo(location.state.bookNumber);
    }
  }, [location.state]);

  const handleQrScan = (scannedBookNumber) => {
    setBookNo(scannedBookNumber);
  };

  const handlePrescriptionChange = async (index, field, value) => {
    const updatedPrescriptions = prescriptions.map((prescription, i) => {
      if (i === index) {
        const updated = { ...prescription, [field]: value };

        // Only calculate quantity for medicine items (not non-medicine items)
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

    // Fetch medicine info when ID changes (for both medicine and non-medicine items)
    if (field === 'medicine_id') {
      if (value) {
        const selectedMedicine = medicines.find(m => m.medicine_id.toString() === value);
        if (selectedMedicine) {
          const detailsCopy = [...medicineDetails];
          detailsCopy[index] = {
            ...selectedMedicine,
            total_quantity: selectedMedicine.total_quantity,
            medicine_name: selectedMedicine.medicine_details[0].medicine_name,
            medicine_formulation: `${selectedMedicine.medicine_details[0].medicine_name} (${selectedMedicine.medicine_formulation})`
          };
          setMedicineDetails(detailsCopy);
        }
      } else {
        const detailsCopy = [...medicineDetails];
        detailsCopy[index] = null;
        setMedicineDetails(detailsCopy);
      }
    }
  };

  const handlePrescriptionTypeChange = (index, isMedicine) => {
    const updatedPrescriptions = prescriptions.map((prescription, i) => {
      if (i === index) {
        // Reset fields based on type
        if (isMedicine) {
          return {
            ...prescription,
            isMedicine: true,
            medicine_id: '',
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
            quantity: 0,
            // Don't need these for non-medicine items
            days: 0,
            morning: false,
            afternoon: false,
            night: false
          };
        }
      }
      return prescription;
    });

    // Clear medicine details for this row
    const updatedMedicineDetails = [...medicineDetails];
    updatedMedicineDetails[index] = null;

    setPrescriptions(updatedPrescriptions);
    setMedicineDetails(updatedMedicineDetails);
  };

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine_id: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0, isMedicine: true }
    ]);
    setMedicineDetails([...medicineDetails, null]);
  };

  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
    setMedicineDetails(medicineDetails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous messages immediately
    setIsLoading(true); // Set loading to true when submitting starts

    // Format the prescriptions for the backend
    const formattedPrescriptions = prescriptions.map(p => {
      if (p.isMedicine) {
        return {
          medicine_id: p.medicine_id.toString(),
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
          medicine_id: p.medicine_id || "NON-MED", // Special identifier for non-medicines
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
        setTimeout(() => setMessage(''), 10000); // Clear success message after 10 seconds
        setBookNo('');
        setPrescriptions([
          { medicine_id: '', days: 0, morning: false, afternoon: false, night: false, quantity: 0, isMedicine: true }
        ]);
        setMedicineDetails([]);
      } else {
        setMessage('Failed to submit prescription.');
        setTimeout(() => setMessage(''), 10000); // Clear generic failure message after 10 seconds
      }
    } catch (error) {
      let errorMessage = 'Failed to submit prescription.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Error: Prescription not found for the given Book No.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = 'Error: ' + error.response.data.message;
        }
      } else {
        errorMessage = 'Error: ' + error.message;
      }

      if (error.response && error.response.status === 404) {
        setMessage(errorMessage); // Set 404 message directly, no timeout
      } else {
        setMessage(errorMessage);
        setTimeout(() => setMessage(''), 10000); // Clear generic failure message after 10 seconds
      }
    } finally {
      setIsLoading(false); // Set loading back to false after submission
    }
  };

  return (
    <div className="doctor-prescription-container">
      <div className="doctor-prescription-card">
        <h1 className="doctor-prescription-title">Doctor Prescription</h1>
        <form onSubmit={handleSubmit} className="doctor-prescription-form">
          <div className="doctor-prescription-form-group">
            <label>Book Number</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={bookNo}
                onChange={(e) => setBookNo(e.target.value)}
                required
                placeholder="Enter Book No"
                disabled={isLoading} // Disable input while loading
                style={{ flexGrow: 1 }}
              />
              <button
                type="button"
                onClick={() => openScanner(handleQrScan)}
                className="scan-btn"
                title="Scan QR Code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0z" fill="none"/><path d="M4 12V6H2v6c0 1.1.9 2 2 2h2v-2H4zm16 0V6h2v6c0 1.1-.9 2-2 2h-2v-2h2zM4 20v-6H2v6c0 1.1.9 2 2 2h2v-2H4zm16 0v-6h2v6c0 1.1-.9 2-2 2h-2v-2h2zM7 19h10V5H7v14zm2-2v-2h6v2H9zm0-4v-2h6v2H9zm0-4V7h6v2H9z"/></svg>
              </button>
            </div>
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
                <label>Medicine</label>
                <div className="dropdown-container">
                  <input
                    type="text"
                    placeholder="Search medicine by ID..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="search-input"
                  />

                  {isOpen && searchText.trim() !== "" && (
                    <div className="dropdown-list">
                      {filteredMedicines.length === 0 ? (
                        <div className="dropdown-item no-item">No medicines found</div>
                      ) : (
                        filteredMedicines.map((med) => (
                          <div
                            key={med.medicine_id}
                            className="dropdown-item"
                            onClick={async () => {
                              handlePrescriptionChange(index, "medicine_id", med.medicine_id);
                              setSearchText(med.medicine_id);
                              setIsOpen(false);

                              // 🚀 Fetch inventory now
                              const data = await fetchMedicineInventory(med.medicine_id);
                              setInventoryData(data);

                              console.log("Inventory loaded:", data);
                            }}
                          >
                            <strong>{med.medicine_id}</strong>
                            <span className="item-details">
                              {med.medicine_details[0].medicine_name} {med.medicine_formulation}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {medicineDetails[index] && (
                  <div className="doctor-prescription-medicine-info">
                    {medicineDetails[index].error ? (
                      <p style={{ color: 'red' }}>{medicineDetails[index].error}</p>
                    ) : (
                      <>
                        <p><strong>{prescription.isMedicine ? "Formulation" : "Item"}:</strong> {medicineDetails[index].medicine_formulation}</p>
                        <p><strong>Available Stock:</strong> {medicineDetails[index].total_quantity}</p> {/* Display total_quantity */}
                      </>
                    )}
                  </div>
                )}
              </div>

              {prescription.isMedicine ? (
                <>
                  <div className="doctor-prescription-form-group">
                    <label>Days</label>
                    <input
                      type="number"
                      value={prescription.days === 0 ? '' : prescription.days}
                      onChange={(e) =>
                        handlePrescriptionChange(index, 'days', Number(e.target.value))
                      }
                      onWheel={(e) => e.target.blur()} // Disable scroll sensitivity
                      required
                      placeholder="e.g. 3"
                      disabled={isLoading} // Disable input while loading
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
                        disabled={isLoading} // Disable checkbox while loading
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
                        disabled={isLoading} // Disable checkbox while loading
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
                        disabled={isLoading} // Disable checkbox while loading
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
                      handlePrescriptionChange(index, 'quantity', Number(e.target.value))
                    }
                    required
                    placeholder="Enter quantity"
                    min="1"
                    disabled={isLoading} // Disable input while loading
                  />
                </div>
              )}

              <button
                type="button"
                className="doctor-prescription-remove-btn"
                onClick={() => removePrescriptionRow(index)}
                disabled={isLoading} // Disable button while loading
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
              disabled={isLoading} // Disable button while loading
            >
              Add Item
            </button>
          </div>

          <div className="doctor-prescription-btn-container">
            {quantityExceedsError && (
              <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                {quantityExceedsError}
              </p>
            )}
            <button
              type="submit"
              className="doctor-prescription-submit-btn"
              disabled={isLoading || isSubmitDisabled} // Disable button while loading or if validation fails
            >
              {isLoading ? 'Submitting...' : 'Submit Prescription'} {/* Show loading text */}
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
