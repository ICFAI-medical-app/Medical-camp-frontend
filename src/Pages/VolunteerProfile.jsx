import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/VolunteerProfile.css';

function VolunteerProfile() {
  const [volunteer, setVolunteer] = useState(null);
  const [editableVolunteer, setEditableVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND || 'http://localhost:5002';

  useEffect(() => {
    fetchVolunteerData();
  }, [id]);

  const fetchVolunteerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/get_volunteer/${id}`);
      setVolunteer(response.data);
      setEditableVolunteer(response.data);
    } catch (error) {
      console.error('Error fetching volunteer:', error);
      alert('Error fetching volunteer information');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - revert to original data
      setEditableVolunteer(volunteer);
      setValidationErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableVolunteer({
      ...editableVolunteer,
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
    
    if (!editableVolunteer.user_name || editableVolunteer.user_name.trim() === '') {
      errors.user_name = "Username is required";
    }
    
    if (!editableVolunteer.user_email || editableVolunteer.user_email.trim() === '') {
      errors.user_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editableVolunteer.user_email)) {
      errors.user_email = "Email format is invalid";
    }
    
    if (!editableVolunteer.user_phone_no || editableVolunteer.user_phone_no.trim() === '') {
      errors.user_phone_no = "Phone number is required";
    }
    
    if (!editableVolunteer.user_age) {
      errors.user_age = "Age is required";
    } else if (isNaN(editableVolunteer.user_age) || editableVolunteer.user_age < 18) {
      errors.user_age = "Age must be at least 18";
    }
    
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
        `${BACKEND_URL}/api/admin/edit_volunteer/${id}`, 
        editableVolunteer
      );
      
      setVolunteer(response.data.volunteer);
      setIsEditing(false);
      alert('Volunteer information updated successfully');
    } catch (error) {
      console.error('Error updating volunteer:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        alert('Update failed: ' + error.response.data.message);
      } else {
        alert('Failed to update volunteer information. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this volunteer? This action cannot be undone.')) {
      try {
        await axios.post(`${BACKEND_URL}/api/admin/delete_volunteer/${id}`);
        alert('Volunteer deleted successfully');
        navigate('/get-volunteers');
      } catch (error) {
        console.error('Error deleting volunteer:', error);
        alert('Failed to delete volunteer. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading volunteer information...</p>
      </div>
    );
  }

  if (!volunteer) {
    return <div className="error">Volunteer not found</div>;
  }

  return (
    <div className="volunteer-profile-container">
      <div className="volunteer-profile-header">
        <h1>Volunteer Profile</h1>
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
      <div className="volunteer-profile-card">
        <div className="volunteer-avatar-large">
          {volunteer.user_name?.charAt(0).toUpperCase() || 'V'}
        </div>
        {isEditing ? (
          // Edit mode
          <div className="volunteer-edit-form">
            <div className="form-group">
              <label>Username <span className="required">*</span></label>
              <input
                name="user_name"
                value={editableVolunteer.user_name || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.user_name ? 'error-input' : ''}`}
              />
              {validationErrors.user_name && (
                <div className="error-message">{validationErrors.user_name}</div>
              )}
            </div>
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input
                name="user_email"
                value={editableVolunteer.user_email || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.user_email ? 'error-input' : ''}`}
                type="email"
              />
              {validationErrors.user_email && (
                <div className="error-message">{validationErrors.user_email}</div>
              )}
            </div>
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                name="user_phone_no"
                value={editableVolunteer.user_phone_no || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.user_phone_no ? 'error-input' : ''}`}
              />
              {validationErrors.user_phone_no && (
                <div className="error-message">{validationErrors.user_phone_no}</div>
              )}
            </div>
            <div className="form-group">
              <label>Age <span className="required">*</span></label>
              <input
                name="user_age"
                value={editableVolunteer.user_age || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.user_age ? 'error-input' : ''}`}
                type="number"
                min="18"
              />
              {validationErrors.user_age && (
                <div className="error-message">{validationErrors.user_age}</div>
              )}
            </div>
            <div className="form-group">
              <label>New Password (leave blank to keep unchanged)</label>
              <input
                name="user_password"
                value={editableVolunteer.user_password || ''}
                onChange={handleInputChange}
                className="form-control"
                type="password"
                placeholder="Enter new password"
              />
            </div>
          </div>
        ) : (
          // View mode
          <>
            <h2>{volunteer.user_name}</h2>
            <div className="volunteer-details-container">
              <div className="volunteer-detail">
                <strong>User ID:</strong> 
                <span>{volunteer.user_id}</span>
              </div>
              <div className="volunteer-detail">
                <strong>Email:</strong> 
                <span>{volunteer.user_email}</span>
              </div>
              <div className="volunteer-detail">
                <strong>Phone:</strong> 
                <span>{volunteer.user_phone_no}</span>
              </div>
              <div className="volunteer-detail">
                <strong>Age:</strong> 
                <span>{volunteer.user_age}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="nav-actions">
        <button onClick={() => navigate('/get-volunteers')} className="back-button">
          Back to Volunteers List
        </button>
      </div>
    </div>
  );
}

export default VolunteerProfile;