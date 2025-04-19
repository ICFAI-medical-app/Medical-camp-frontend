import React, { useState } from "react";
// import axios from "axios";
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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isBookNumberSubmitted, setIsBookNumberSubmitted] = useState(false); // Track if book number is submitted
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBookNumberSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/patients/${formData.bookNumber}`);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/patients`, {
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
            <label>Book Number</label>
            <input
              type="number"
              name="bookNumber"
              value={formData.bookNumber}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="patient-registration-submit-btn">Submit</button>
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
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="patient-registration-form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength="10"
            />
          </div>
          <div className="patient-registration-form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
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
            />
          </div>
          <div className="patient-registration-form-group">
            <label>Old / New</label>
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
          </div>
          <div className="patient-registration-form-group">
            <label>EID</label>
            <input
              type="number"
              name="eid"
              value={formData.eid}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="patient-registration-submit-btn">Save</button>
        </form>
      )}
    </div>
  );
}

export default PatientRegistration;