import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/DoctorAssigning.css';

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
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'yayy An error occurred');
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
              <input type="radio" name="doc_name" value="doctor1" checked={formData.doc_name === 'doctor1'} onChange={handleChange} required />
              Doctor 1
            </label>
            <label>
              <input type="radio" name="doc_name" value="doctor2" checked={formData.doc_name === 'doctor2'} onChange={handleChange} required />
              Doctor 2
            </label>
            <label>
              <input type="radio" name="doc_name" value="doctor3" checked={formData.doc_name === 'doctor3'} onChange={handleChange} required />
              Doctor 3
            </label>
            <label>
              <input type="radio" name="doc_name" value="doctor4" checked={formData.doc_name === 'doctor4'} onChange={handleChange} required />
              Doctor 4
            </label>
            <label>
              <input type="radio" name="doc_name" value="doctor5" checked={formData.doc_name === 'doctor5'} onChange={handleChange} required />
              Doctor 5
            </label>
          </div>
        </div>
        <button type="submit" className="doctor-assigning-submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default DoctorAssigning;
