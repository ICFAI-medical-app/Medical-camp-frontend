import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const PORT = process.env.PORT || 5002;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/vitals`, {
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
        <button type="submit" className="vitals-submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default Vitals;
