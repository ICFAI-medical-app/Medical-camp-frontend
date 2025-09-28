import React, { useState } from 'react';
import { privateAxios } from '../api/axios';
import PatientRegistration from './PatientRegistration'; // Import PatientRegistration

const TokenGenerator = () => {
  const [bookNumber, setBookNumber] = useState('');
  const [gender, setGender] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false); // New state

  const generateToken = async () => {
    if (!bookNumber || !gender) {
      setError('Please enter both booking ID and gender.');
      return;
    }

    try {
      // Reset states
      setError('');
      setPatientInfo(null);
      setTokenInfo(null);
      setShowRegistration(false);

      // 1. Fetch patient info
      const patientRes = await privateAxios.get(`/api/patients/${bookNumber}`);
      setPatientInfo(patientRes.data);

      // 2. Generate token
      const tokenRes = await privateAxios.post('/api/token', {
        bookNumber,
        gender,
      });

      setTokenInfo({
        bookNumber,
        gender,
        tokenNumber: tokenRes.data.tokenNumber,
        alreadyExists: tokenRes.data.alreadyExists || false,
      });
    } catch (err) {
      console.error('Error in generating token:', err);
      if (err.response && err.response.status === 404) {
        // If patient not found, show registration form
        setShowRegistration(true);
        setError('');
      } else {
        setError('Failed to fetch patient or generate token.');
        setShowRegistration(false);
      }
      setPatientInfo(null);
      setTokenInfo(null);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Token Generator</h2>

      <input
        type="text"
        placeholder="Booking ID"
        value={bookNumber}
        onChange={(e) => setBookNumber(e.target.value)}
        style={styles.input}
      />

      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        style={styles.input}
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <button onClick={generateToken} style={styles.button}>
        Generate Token
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {/* Show patient and token info */}
      {patientInfo && tokenInfo && (
        <div style={styles.resultContainer}>
          <div style={styles.box}>
            <h4>Patient Info</h4>
            <p><strong>Name:</strong> {patientInfo.patient_name}</p>
            <p><strong>Age:</strong> {patientInfo.patient_age}</p>
            <p><strong>Phone:</strong> {patientInfo.patient_phone_no}</p>
          </div>
          <div style={styles.box}>
            <h4>Token Info</h4>
            <p><strong>Booking ID:</strong> {tokenInfo.bookNumber}</p>
            <p><strong>Gender:</strong> {tokenInfo.gender}</p>
            <p><strong>Token Number:</strong> {tokenInfo.tokenNumber}</p>
            {tokenInfo.alreadyExists && (
              <p style={{ color: 'orange' }}>
                You have already been assigned a token for today.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Show registration form if patient not found */}
      {showRegistration && (
        <div style={{ marginTop: '2rem' }}>
          <PatientRegistration initialBookNumber={bookNumber} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '1rem',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    borderRadius: '4px',
  },
  error: {
    color: 'red',
    marginTop: '0.5rem',
  },
  resultContainer: {
    marginTop: '1.5rem',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  box: {
    flex: '1 1 250px',
    padding: '1rem',
    backgroundColor: '#f1f1f1',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
};

export default TokenGenerator;
