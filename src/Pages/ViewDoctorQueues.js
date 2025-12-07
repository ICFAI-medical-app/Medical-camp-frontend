
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { privateAxios } from '../api/axios';
import '../Styles/ViewDoctorQueues.css';



const ViewDoctorQueues = () => {
    const { type } = useParams();
    const navigate = useNavigate();

    // State for doctors list (for filter)
    const [doctors, setDoctors] = useState([]);

    // State for queue data
    const [allQueueData, setAllQueueData] = useState([]);
    const [filteredQueueData, setFilteredQueueData] = useState([]);

    // State for filter
    const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctorsAndQueue();
    }, [type]);

    const fetchDoctorsAndQueue = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Fetch all doctors for the dropdown
            const doctorsResponse = await privateAxios.get('/api/admin/get_doctors?month=All');
            setDoctors(doctorsResponse.data);

            // 2. Fetch the consolidated queue for the given type (sent without doctor_id)
            // The backend has been updated to return all queues if doctor_id is missing.
            const queueResponse = await privateAxios.post(`/api/patients/queue/${type}`, {});

            const queue = queueResponse.data.queue || [];
            setAllQueueData(queue);
            setFilteredQueueData(queue);

        } catch (err) {
            console.error("Error fetching data", err);
            setError("Failed to load queue data.");
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorFilterChange = (e) => {
        const doctorName = e.target.value;
        setSelectedDoctorFilter(doctorName);

        if (doctorName === '') {
            setFilteredQueueData(allQueueData);
        } else {
            const filtered = allQueueData.filter(item => item.doctor_name === doctorName);
            setFilteredQueueData(filtered);
        }
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

            {/* Header Area */}
            <div className="queue-header-row">
                <h1 className="page-title">
                    {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Doctor'} Queues
                </h1>

                {/* Doctor Filter Dropdown */}
                <div className="filter-wrapper">
                    <label htmlFor="doctorFilter">Filter by Doctor: </label>
                    <select
                        id="doctorFilter"
                        value={selectedDoctorFilter}
                        onChange={handleDoctorFilterChange}
                        className="doctor-filter-select"
                    >
                        <option value="">All Doctors</option>
                        {doctors.map(doc => (
                            <option key={doc._id} value={doc.doctor_name}>
                                {doc.doctor_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-spinner">Loading queue...</div>
            ) : (
                <div className="queue-detail-view">
                    <div className="selected-doctor-header">
                        <h2>
                            {selectedDoctorFilter ? `Queue for Dr. ${selectedDoctorFilter}` : 'All Queues'}
                        </h2>
                        <span className="queue-count-badge">
                            {filteredQueueData.length} Patients
                        </span>
                    </div>

                    {filteredQueueData.length > 0 ? (
                        <div className="queue-list-container">
                            <table className="queue-table">
                                <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th>Book No</th>
                                        <th>Patient Name</th>
                                        <th>Assigned At</th>
                                        <th>Doctor Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQueueData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.book_no}</td>
                                            <td>{item.patient_name}</td>
                                            <td>{formatTime(item.assigned_at)}</td>
                                            <td>{item.doctor_name}</td>
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
