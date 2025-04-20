import React, { useState, useEffect } from 'react';
import { privateAxios } from '../api/axios';
import '../Styles/ViewQueue.css';

export default function ViewQueue() {
  const [doctors, setDoctors] = useState([]);
  const [queues, setQueues] = useState({});
  const [error, setError] = useState('');
  const [status, setStatus] = useState({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await privateAxios.get('/api/doctor-assign/get_doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.response?.data?.message || 'Error loading doctors');
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length === 0) return;
    const fetchQueues = async () => {
      const map = {};
      await Promise.all(
        doctors.map(async (doc) => {
          try {
            const res = await privateAxios.get(`/api/queue/next/${doc.doctor_id}`);
            map[doc.doctor_id] = res.data.book_no;
          } catch (err) {
            if (err.response?.status === 404) map[doc.doctor_id] = null;
            else map[doc.doctor_id] = 'Error';
          }
        })
      );
      setQueues(map);
    };

    fetchQueues();
  }, [doctors]);

  const handleAssign = async (doctor) => {
    const bookNo = queues[doctor.doctor_id];
    if (!bookNo) return;
    try {
      // Assign doctor to patient
      await privateAxios.post('/api/doctor-assign', {
        book_no: bookNo,
        doc_name: doctor.doctor_name,
      });

      // Remove from queue
      await privateAxios.delete('/api/queue/remove', { data: { book_no: bookNo } });

      setStatus((s) => ({ ...s, [doctor.doctor_id]: 'Assigned' }));

      // Show popup and reload
      alert(`Doctor ${doctor.doctor_name} assigned to Book #${bookNo}`);
      window.location.reload();
    } catch (err) {
      console.error('Assign error:', err);
      setStatus((s) => ({
        ...s,
        [doctor.doctor_id]: err.response?.data?.message || 'Error',
      }));
    }
  };

  return (
    <div className="view-queues-container">
      <h1 className="view-queues-title">Doctor Queues</h1>
      {error && <div className="view-queues-error">{error}</div>}
      <ul className="view-queues-list">
        {doctors.map((doc) => {
          const bookNo = queues[doc.doctor_id];
          return (
            <li key={doc.doctor_id} className="view-queues-item">
              <strong>{doc.doctor_name}</strong>:&nbsp;
              {bookNo === undefined
                ? 'Loading...'
                : bookNo === null
                ? 'No queue'
                : `Book #${bookNo}`}
              {bookNo && (
                <button
                  className="view-queues-assign-btn"
                  onClick={() => handleAssign(doc)}
                  disabled={status[doc.doctor_id] === 'Assigned'}
                >
                  {status[doc.doctor_id] || 'Assign'}
                </button>
              )}
              {status[doc.doctor_id] && (
                <span className="view-queues-status">{status[doc.doctor_id]}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
