import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ViewDoctor.css';
import { privateAxios } from '../api/axios';

function ViewDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    privateAxios.get('/api/admin/get_doctors')
      .then(response => {
        console.log(response.data);
        setDoctors(response.data);
        
        // Extract unique specializations for filter dropdown
        const uniqueSpecializations = [...new Set(response.data.map(doctor => doctor.specialization))];
        setSpecializations(uniqueSpecializations);
      })
      .catch(error => {
        alert('Error fetching doctors');
        console.log(error);
      });
  }, []);

  const handleRowClick = (doctorId) => {
    // Navigate to doctor profile page
    navigate(`/doctor/${doctorId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
  };

  // Filter doctors based on search query and selected specialization
  const filteredDoctors = doctors.filter(doctor => {
    const nameMatch = doctor.doctor_name.toLowerCase().includes(searchQuery.toLowerCase());
    const specializationMatch = selectedSpecialization === '' || doctor.specialization === selectedSpecialization;
    return nameMatch && specializationMatch;
  });

  return (
    <div className="doctor-container">
      <h1>Doctors</h1>
      
      <div className="doctor-filters">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by doctor name" 
            value={searchQuery}
            onChange={handleSearchChange}
            className="doctor-search-input"
          />
        </div>
        
        <div className="filter-container">
          <select 
            value={selectedSpecialization}
            onChange={handleSpecializationChange}
            className="specialization-filter"
          >
            <option value="">All Specializations</option>
            {specializations.map((specialization, index) => (
              <option key={index} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
          
          <button onClick={resetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className="doctor-table-container">
        <table className="doctor-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor, index) => (
                <tr key={index} onClick={() => handleRowClick(doctor._id || index)}>
                  <td>{doctor.doctor_name}</td>
                  <td>{doctor.specialization}</td>
                  <td className="action-cell">
                    <div className="tap-details">Tap for doctor details</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-results">No doctors found matching your criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewDoctors;