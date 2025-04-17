import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/DoctorProfile.css';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [editableDoctor, setEditableDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND || 'http://localhost:5002';

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/get_doctor/${id}`);
      setDoctor(response.data);
      setEditableDoctor(response.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      alert('Error fetching doctor information');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - revert to original data
      setEditableDoctor(doctor);
      setValidationErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableDoctor({
      ...editableDoctor,
      [name]: value
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!editableDoctor.name || editableDoctor.name.trim() === '') {
      errors.name = "Name is required";
    }
    
    if (!editableDoctor.specialization || editableDoctor.specialization.trim() === '') {
      errors.specialization = "Specialization is required";
    }
    
    // Add more validation as needed
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/update_doctor/${id}`, 
        editableDoctor
      );
      
      setDoctor(response.data);
      setIsEditing(false);
      alert('Doctor information updated successfully');
    } catch (error) {
      console.error('Error updating doctor:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        alert('Update failed: ' + error.response.data.message);
      } else {
        alert('Failed to update doctor information. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Add delete functionality here
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/admin/delete_doctor/${id}`);
        alert('Doctor deleted successfully');
        navigate('/get-doctors');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading doctor information...</p>
      </div>
    );
  }

  if (!doctor) {
    return <div className="error">Doctor not found</div>;
  }

  return (
    <div className="doctor-profile-container">
      <div className="doctor-profile-header">
        <h1>Doctor Profile</h1>
        {!isEditing ? (
          <div className="header-actions">
            <button className="edit-button" onClick={handleEditToggle}>
              Edit
            </button>
            <button className="delete-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        ) : (
          <div className="action-buttons">
            <button 
              className="save-button" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="cancel-button" onClick={handleEditToggle}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="doctor-profile-card">
        <div className="doctor-avatar-large">
          {doctor.doctor_name?.charAt(0).toUpperCase() || 'D'}
        </div>
        {isEditing ? (
          // Edit mode
          <div className="doctor-edit-form">
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input
                name="name"
                value={editableDoctor.doctor_name || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.name ? 'error-input' : ''}`}
              />
              {validationErrors.name && (
                <div className="error-message">{validationErrors.name}</div>
              )}
            </div>
            <div className="form-group">
              <label>Specialization <span className="required">*</span></label>
              <input
                name="specialization"
                value={editableDoctor.specialization || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.specialization ? 'error-input' : ''}`}
              />
              {validationErrors.specialization && (
                <div className="error-message">{validationErrors.specialization}</div>
              )}
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={editableDoctor.doctor_phone_no || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={editableDoctor.doctor_email || ''}
                onChange={handleInputChange}
                className="form-control"
                type="email"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                name="age"
                value={editableDoctor.doctor_age || ''}
                onChange={handleInputChange}
                className="form-control"
                type="number"
              />
            </div>
            <div className="form-group">
              <label>Sex</label>
              <select
                name="sex"
                value={editableDoctor.doctor_sex || ''}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        ) : (
          // View mode
          <>
            <h2>{doctor.doctor_name}</h2>
            <div className="doctor-details-container">
              <div className="doctor-detail">
                <strong>Specialization:</strong> 
                <span>{doctor.specialization}</span>
              </div>
              <div className="doctor-detail">
                <strong>Phone:</strong> 
                <span>{doctor.doctor_phone_no}</span>
              </div>
              <div className="doctor-detail">
                <strong>Email:</strong> 
                <span>{doctor.doctor_email}</span>
              </div>
              <div className="doctor-detail">
                <strong>Age:</strong> 
                <span>{doctor.doctor_age}</span>
              </div>
              <div className="doctor-detail">
                <strong>Sex:</strong> 
                <span>{doctor.doctor_sex || 'Not specified'}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="nav-actions">
        <button onClick={() => navigate('/get-doctors')} className="back-button">
          Back to Doctors List
        </button>
      </div>
    </div>
  );
}

export default DoctorProfile;