import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/DoctorAssigning.css';

function DoctorAssigning() {
  const [formData, setFormData] = useState({
    bookNumber: '',
    doc_name: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/api/doctor-assign', {
        book_no: formData.bookNumber,
        doc_name: formData.doc_name,
      });
      
      // Set success message
      setMessage(response.data.message || 'Doctor patient mapping successful!');
      setError(''); 
      // Scroll to the success message if it's not visible
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error:', error); // Log the error to the console

      setError(error.response?.data?.message || 'yayy An error occurred');
      setMessage('');
    }
  };

  return (
    <div className="doctor-assigning">
      <h1>Doctor Assigning</h1>
      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Book Number</label>
          <input type="number" name="bookNumber" value={formData.bookNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Doctor Assigned</label>
          <div className="radio-group">
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default DoctorAssigning;