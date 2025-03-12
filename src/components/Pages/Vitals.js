import React, { useState } from 'react';
import '../Styles/Vitals.css';

function Vitals() {
  const [formData, setFormData] = useState({
    cardNumber: '',
    bp: '',
    pulse: '',
    rbs: '',
    weight: '',
    height: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="vitals">
      <h1 style={{ textAlign: 'center' }}>Vitals</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Card Number</label>
          <input type="number" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>BP (enter in systolic/diastolic format)</label>
          <input type="text" name="bp" value={formData.bp} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Pulse</label>
          <input type="number" name="pulse" value={formData.pulse} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>RBS</label>
          <input type="number" name="rbs" value={formData.rbs} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Weight (in kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Height (in cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Vitals;