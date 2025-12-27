import React, { useState, useEffect, useCallback } from 'react';
import { useAnalyticsSocket } from '../hooks/useSocket';
import '../Styles/RealTimeAnalytics.css';

const RealTimeAnalytics = () => {
  // Real-time analytics state
  const [realTimeData, setRealTimeData] = useState({
    totalPatients: 0,
    activeConsultations: 0,
    prescriptionsGenerated: 0,
    medicinesReceived: 0,
    vitalsRecorded: 0,
    patientsWaiting: 0,
    completedConsultations: 0
  });

  // WebSocket handler for real-time analytics updates
  const handleAnalyticsUpdate = useCallback((eventType, data) => {
    console.log('Analytics update received:', eventType, data);

    // Update real-time analytics based on event type
    setRealTimeData(prev => {
      switch (eventType) {
        case 'patient-registered':
          return { ...prev, totalPatients: prev.totalPatients + 1 };
        case 'vitals-recorded':
          return { ...prev, vitalsRecorded: prev.vitalsRecorded + 1 };
        case 'medicine-received':
          return { ...prev, medicinesReceived: prev.medicinesReceived + 1 };
        case 'prescription-generated':
          return { ...prev, prescriptionsGenerated: prev.prescriptionsGenerated + 1 };
        case 'consultation-started':
          return { ...prev, activeConsultations: prev.activeConsultations + 1 };
        case 'consultation-completed':
          return {
            ...prev,
            activeConsultations: Math.max(0, prev.activeConsultations - 1),
            completedConsultations: prev.completedConsultations + 1
          };
        case 'patient-queued':
          return { ...prev, patientsWaiting: prev.patientsWaiting + 1 };
        case 'patient-dequeued':
          return { ...prev, patientsWaiting: Math.max(0, prev.patientsWaiting - 1) };
        default:
          return prev;
      }
    });
  }, []);

  // Initialize WebSocket connection for analytics
  const { isConnected } = useAnalyticsSocket(handleAnalyticsUpdate);

  return (
    <div className="real-time-analytics-container">
      <h1>Real-time Analytics Dashboard</h1>
      <div className={`connection-status-banner ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Real-time analytics active' : '🔴 Connecting to real-time updates...'}
      </div>

      <div className="real-time-analytics-grid">
        <div className="real-time-card">
          <div className="real-time-item">
            <span className="label">Patients Registered</span>
            <span className="value">{realTimeData.totalPatients}</span>
          </div>
        </div>

        <div className="real-time-card">
          <div className="real-time-item">
            <span className="label">Vitals Recorded</span>
            <span className="value">{realTimeData.vitalsRecorded}</span>
          </div>
        </div>

        <div className="real-time-card">
          <div className="real-time-item">
            <span className="label">Active Consultations</span>
            <span className="value">{realTimeData.activeConsultations}</span>
          </div>
        </div>

        <div className="real-time-card">
          <div className="real-time-item">
            <span className="label">Completed Consultations</span>
            <span className="value">{realTimeData.completedConsultations}</span>
          </div>
        </div>

        <div className="real-time-card">
          <div className="real-time-item">
            <span className="label">Prescriptions Generated</span>
            <span className="value">{realTimeData.prescriptionsGenerated}</span>
          </div>
        </div>

        <div className="real-time-card">
          <div className="real-time-item">
            <span className="label">Medicines Received</span>
            <span className="value">{realTimeData.medicinesReceived}</span>
          </div>
        </div>

        <div className="real-time-card">
          <div className="real-time-item">
            <span className="label">Patients in Vitals/Consultation Queues</span>
            <span className="value">{realTimeData.patientsWaiting}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;