import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { privateAxios } from '../api/axios';
import '../Styles/Vitals.css';

function Vitals() {
  const [formData, setFormData] = useState({
    bookNumber: '',
    bp: '',
    pulse: '',
    rbs: '',
    weight: '',
    height: '',
    extra_note: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bpError, setBpError] = useState(''); // Add state for BP validation error
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bp') {
      if (value) {
        const parts = value.split('/');
        if (
          parts.length !== 2 || // Ensure there are exactly two parts
          isNaN(Number(parts[0])) || // Ensure the first part is a number
          isNaN(Number(parts[1])) // Ensure the second part is a number
        ) {
          setBpError('BP must be in the format systolic/diastolic (e.g., 120/80)');
        } else {
          setBpError(''); // Clear BP error if valid
        }
      } else {
        setBpError(''); // Clear BP error if the field is empty
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const PORT = process.env.PORT || 5002;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when form submission starts
    try {
      // const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/vitals`, {
      const response = await privateAxios.post('/api/vitals', {
        book_no: formData.bookNumber,
        rbs: formData.rbs || null,
        bp: formData.bp || null,
        height: formData.height || null,
        weight: formData.weight || null,
        pulse: formData.pulse || null,
        extra_note: formData.extra_note || null 
      });
      setMessage(response.data.message || 'Vitals recorded successfully!');
      setError('');
      setFormData({
        bookNumber: '',
        bp: '',
        pulse: '',
        rbs: '',
        weight: '',
        height: '',
        extra_note: ''
      });
      window.scrollTo(0, 0);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      setMessage('');
    } finally {
      setIsLoading(false); // Set loading back to false after submission
    }
  };

  return (
    <div className="vitals-container">
      <h1 className="vitals-title">Vitals</h1>
      {message && <div className="vitals-success-msg">{message}</div>}
      {error && <div className="vitals-error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="vitals-form">
        <div className="vitals-form-group">
          <label>Book Number</label>
          <input type="number" name="bookNumber" value={formData.bookNumber} onChange={handleChange} required />
        </div>
        <div className="vitals-form-group">
          <label>BP (systolic/diastolic)</label>
          <input type="text" name="bp" value={formData.bp} onChange={handleChange} />
        </div>
        <div className="vitals-form-group">
          <label>Pulse</label>
          <input type="number" name="pulse" value={formData.pulse} onChange={handleChange} />
        </div>
        <div className="vitals-form-group">
          <label>RBS</label>
          <input type="number" name="rbs" value={formData.rbs} onChange={handleChange} />
        </div>
        <div className="vitals-form-group">
          <label>Weight (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
        </div>
        <div className="vitals-form-group">
          <label>Height (cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} />
        </div>
        <div className="vitals-form-group">
          <label>Last Meal and Time</label>
          <input type="text" name="extra_note" value={formData.extra_note} onChange={handleChange} />
        </div>
        <button 
          type="submit" 
          className="vitals-submit-btn" 
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? 'Submitting...' : 'Submit'} {/* Show loading text */}
        </button>      
      </form>
    </div>
  );
}

export default Vitals;
