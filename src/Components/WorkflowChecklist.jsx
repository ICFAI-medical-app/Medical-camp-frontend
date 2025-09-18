import React, { useState, useEffect } from 'react';
import { privateAxios } from '../api/axios';
import '../Styles/WorkflowChecklist.css'; // We'll create this CSS file next

const workflowStages = [
  "Token Generation",
  "Registration",
  "Patient Waiting",
  "Doctor Assignment",
  "Vitals",
  "Prescription",
  "Medicine Verification",
  "Patient Status",
  "Counselling"
];

function WorkflowChecklist({ bookNo }) {
  const [currentStage, setCurrentStage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookNo) {
      fetchPatientWorkflowStatus();
    }
  }, [bookNo]);

  const fetchPatientWorkflowStatus = async () => {
    setLoading(true);
    try {
      // This endpoint will need to be created in the backend
      const response = await privateAxios.get(`/api/patient-history/workflow-status/${bookNo}`);
      setCurrentStage(response.data.currentStage);
      setError('');
    } catch (err) {
      console.error('Error fetching workflow status:', err);
      setError(err.response?.data?.message || 'Failed to fetch workflow status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="workflow-checklist-loading">Loading workflow status...</div>;
  }

  if (error) {
    return <div className="workflow-checklist-error">{error}</div>;
  }

  return (
    <div className="workflow-checklist-container">
      <h3>Patient Workflow Status</h3>
      <ul className="workflow-stages">
        {workflowStages.map((stage, index) => (
          <li 
            key={index} 
            className={`workflow-stage-item ${currentStage === stage ? 'current' : ''} ${
              workflowStages.indexOf(currentStage) > index ? 'completed' : ''
            }`}
          >
            {workflowStages.indexOf(currentStage) > index && <span className="checkmark">✓</span>}
            {stage}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkflowChecklist;
