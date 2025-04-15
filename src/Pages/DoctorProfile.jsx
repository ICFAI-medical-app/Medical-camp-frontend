import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/DoctorProfile.css';

function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [editableDoctor, setEditableDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  const fetchDoctorData = () => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_BACKEND}/api/admin/get_doctor/${id}`)
      .then(response => {
        console.log("Doctor data:", response.data);
        setDoctor(response.data);
        setEditableDoctor(response.data);
        setLoading(false);
      })
      .catch(error => {
        alert('Error fetching doctor information');
        console.log(error);
        setLoading(false);
      });
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
    
    if (!editableDoctor.doctor_name || editableDoctor.doctor_name.trim() === '') {
      errors.doctor_name = "Doctor name is required";
    }
    
    if (!editableDoctor.specialization || editableDoctor.specialization.trim() === '') {
      errors.specialization = "Specialization is required";
    }
    
    if (!editableDoctor.doctor_phone_no || editableDoctor.doctor_phone_no.trim() === '') {
      errors.doctor_phone_no = "Phone number is required";
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
      const url = `${process.env.REACT_APP_BACKEND}/api/admin/edit_doctor/${id}`;
      console.log('Sending update to:', url);
      console.log('With data:', editableDoctor);
      
      const response = await axios.put(url, editableDoctor);
      setDoctor(response.data);
      setIsEditing(false);
      alert('Doctor information updated successfully');
    } catch (error) {
      console.error('Error updating doctor information:', error);
      
      // Check if it's a validation error from the server
      if (error.response && error.response.data && error.response.data.error) {
        alert('Update failed: ' + error.response.data.error);
      } else {
        alert('Failed to update doctor information. Please try again.');
      }
    } finally {
      setSaving(false);
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
          <button className="edit-button" onClick={handleEditToggle}>
            Edit
          </button>
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
              <label>Doctor Name <span className="required">*</span></label>
              <input
                name="doctor_name"
                value={editableDoctor.doctor_name || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.doctor_name ? 'error-input' : ''}`}
              />
              {validationErrors.doctor_name && (
                <div className="error-message">{validationErrors.doctor_name}</div>
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
              <label>Phone Number <span className="required">*</span></label>
              <input
                name="doctor_phone_no"
                value={editableDoctor.doctor_phone_no || ''}
                onChange={handleInputChange}
                className={`form-control ${validationErrors.doctor_phone_no ? 'error-input' : ''}`}
              />
              {validationErrors.doctor_phone_no && (
                <div className="error-message">{validationErrors.doctor_phone_no}</div>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="doctor_email"
                value={editableDoctor.doctor_email || ''}
                onChange={handleInputChange}
                className="form-control"
                type="email"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                name="doctor_age"
                value={editableDoctor.doctor_age || ''}
                onChange={handleInputChange}
                className="form-control"
                type="number"
              />
            </div>
            <div className="form-group">
              <label>Sex</label>
              <select
                name="doctor_sex"
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