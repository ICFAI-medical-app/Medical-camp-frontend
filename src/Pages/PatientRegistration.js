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

  // Field validation function
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
      case 'oldNew':
        if (!value && isBookNumberSubmitted) {
          errorMessage = 'Please select Old or New';
        }
        break;
      default:
        break;
    }
    
    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field error when user starts typing
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateBookNumberForm = () => {
    const error = validateField('bookNumber', formData.bookNumber);
    setFieldErrors({ ...fieldErrors, bookNumber: error });
    return !error;
  };

  const validatePatientForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Only validate required fields
    const requiredFields = ['name', 'oldNew'];
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    // Validate optional fields only if they have a value
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

  const handleBookNumberSubmit = async (e) => {
    e.preventDefault();
    
    // Validate book number before submission
    if (!validateBookNumberForm()) {
      return;
    }
    
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await privateAxios.get(`/api/patients/${formData.bookNumber}`);
      if (response.data) {
        // Load patient data into the form
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
        setMessage('Patient data loaded successfully!');
      } else {
        // If no data is found, load a blank form
        setMessage('No patient found. Please fill out the form.');
        setFormData({
          bookNumber: formData.bookNumber, // Keep the entered book number
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
          bookNumber: formData.bookNumber, // Keep the entered book number
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
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
      if (response.data.redirect) {
        setTimeout(() => {
          window.location.reload(); // Reload the page to reset the form
        }, 2000); // Wait 2 seconds to display the success message
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while saving patient data.');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patient-registration-container">
      <h1 className="patient-registration-title">Patient Registration</h1>
      {message && <div className="patient-registration-success-msg">{message}</div>}
      {error && <div className="patient-registration-error-msg">{error}</div>}
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
          <div className="patient-registration-form-group">
            <label>Book Number</label>
            <input
              type="number"
              name="bookNumber"
              value={formData.bookNumber}
              onChange={handleChange}
              disabled
            />
          </div>
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
          <div className="patient-registration-form-group">
            <label>Area</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Enter patient area (optional)"
            />
          </div>
          <div className="patient-registration-form-group">
            <label>
              Old / New <span className="required">*</span>
            </label>
            <div className="patient-registration-radio-group">
              <label>
                <input
                  type="radio"
                  name="oldNew"
                  value="old"
                  checked={formData.oldNew === 'old'}
                  onChange={handleChange}
                />
                Old
              </label>
              <label>
                <input
                  type="radio"
                  name="oldNew"
                  value="new"
                  checked={formData.oldNew === 'new'}
                  onChange={handleChange}
                />
                New
              </label>
            </div>
            {fieldErrors.oldNew && <div className="field-error">{fieldErrors.oldNew}</div>}
          </div>
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