// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import '../Styles/Doctor.css';

// function AddDoctor() {
//     const navigate = useNavigate();
//     const [doctors, setDoctors] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         setIsLoading(true);
//         axios.get('http://localhost:5002/api/admin/get_doctors')
//             .then((response) => {
//                 if (response.data && response.data.length > 0) {
//                     setDoctors(response.data);
//                 }
//             })
//             .catch((error) => {
//                 console.log(error);
//                 setError('Failed to load doctors');
//             })
//             .finally(() => {
//                 setIsLoading(false);
//             });
//     }, []);

//     const deleteDoctor = (id) => {
//         if (window.confirm('Are you sure you want to delete this doctor?')) {
//             setIsLoading(true);
//             axios.delete(`http://localhost:5002/api/admin/delete_doctor/${id}`)
//                 .then(() => {
//                     setDoctors(doctors.filter((doctor) => doctor._id !== id));
//                     alert('Doctor deleted successfully');
//                 })
//                 .catch((error) => {
//                     console.log(error);
//                     alert('Error deleting doctor');
//                 })
//                 .finally(() => {
//                     setIsLoading(false);
//                 });
//         }
//     };

//     const DoctorCard = ({ doctor }) => (
//         <div className="doctor-card-item">
//             <h3 className="doctor-name">{doctor.doctor_name}</h3>
//             <p className="doctor-detail"><strong>Email:</strong> {doctor.doctor_email}</p>
//             <p className="doctor-detail"><strong>Phone:</strong> {doctor.doctor_phone_no}</p>
//             <p className="doctor-detail"><strong>Age:</strong> {doctor.doctor_age}</p>
//             <p className="doctor-detail"><strong>Sex:</strong> {doctor.doctor_sex}</p>
//             <p className="doctor-detail"><strong>Specialization:</strong> {doctor.specialization}</p>
//             <button 
//                 className="delete-doctor-btn" 
//                 onClick={() => deleteDoctor(doctor._id)}
//                 disabled={isLoading}
//             >
//                 Delete
//             </button>
//         </div>
//     );

//     // Form state with validation
//     const [formData, setFormData] = useState({
//         doctor_name: '',
//         doctor_email: '',
//         doctor_phone_no: '',
//         doctor_age: '',
//         specialization: '',
//         doctor_sex: ''
//     });
    
//     // Handle form input changes
//     const handleInputChange = (e) => {
//         const { id, value } = e.target;
//         setFormData({
//             ...formData,
//             [id === 'doctorName' ? 'doctor_name' : 
//              id === 'doctorEmail' ? 'doctor_email' :
//              id === 'doctorPhone' ? 'doctor_phone_no' :
//              id === 'doctorAge' ? 'doctor_age' :
//              id === 'doctorSpecialization' ? 'specialization' :
//              id === 'doctorSex' ? 'doctor_sex' : id]: value
//         });
//     };
    
//     // Validate form data
//     const validateForm = () => {
//         if (!formData.doctor_name) return "Doctor name is required";
//         if (!formData.doctor_email) return "Email is required";
//         if (!/\S+@\S+\.\S+/.test(formData.doctor_email)) return "Email is invalid";
//         if (!formData.doctor_phone_no) return "Phone number is required";
//         if (!formData.doctor_age) return "Age is required";
//         if (!formData.specialization) return "Specialization is required";
//         if (!formData.doctor_sex) return "Sex is required";
//         return "";
//     };
    
//     const addDoctor = () => {
//         // Reset error state
//         setError('');
        
//         // Validate form
//         const validationError = validateForm();
//         if (validationError) {
//             setError(validationError);
//             return;
//         }
        
//         setIsLoading(true);
        
//         axios.post('http://localhost:5002/api/admin/add_doctor', formData)
//             .then((response) => {
//                 if (response.data) {
//                     setDoctors([...doctors, response.data]);
//                     // Reset form
//                     setFormData({
//                         doctor_name: '',
//                         doctor_email: '',
//                         doctor_phone_no: '',
//                         doctor_age: '',
//                         specialization: '',
//                         doctor_sex: ''
//                     });
//                     alert('Doctor added successfully');
//                 } else {
//                     setError('Received invalid response from server');
//                 }
//             })
//             .catch((error) => {
//                 console.log(error);
//                 setError(error.response?.data?.message || 'Error while adding a doctor');
//             })
//             .finally(() => {
//                 setIsLoading(false);
//             });
//     };

//     return (
//         <div className="doctor-page">
//             <header className="doctor-header">
//                 <h1>Doctor Management</h1>
//             </header>

//             <div className="doctor-content">
//                 <div className="doctor-stats">
//                     <div className="stats-box">
//                         <h3>Total Doctors</h3>
//                         <p>{doctors.length}</p>
//                     </div>
//                 </div>

//                 <div className="doctor-form-section">
//                     <h2>Add a Doctor</h2>
//                     <div className="doctor-form">
//                         {error && <div className="error-message">{error}</div>}
//                         <div className="form-group">
//                             <label htmlFor="doctorName">Name</label>
//                             <input
//                                 id="doctorName"
//                                 type="text"
//                                 placeholder="Name"
//                                 value={formData.doctor_name}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="doctorEmail">Email</label>
//                             <input
//                                 id="doctorEmail"
//                                 type="email"
//                                 placeholder="Email"
//                                 value={formData.doctor_email}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="doctorPhone">Phone</label>
//                             <input
//                                 id="doctorPhone"
//                                 type="text"
//                                 placeholder="Phone"
//                                 value={formData.doctor_phone_no}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="doctorAge">Age</label>
//                             <input
//                                 id="doctorAge"
//                                 type="number"
//                                 placeholder="Age"
//                                 value={formData.doctor_age}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="doctorSpecialization">Specialization</label>
//                             <input
//                                 id="doctorSpecialization"
//                                 type="text"
//                                 placeholder="Specialization"
//                                 value={formData.specialization}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="doctorSex">Sex</label>
//                             <select
//                                 id="doctorSex"
//                                 value={formData.doctor_sex}
//                                 onChange={handleInputChange}
//                             >
//                                 <option value="">Select</option>
//                                 <option value="Male">Male</option>
//                                 <option value="Female">Female</option>
//                                 <option value="Other">Other</option>
//                             </select>
//                         </div>
//                         <button 
//                             className="add-doctor-btn" 
//                             onClick={addDoctor}
//                             disabled={isLoading}
//                         >
//                             {isLoading ? 'Adding...' : 'Add Doctor'}
//                         </button>
//                     </div>
//                 </div>

//                 <div className="doctor-list-section">
//                     <h2>Doctors List</h2>
//                     <div className="doctor-list">
//                         {isLoading && <p>Loading doctors...</p>}
//                         {!isLoading && doctors.length > 0 ? (
//                             doctors.map((doctor) => (
//                                 <DoctorCard doctor={doctor} key={doctor._id} />
//                             ))
//                         ) : (
//                             !isLoading && <p>No doctors found</p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AddDoctor;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/Doctor.css';

function Doctor() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state with validation
    const [formData, setFormData] = useState({
        doctor_name: '',
        doctor_email: '',
        doctor_phone_no: '',
        doctor_age: '',
        specialization: '',
        doctor_sex: ''
    });
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id === 'doctorName' ? 'doctor_name' : 
             id === 'doctorEmail' ? 'doctor_email' :
             id === 'doctorPhone' ? 'doctor_phone_no' :
             id === 'doctorAge' ? 'doctor_age' :
             id === 'doctorSpecialization' ? 'specialization' :
             id === 'doctorSex' ? 'doctor_sex' : id]: value
        });
    };
    
    // Validate form data
    const validateForm = () => {
        if (!formData.doctor_name) return "Doctor name is required";
        if (!formData.doctor_email) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(formData.doctor_email)) return "Email is invalid";
        if (!formData.doctor_phone_no) return "Phone number is required";
        if (!formData.doctor_age) return "Age is required";
        if (!formData.specialization) return "Specialization is required";
        if (!formData.doctor_sex) return "Sex is required";
        return "";
    };
    
    const addDoctor = () => {
        // Reset error state
        setError('');
        
        // Validate form
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        
        setIsLoading(true);
        
        axios.post('http://localhost:5002/api/admin/add_doctor', formData)
            .then((response) => {
                if (response.data) {
                    // Reset form
                    setFormData({
                        doctor_name: '',
                        doctor_email: '',
                        doctor_phone_no: '',
                        doctor_age: '',
                        specialization: '',
                        doctor_sex: ''
                    });
                    alert('Doctor added successfully');
                } else {
                    setError('Received invalid response from server');
                }
            })
            .catch((error) => {
                console.log(error);
                setError(error.response?.data?.message || 'Error while adding a doctor');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="doctor-page">
            <header className="doctor-header">
                <h1>Add New Doctor</h1>
            </header>

            <div className="doctor-content">
                <div className="doctor-form-section">
                    <h2>Doctor Information</h2>
                    <div className="doctor-form">
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label htmlFor="doctorName">Name</label>
                            <input
                                id="doctorName"
                                type="text"
                                placeholder="Name"
                                value={formData.doctor_name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorEmail">Email</label>
                            <input
                                id="doctorEmail"
                                type="email"
                                placeholder="Email"
                                value={formData.doctor_email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorPhone">Phone</label>
                            <input
                                id="doctorPhone"
                                type="text"
                                placeholder="Phone"
                                value={formData.doctor_phone_no}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorAge">Age</label>
                            <input
                                id="doctorAge"
                                type="number"
                                placeholder="Age"
                                value={formData.doctor_age}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorSpecialization">Specialization</label>
                            <input
                                id="doctorSpecialization"
                                type="text"
                                placeholder="Specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="doctorSex">Sex</label>
                            <select
                                id="doctorSex"
                                value={formData.doctor_sex}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button 
                            className="add-doctor-btn" 
                            onClick={addDoctor}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add Doctor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Doctor;