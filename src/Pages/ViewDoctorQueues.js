
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { privateAxios } from '../api/axios';
import '../Styles/ViewDoctorQueues.css';

const ViewDoctorQueues = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [queueData, setQueueData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await privateAxios.get('/api/admin/get_doctors?month=All');
            setDoctors(response.data);
            setFilteredDoctors(response.data);
        } catch (err) {
            console.error("Error fetching doctors", err);
            setError("Failed to load doctors.");
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = doctors.filter(doc =>
            doc.doctor_name.toLowerCase().includes(term) ||
            doc.specialization.toLowerCase().includes(term)
        );
        setFilteredDoctors(filtered);
    };

    const handleDoctorClick = async (doctor) => {
        setSelectedDoctor(doctor);
        setLoading(true);
        setError('');
        try {
            // Determine API endpoint based on route type
            // The backend enum is updated to 'consultation', matching the URL param.
            // If the URL param is 'consultation', we send 'consultation'.
            let apiType = type;


            const response = await privateAxios.post(`/api/patients/queue/${apiType}`, {
                doctor_id: doctor.doctor_id
            });
            setQueueData(response.data.queue || []);
        } catch (err) {
            console.error("Error fetching queue", err);
            setError("Failed to load queue data.");
            setQueueData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedDoctor(null);
        setQueueData([]);
        setError('');
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="view-doctor-queues-container">
            <button className="back-btn-main" onClick={() => navigate(-1)}>
                &larr; Back to Dashboard
            </button>

            <h1 className="page-title">
                {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Doctor'} Queues
            </h1>

            {error && <div className="error-message">{error}</div>}

            {!selectedDoctor ? (
                <div className="doctors-selection-view">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search doctors by name or specialization..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>

                    <div className="doctors-grid">
                        {filteredDoctors.map(doctor => (
                            <div
                                key={doctor._id}
                                className="doctor-card"
                                onClick={() => handleDoctorClick(doctor)}
                            >
                                <div className="doctor-avatar">
                                    {doctor.doctor_sex === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
                                </div>
                                <div className="doctor-info">
                                    <h3>{doctor.doctor_name}</h3>
                                    <p className="specialization">{doctor.specialization}</p>
                                    <span className={`status-badge ${doctor.doctor_availability ? 'available' : 'unavailable'}`}>
                                        {doctor.doctor_availability ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="queue-detail-view">
                    <button className="back-btn-internal" onClick={handleBack}>
                        &larr; Back to Doctor List
                    </button>

                    <div className="selected-doctor-header">
                        <h2>Queue for Dr. {selectedDoctor.doctor_name}</h2>
                        <span className="queue-count-badge">{queueData.length} Patients</span>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Loading queue...</div>
                    ) : queueData.length > 0 ? (
                        <div className="queue-list-container">
                            <table className="queue-table">
                                <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th>Book No</th>
                                        <th>Patient Name</th>
                                        <th>Assigned At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queueData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.book_no}</td>
                                            <td>{item.patient_name}</td>
                                            <td>{formatTime(item.assigned_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-queue-message">
                            <p>No patients currently in this queue.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewDoctorQueues;
