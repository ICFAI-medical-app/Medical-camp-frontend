import React, { useState } from 'react';
import { privateAxios } from '../api/axios'

const TokenGenerator = () => {
  const [bookNumber, setBookNumber] = useState('');
  const [gender, setGender] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');

  const generateToken = async () => {
    if (!bookNumber || !gender) {
      setError('Please enter both booking ID and gender.');
      return;
    }

    try {
      const response = await privateAxios.post('/api/token', {
        bookNumber,
        gender,
      });

	    setTokenInfo({
  bookNumber,
  gender,
  tokenNumber: response.data.tokenNumber,
  alreadyExists: response.data.alreadyExists || false,
});
      setError('');
    } catch (err) {
      console.error('Token generation failed:', err);
      setError('Failed to generate token.');
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

      {tokenInfo && (
        <div style={styles.result}>
          <p><strong>Booking ID:</strong> {tokenInfo.bookNumber}</p>
          <p><strong>Gender:</strong> {tokenInfo.gender}</p>
          <p><strong>Token Number:</strong> {tokenInfo.tokenNumber}</p>
        </div>
      )}
	  {tokenInfo?.alreadyExists && (
  <p style={{ color: 'orange' }}>
    You have already been assigned a token for today.
  </p>
)}
    </div>
  );
};

const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '400px',
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
  result: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f1f1f1',
    borderRadius: '4px',
  },
};

export default TokenGenerator;

