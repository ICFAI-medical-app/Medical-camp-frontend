import React, { useState } from "react";
import { privateAxios } from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../Styles/PatientRegistration.css";

function PatientRegistration() {
  const [formData, setFormData] = useState({
    bookNumber: '',
    name: '',
    phoneNumber: '',
    age: '',
    gender: '',
    area: '',
    oldNew: '',
    eid: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    bookNumber: '',
    name: '',
    phoneNumber: '',
    age: '',
    gender: '',
    area: '',
    oldNew: '',
    eid: ''
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isBookNumberSubmitted, setIsBookNumberSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Area state
  const [areas, setAreas] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  let debounceTimer;

  // ------------------ VALIDATION ------------------
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'bookNumber':
        if (!value) {
          errorMessage = 'Book number is required';
        } else if (isNaN(value) || parseInt(value) <= 0) {
          errorMessage = 'Book number must be a positive number';
        }
        break;
      case 'name':
        if (!value && isBookNumberSubmitted) {
          errorMessage = 'Name is required';
        }
        break;
      case 'phoneNumber':
        if (value && !/^\d{10}$/.test(value)) {
          errorMessage = 'Phone number must be exactly 10 digits';
        }
        break;
      case 'age':
        if (value && (isNaN(value) || parseInt(value) <= 0 || parseInt(value) > 150)) {
          errorMessage = 'Age must be a valid number between 1 and 150';
        }
        break;
      default:
        break;
    }
    
    return errorMessage;
  };

  // ------------------ AREA FETCH ------------------
  const fetchAreas = async (query) => {
    if (query.length < 3) {
      setAreas([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await privateAxios.get(`/api/patients/patient-areas?q=${query}`);
      setAreas(res.data);
      setShowSuggestions(res.data.length > 0);
    } catch (err) {
      console.error("Error fetching areas", err);
      setShowSuggestions(false);
    }
  };

  // ------------------ HANDLE CHANGE ------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    setFieldErrors({ ...fieldErrors, [name]: '' });

    // 🔹 Debounced area fetch
    if (name === "area") {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchAreas(value), 300);
    }
  };

  // ------------------ AREA SELECT ------------------
  const handleSuggestionClick = (area) => {
    setFormData({ ...formData, area });
    setShowSuggestions(false);
  };

  // ------------------ VALIDATE BOOK NO. FORM ------------------
  const validateBookNumberForm = () => {
    const error = validateField('bookNumber', formData.bookNumber);
    setFieldErrors({ ...fieldErrors, bookNumber: error });
    return !error;
  };

  // ------------------ VALIDATE PATIENT FORM ------------------
  const validatePatientForm = () => {
    const newErrors = {};
    let isValid = true;
    
    const requiredFields = ['name'];
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    const optionalFields = ['phoneNumber', 'age', 'eid'];
    optionalFields.forEach(field => {
      if (formData[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });
    
    setFieldErrors({ ...fieldErrors, ...newErrors });
    return isValid;
  };

  // ------------------ BOOK NUMBER SUBMIT ------------------
  const handleBookNumberSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBookNumberForm()) {
      return;
    }
    
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await privateAxios.get(`/api/patients/${formData.bookNumber}`);
      if (response.data) {
        setFormData({
          bookNumber: response.data.book_no,
          name: response.data.patient_name || '',
          phoneNumber: response.data.patient_phone_no || '',
          age: response.data.patient_age || '',
          gender: response.data.patient_sex || '',
          area: response.data.patient_area || '',
          oldNew: response.data.oldNew || '',
          eid: response.data.eid || ''
        });

        // 🔹 Generate token if eid missing
        if (!response.data?.eid) {
          try {
            const tokenRes = await privateAxios.post('/api/token', {
              bookNumber: formData.bookNumber,
              gender: response.data?.patient_sex || 'unknown'
            });

            if (tokenRes.data?.tokenNumber) {
              setFormData(prev => ({
                ...prev,
                eid: tokenRes.data.tokenNumber
              }));
            }
          } catch (tokenError) {
            console.error('Error generating token:', tokenError);
          }
        }
        setMessage('Patient data loaded successfully!');
      } else {
        setMessage('No patient found. Please fill out the form.');
        setFormData({
          bookNumber: formData.bookNumber,
          name: '',
          phoneNumber: '',
          age: '',
          gender: '',
          area: '',
          oldNew: '',
          eid: ''
        });
      }
      setError('');
      setIsBookNumberSubmitted(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage('No patient found. Please fill out the form.');
        setFormData({
          bookNumber: formData.bookNumber,
          name: '',
          phoneNumber: '',
          age: '',
          gender: '',
          area: '',
          oldNew: '',
          eid: ''
        });
        setIsBookNumberSubmitted(true);
      } else {
        setError(error.response?.data?.message || 'An error occurred while fetching patient data.');
        setMessage('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ SAVE PATIENT ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePatientForm()) {
      setError('Please correct the errors before submitting');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await privateAxios.post('/api/patients', {
        book_no: formData.bookNumber,
        patient_name: formData.name,
        patient_age: formData.age,
        patient_sex: formData.gender,
        patient_phone_no: formData.phoneNumber,
        patient_area: formData.area,
        oldNew: formData.oldNew,
        eid: formData.eid
      });
      setMessage(response.data.message || 'Patient data saved successfully!');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while saving patient data.');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ RENDER ------------------
  return (
    <div className="patient-registration-container">
      <h1 className="patient-registration-title">Patient Registration</h1>
      {message && <div className="patient-registration-success-msg">{message}</div>}
      {error && <div className="patient-registration-error-msg">{error}</div>}

      {/* Book Number Step */}
      {!isBookNumberSubmitted ? (
        <form onSubmit={handleBookNumberSubmit} className="patient-registration-form">
          <div className="patient-registration-form-group">
            <label>
              Book Number <span className="required">*</span>
            </label>
            <input
              type="number"
              name="bookNumber"
              value={formData.bookNumber}
              onChange={handleChange}
              className={fieldErrors.bookNumber ? "error-input" : ""}
              placeholder="Enter patient book number"
            />
            {fieldErrors.bookNumber && <div className="field-error">{fieldErrors.bookNumber}</div>}
          </div>
          <button 
            type="submit" 
            className="patient-registration-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="patient-registration-form">

          {/* Book Number */}
          <div className="patient-registration-form-group">
            <label>Book Number</label>
            <input
              type="number"
              name="bookNumber"
              value={formData.bookNumber}
              disabled
            />
          </div>

          {/* Name */}
          <div className="patient-registration-form-group">
            <label>
              Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={fieldErrors.name ? "error-input" : ""}
              placeholder="Enter patient name"
            />
            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
          </div>

          {/* Phone Number */}
          <div className="patient-registration-form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength="10"
              placeholder="Enter 10-digit phone number (optional)"
              className={fieldErrors.phoneNumber ? "error-input" : ""}
            />
            {fieldErrors.phoneNumber && <div className="field-error">{fieldErrors.phoneNumber}</div>}
          </div>

          {/* Age */}
          <div className="patient-registration-form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter patient age (optional)"
              className={fieldErrors.age ? "error-input" : ""}
            />
            {fieldErrors.age && <div className="field-error">{fieldErrors.age}</div>}
          </div>

          {/* Gender */}
          <div className="patient-registration-form-group">
            <label>Gender</label>
            <div className="patient-registration-radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                Female
              </label>
            </div>
          </div>

          {/* Area with autocomplete */}
          <div className="patient-registration-form-group">
            <label>Area</label>
            <div className="area-input">
              <input
                type="text"
                name="area"
                placeholder="Area"
                value={formData.area}
                onChange={handleChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                autoComplete="off"
              />
              {showSuggestions && (
                <ul className="suggestions-dropdown">
                  {areas.length > 0 ? (
                    areas.map((area, i) => (
                      <li key={i} onClick={() => handleSuggestionClick(area)}>
                        {area}
                      </li>
                    ))
                  ) : (
                    <li className="no-results">No results found</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* EID */}
          <div className="patient-registration-form-group">
            <label>EID</label>
            <input
              type="number"
              name="eid"
              value={formData.eid}
              onChange={handleChange}
              placeholder="Enter patient EID (optional)"
              className={fieldErrors.eid ? "error-input" : ""}
            />
            {fieldErrors.eid && <div className="field-error">{fieldErrors.eid}</div>}
          </div>

          <button 
            type="submit" 
            className="patient-registration-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}

export default PatientRegistration;
