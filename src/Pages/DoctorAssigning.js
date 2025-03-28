import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/DoctorAssigning.css";

function DoctorAssigning() {
  const [formData, setFormData] = useState({ bookNumber: '', doc_name: '' });
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the list of doctors from the backend
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/doctor-assign/get_doctors`);
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Error fetching doctors');
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/doctor-assign`, {
        book_no: formData.bookNumber,
        doc_name: formData.doc_name,
      });
      setMessage(response.data.message || 'Doctor-patient mapping successful!');
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
          <input
            type="number"
            name="bookNumber"
            value={formData.bookNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="doctor-assigning-form-group">
          <label>Doctor Assigned</label>
          <div className="doctor-assigning-radio-group">
            {doctors.map((doctor) => (
              <label key={doctor._id}>
                <input
                  type="radio"
                  name="doc_name"
                  value={doctor.doctor_name}
                  checked={formData.doc_name === doctor.doctor_name}
                  onChange={handleChange}
                  required
                />
                {doctor.doctor_name} ({doctor.specialization})
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="doctor-assigning-submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default DoctorAssigning;