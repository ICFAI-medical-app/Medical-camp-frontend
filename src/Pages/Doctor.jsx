// import React, { useState , useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import '../Styles/Dashboard.css';

// function Doctor() {
//     const navigate = useNavigate();
//     // show all the doctors
//     const [doctors, setDoctors] = useState([]);
//     useEffect(() => {
//         axios.get('http://localhost:5002/api/admin/get_doctors')
//         .then((response) => {
//             console.log(response);
//             if (response.data && response.data.length > 0)
//             {
//                 setDoctors(response.data)
//             }
//         })
//         .catch((error) => {
//             console.log(error);
//         })
//     }
//     , []);

//     const deleteDoctor = (id) => {
//         axios.delete(`http://localhost:5002/api/admin/delete_doctor/${id}`)
//         .then((response) => {
//             setDoctors(doctors.filter((doctor) => doctor._id !== id));
//         })
//         .catch((error) => {
//             console.log(error);
//         })
//     };

//     // Each doctor card component also contains a delete button with a delete image icon

//     const Card = ({ doctor }) => (
//         <div className="card">
//             <div className="card-content">
//                 <h3>{doctor.name}</h3>
//                 <p>{doctor.email}</p>
//                 <p>{doctor.phone}</p>
//                 <p>{doctor.age}</p>
//                 <p>{doctor.sex}</p>
//                 <p>{doctor.specialization}</p>
//                 <button onClick={() => deleteDoctor(doctor._id)}>Delete</button>
//             </div>
//         </div>
//     );

//     // First before the card grid, show a form to add a doctor
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [phone, setPhone] = useState('');
//     const [age, setAge] = useState('');
//     const [
//         specialization,
//         setSpecialization,
//     ] = useState('');
//     const [sex , setSex] = useState('');

//     const addDoctor = () => {
//         axios.post('http://localhost:5002/api/admin/add_doctor', {
//             name,
//             email,
//             phone,
//             age,
//             specialization,
//             sex
//         })
//         .then((response) => {
//             setDoctors([...doctors, response.data]);
//         })
//         .catch((error) => {
//             console.log(error);
//         })

//         setName('');
//         setEmail('');
//         setPhone('');
//         setAge('');
//         setSpecialization('');
//         setSex('');

//     };
//     return (
//         <div className="dashboard">
//             <h1>Add a Doctor</h1>
//             <div className="add-doctor-form">
//                 <input
//                     type="text"
//                     placeholder="Name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                 />
//                 <input
//                     type="email"
//                     placeholder="Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Phone"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                 />
//                 <input
//                     type="number"
//                     placeholder="Age"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Specialization"
//                     value={specialization}
//                     onChange={(e) => setSpecialization(e.target.value)}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Sex"
//                     value={sex}
//                     onChange={(e) => setSex(e.target.value)}
//                 />
//                 <button onClick={addDoctor}>Add Doctor</button>
//             </div>
//             <div className="card-grid">
//                 {doctors.map((doctor, index) => (
//                     <Card doctor={doctor} key={index} />
//                 ))}
//             </div>
//             <div>
//                 <button onClick={() => navigate('/')}>Go Back</button>
//             </div>
//         </div>
//     );
    
// }

// export default Doctor;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../Styles/Doctor.css';

function Doctor() {
    const navigate = useNavigate();
    // show all the doctors
    const [doctors, setDoctors] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5002/api/admin/get_doctors')
            .then((response) => {
                // console.log(response);
                if (response.data && response.data.length > 0) {
                    setDoctors(response.data)
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    const deleteDoctor = (id) => {
        axios.delete(`http://localhost:5002/api/admin/delete_doctor/${id}`)
            .then((response) => {
                setDoctors(doctors.filter((doctor) => doctor._id !== id));
                alert('Doctor deleted successfully');
            })
            .catch((error) => {
                console.log(error);
            })
    };

    // Each doctor card component also contains a delete button with a delete image icon
    const Card = ({ doctor }) => (
        <div className="doctor-item">
            <h3>{doctor.doctor_name}</h3>
            <p><strong></strong></p>
            <p><strong>Email:</strong> {doctor.doctor_email}</p>
            <p><strong>Phone:</strong> {doctor.doctor_phone_no}</p>
            <p><strong>Age:</strong> {doctor.doctor_age}</p>
            <p><strong>Sex:</strong> {doctor.doctor_sex}</p>
            <p><strong>Specialization:</strong> {doctor.specialization}</p>
            <button className="button-danger" onClick={() => deleteDoctor(doctor._id)}>Delete</button>
        </div>
    );

    // First before the card grid, show a form to add a doctor
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [sex, setSex] = useState('');

    const addDoctor = () => {
        axios.post('http://localhost:5002/api/admin/add_doctor', {
            name,
            email,
            phone,
            age,
            specialization,
            sex
        })
            .then((response) => {
                setDoctors([...doctors, response.data]);
                // Give a success message
                alert('Doctor added successfully');
            })
            .catch((error) => {
                console.log(error);
                // Give an error message
                alert('Error while adding a doctor');
            })

        setName('');
        setEmail('');
        setPhone('');
        setAge('');
        setSpecialization('');
        setSex('');
    };

    return (
        <div className="doctor-container">
            <header className="doctor-header">
                <h1>Doctor Management</h1>
            </header>
            
            <div className="doctor-main-content">
                {/* <aside className="doctor-sidebar">
                    <ul>
                        <li className="active"><a href="#">Manage Doctors</a></li>
                        <li><a href="#" onClick={() => navigate('/')}>Dashboard</a></li>
                    </ul>
                </aside> */}
                
                <main className="doctor-content">
                    <div className="doctor-stats">
                        <div className="stat-card">
                            <h3>Total Doctors</h3>
                            <p>{doctors.length}</p>
                        </div>
                    </div>
                    
                    <div className="doctor-card">
                        <h2>Add a Doctor</h2>
                        <div className="doctor-form">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input
                                    id="phone"
                                    type="text"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    id="age"
                                    type="number"
                                    placeholder="Age"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="specialization">Specialization</label>
                                <input
                                    id="specialization"
                                    type="text"
                                    placeholder="Specialization"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="sex">Sex</label>
                                <select
                                    id="sex"
                                    value={sex}
                                    onChange={(e) => setSex(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button onClick={addDoctor}>Add Doctor</button>
                        </div>
                    </div>
                    
                    <div className="doctor-card">
                        <h2>Doctors List</h2>
                        <div className="doctor-grid">
                            {doctors.length > 0 ? (
                                doctors.map((doctor, index) => (
                                    <Card doctor={doctor} key={index} />
                                ))
                            ) : (
                                <p>No doctors found</p>
                            )}
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button className="button-secondary" onClick={() => navigate('/')}>Back to Dashboard</button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Doctor;