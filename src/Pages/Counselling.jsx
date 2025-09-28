import React, { useState } from "react";
import { privateAxios } from "../api/axios";
import "../Styles/Counselling.css";

function Counselling() {
  const [bookNumber, setBookNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setBookNumber(e.target.value);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookNumber) {
      setError('Book number is required.');
      return;
    }

    setIsLoading(true);
    try {
      const counsellingData = {
        date: new Date().toISOString(),
        notes: "Counselling session attended." 
      };
      const response = await privateAxios.post('/api/patientHistory/counselling', { 
        book_no: bookNumber,
        counsellingData: counsellingData
      });
      setMessage(response.data.message);
      setBookNumber(''); // Clear the input after successful submission
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving counselling data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="counselling-container">
      <h1 className="counselling-title">Counselling Session</h1>
      {message && <div className="counselling-success-msg">{message}</div>}
      {error && <div className="counselling-error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="counselling-form">
        <div className="counselling-form-group">
          <label htmlFor="bookNumber">Book Number:</label>
          <input
            type="text"
            id="bookNumber"
            value={bookNumber}
            onChange={handleChange}
            placeholder="Enter book number"
            required
          />
        </div>
        <button type="submit" className="counselling-submit-btn" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Counselling Data"}
        </button>
      </form>
    </div>
  );
}

export default Counselling;
