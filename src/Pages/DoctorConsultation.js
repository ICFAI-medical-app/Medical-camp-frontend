
import React, { useState, useEffect } from 'react';
import { privateAxios } from '../api/axios';
import '../Styles/DoctorConsultation.css';
import { useNavigate } from 'react-router-dom';
import { useQrScanner } from '../Context/QrScannerContext';
import { useSocket } from '../hooks/useSocket';

const DoctorConsultation = () => {
    const [bookNo, setBookNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { openScanner } = useQrScanner();

    // WebSocket connection
    const { socket, isConnected } = useSocket();

    const handleScan = (data) => {
        if (data) {
            setBookNo(data);
        }
    };

    const handleMarkAsConsulted = async () => {
        if (!bookNo) {
            setError('Please enter a Book Number');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await privateAxios.post(`/api/doctor-assign/done/${bookNo}`);
            setMessage(response.data.message || 'Successfully marked as consulted');
            setBookNo('');
        } catch (err) {
            console.error("Error marking consultation done", err);
            setError(err.response?.data?.message || 'Failed to mark as consulted');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="doctor-consultation-container">
            <div className="consultation-card">
                <h1>Doctor Consultation</h1>

                {/* WebSocket Connection Status */}
                <div style={{
                    padding: '8px 12px',
                    margin: '10px 0',
                    borderRadius: '4px',
                    backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
                    color: isConnected ? '#155724' : '#721c24',
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    {isConnected ? '🟢 Real-time updates active' : '🔴 Connecting...'}
                </div>

                <div className="input-group">
                    <label htmlFor="bookNo">Book Number</label>
                    <div className="input-wrapper">
                        <input
                            id="bookNo"
                            type="number"
                            placeholder="Enter Book Number"
                            value={bookNo}
                            onChange={(e) => setBookNo(e.target.value)}
                            className="book-no-input"
                            onKeyDown={(e) => e.key === 'Enter' && handleMarkAsConsulted()}
                        />
                        <button
                            className="scan-btn-small"
                            onClick={() => openScanner(handleScan)}
                            title="Scan QR Code"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24" /></g><g><g><path d="M3,11h8V3H3V11z M5,5h4v4H5V5z" /><path d="M3,21h8v-8H3V21z M5,15h4v4H5V15z" /><path d="M13,3v8h8V3H13z M19,9h-4V5h4V9z" /><rect height="2" width="2" x="13" y="13" /><rect height="2" width="2" x="17" y="17" /><rect height="2" width="2" x="19" y="19" /><rect height="2" width="2" x="13" y="19" /><rect height="2" width="2" x="19" y="13" /><rect height="2" width="2" x="15" y="15" /><rect height="2" width="2" x="17" y="13" /><rect height="2" width="2" x="15" y="19" /></g></g></svg>
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleMarkAsConsulted}
                    disabled={loading}
                    className="mark-consulted-btn"
                >
                    {loading ? 'Processing...' : 'Mark as Consulted'}
                </button>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};
export default DoctorConsultation;
