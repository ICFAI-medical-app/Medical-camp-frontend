import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/DoctorAssigning.css";

function DoctorAssigning() {
  const [formData, setFormData] = useState({ bookNumber: '', doc_name: '' });
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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/doctor-assign`, {
        book_no: formData.bookNumber,
        doc_name: formData.doc_name,
      });
      setMessage(response.data.message || 'Doctor patient mapping successful!');
      setError('');
      setFormData({ bookNumber: '', doc_name: '' });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'An error occurred');
      setMessage('');
    }
  };

  return (
    <div className="doctor-assigning-container">
      <h1 className="doctor-assigning-title">Doctor Assigning</h1>
      {message && <div className="doctor-assigning-success-msg">{message}</div>}
      {error && <div className="doctor-assigning-error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="doctor-assigning-form">
        <div className="doctor-assigning-form-group">
          <label>Book Number</label>
          <input type="number" name="bookNumber" value={formData.bookNumber} onChange={handleChange} required />
        </div>
        <div className="doctor-assigning-form-group">
          <label>Doctor Assigned</label>
          <div className="doctor-assigning-radio-group">
            <label>
              <input type="radio" name="doc_name" value="Dr Uma" checked={formData.doc_name === 'Dr Uma'} onChange={handleChange} required />
              Dr Uma
            </label>
            <label>
              <input type="radio" name="doc_name" value="Dr Keshava" checked={formData.doc_name === 'Dr Keshava'} onChange={handleChange} required />
              Dr Keshava
            </label>
            <label>
              <input type="radio" name="doc_name" value="Dr Raghav" checked={formData.doc_name === 'Dr Raghav'} onChange={handleChange} required />
              Dr Raghav
            </label>
            <label>
              <input type="radio" name="doc_name" value="Dr Ramesh" checked={formData.doc_name === 'Dr Ramesh'} onChange={handleChange} required />
              Dr Ramesh
            </label>
          </div>
        </div>
        <button type="submit" className="doctor-assigning-submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default DoctorAssigning;
