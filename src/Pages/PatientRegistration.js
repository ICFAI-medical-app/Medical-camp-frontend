import React, { useState } from "react";
import axios from "axios";
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const PORT = process.env.PORT || 5002;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/patients`, {
        book_no: formData.bookNumber,
        patient_name: formData.name,
        patient_age: formData.age,
        patient_sex: formData.gender,
        patient_phone_no: formData.phoneNumber,
        patient_area: formData.area,
        oldNew: formData.oldNew,
        eid: formData.eid
      });
      setMessage(response.data.message || 'Patient registered successfully!');
      setError('');
      setFormData({
        bookNumber: '',
        name: '',
        phoneNumber: '',
        age: '',
        gender: '',
        area: '',
        oldNew: '',
        eid: ''
      });
      window.scrollTo(0, 0);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      setMessage('');
    }
  };

  return (
    <div className="patient-registration-container">
      <h1 className="patient-registration-title">Patient Registration</h1>
      {message && <div className="patient-registration-success-msg">{message}</div>}
      {error && <div className="patient-registration-error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="patient-registration-form">
        <div className="patient-registration-form-group">
          <label>Book Number</label>
          <input type="number" name="bookNumber" value={formData.bookNumber} onChange={handleChange} required />
        </div>
        <div className="patient-registration-form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="patient-registration-form-group">
          <label>Phone Number</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required maxLength="10" />
        </div>
        <div className="patient-registration-form-group">
          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div className="patient-registration-form-group">
          <label>Gender</label>
          <div className="patient-registration-radio-group">
            <label>
              <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} required />
              Male
            </label>
            <label>
              <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} required />
              Female
            </label>
          </div>
        </div>
        <div className="patient-registration-form-group">
          <label>Area</label>
          <input type="text" name="area" value={formData.area} onChange={handleChange} required />
        </div>
        <div className="patient-registration-form-group">
          <label>Old / New</label>
          <div className="patient-registration-radio-group">
            <label>
              <input type="radio" name="oldNew" value="old" checked={formData.oldNew === 'old'} onChange={handleChange} required />
              Old
            </label>
            <label>
              <input type="radio" name="oldNew" value="new" checked={formData.oldNew === 'new'} onChange={handleChange} required />
              New
            </label>
          </div>
        </div>
        <div className="patient-registration-form-group">
          <label>EID</label>
          <input type="number" name="eid" value={formData.eid} onChange={handleChange} required />
        </div>
        <button type="submit" className="patient-registration-submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default PatientRegistration;
