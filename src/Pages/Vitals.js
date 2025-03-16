import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Vitals.css';

function Vitals() {
  const [formData, setFormData] = useState({
    book_no: '',
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/api/vitals', {
        book_no: formData.bookNumber,
        rbs: formData.rbs || null,
        bp: formData.bp || null,
        height: formData.height || null,
        weight: formData.weight || null,
        pulse: formData.pulse || null,
        extra_note: formData.extra_note || null 
      });
      
      // Set success message
      setMessage(response.data.message || 'Patient registered successfully!');
      setError(''); 
      // Scroll to the success message if it's not visible
      window.scrollTo(0, 0);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      // setError(error.response?.data?.message || 'An error occurred');
      setMessage('');
    }
  };
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="vitals">
      <h1 style={{ textAlign: 'center' }}>Vitals</h1>
      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Book Number</label>
          <input type="number" name="bookNumber" value={formData.bookNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>BP (enter in systolic/diastolic format)</label>
          <input type="text" name="bp" value={formData.bp} onChange={handleChange}  />
        </div>
        <div className="form-group">
          <label>Pulse</label>
          <input type="number" name="pulse" value={formData.pulse} onChange={handleChange}  />
        </div>
        <div className="form-group">
          <label>RBS</label>
          <input type="number" name="rbs" value={formData.rbs} onChange={handleChange}  />
        </div>
        <div className="form-group">
          <label>Weight (in kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange}  />
        </div>
        <div className="form-group">
          <label>Height (in cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange}  />
        </div>
        <div className="form-group">
          <label>Last meal and time</label>
          <input type="text" name="extra_note" value={formData.extra_note} onChange={handleChange} />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={handleBack}>Back</button>
      </form>
    </div>
  );
}

export default Vitals;