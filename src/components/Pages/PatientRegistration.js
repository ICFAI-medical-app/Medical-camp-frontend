import React, { useState } from 'react';
import '../Styles/PatientRegistration.css';

function PatientRegistration() {
  const [formData, setFormData] = useState({
    cardNumber: '',
    name: '',
    phoneNumber: '',
    age: '',
    gender: '',
    area: '',
    oldNew: '',
    eid: ''
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
    <div className="patient-registration">
      <h1>Patient Registration</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Card Number</label>
          <input type="number" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required maxLength="10" />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <div className="radio-group">
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
        <div className="form-group">
          <label>Area</label>
          <input type="text" name="area" value={formData.area} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Old / New</label>
          <div className="radio-group">
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
        <div className="form-group">
          <label>EID</label>
          <input type="number" name="eid" value={formData.eid} onChange={handleChange} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default PatientRegistration;