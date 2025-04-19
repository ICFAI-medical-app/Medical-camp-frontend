// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../Styles/ViewDoctor.css';

// function ViewDoctors() {
//   const [doctors, setDoctors] = useState([]);
//   const PORT = process.env.PORT || 5002;

//   useEffect(() => {
//     axios
//       .get(`${process.env.REACT_APP_BACKEND}/api/admin/get_doctors`)
//       .then(response => {
//         console.log(response.data);
//         setDoctors(response.data);
//       })
//       .catch(error => {
//         alert('Error fetching doctors');
//         console.log(error);
//       });
//   }, []);

//   const Doctor = ({ doctor }) => (
//     <div className="doctor-card">
//       <h3>{doctor.doctor_name}</h3>
//       <p>{doctor.specialization}</p>
//       <p><span className="icon">📞</span> {doctor.doctor_phone_no}</p>
//       <p><span className="icon">✉️</span> {doctor.doctor_email}</p>
//       <p>Age: {doctor.doctor_age}</p>
//     </div>
//   );

//   return (
//     <div className="doctor-container">
//       <h1>Doctors</h1>
//       <div className="doctor-card-container">
//         {doctors.map((doctor, index) => (
//           <Doctor key={index} doctor={doctor} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default ViewDoctors;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/ViewDoctor.css';
import { privateAxios } from '../api/axios';

function ViewDoctors() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const PORT = process.env.PORT || 5002;

  useEffect(() => {
    // axios
    //   .get(`${process.env.REACT_APP_BACKEND}/api/admin/get_doctors`)
    //   .then(response => {
    //     console.log(response.data);
    //     setDoctors(response.data);
    //   })
    privateAxios.get('/api/admin/get_doctors')
      .then(response => {
        console.log(response.data);
        setDoctors(response.data);
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

  return (
    <div className="doctor-container">
      <h1>Doctors</h1>
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
            {doctors.map((doctor, index) => (
              <tr key={index} onClick={() => handleRowClick(doctor._id || index)}>
                <td>{doctor.doctor_name}</td>
                <td>{doctor.specialization}</td>
                <td className="action-cell">
                  <div className="tap-details">Tap for doctor details</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewDoctors;