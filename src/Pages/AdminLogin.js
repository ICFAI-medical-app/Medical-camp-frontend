// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import '../Styles/Login.css';

// // const AdminLogin = () => {
// //   const [user_name, setUserName] = useState('');
// //   const [user_password, setUserPassword] = useState('');
// //   const navigate = useNavigate();
// //   const PORT = process.env.PORT || 5002;

// //   const handleAdminLogin = async () => {
// //     try {
// //       const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/login`, { user_name, user_password, user_type: 'admin' });
// //       if (response.status === 200) {
// //         localStorage.setItem('authToken', response.data.token);
// //         navigate('/dashboard-admin');
// //       } else {
// //         alert('Invalid credentials');
// //       }
// //     } catch (error) {
// //       alert('Server error');
// //     }
// //   };

// //   return (
// //     <div className="login-container">
// //       <h2 className="login-title">Admin Login</h2>
// //       <div className="login-admin-form">
// //         <input
// //           type="text"
// //           placeholder="Username"
// //           value={user_name}
// //           onChange={(e) => setUserName(e.target.value)}
// //         />
// //         <input
// //           type="password"
// //           placeholder="Password"
// //           value={user_password}
// //           onChange={(e) => setUserPassword(e.target.value)}
// //         />
// //         <button onClick={handleAdminLogin} className="login-submit-btn">Submit</button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminLogin;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../Styles/AdminLogin.css'; // Changed from Login.css to AdminLogin.css

// const AdminLogin = () => {
//   const [user_name, setUserName] = useState('');
//   const [user_password, setUserPassword] = useState('');
//   const navigate = useNavigate();
//   const PORT = process.env.PORT || 5002;

//   const handleAdminLogin = async () => {
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/login`, { user_name, user_password, user_type: 'admin' });
//       if (response.status === 200) {
//         localStorage.setItem('authToken', response.data.token);
//         navigate('/dashboard-admin');
//       } else {
//         alert('Invalid credentials');
//       }
//     } catch (error) {
//       alert('Server error');
//     }
//   };

//   const handleBackToHome = () => {
//     navigate('/');
//   };

//   return (
//     <div className="admin-page-container">
//       <header className="admin-header">
//         <h1>Healthcare Volunteer System</h1>
//       </header>
      
//       <div className="admin-content-container">
//         <div className="admin-image-section">
//           <img 
//             src="/images/healthcare2.jpg" 
//             alt="Healthcare Admin"
//             className="admin-background-image"
//           />
//           <div className="admin-image-overlay"></div>
//         </div>
        
//         <div className="admin-login-section">
//           <div className="admin-login-card">
//             <h2 className="admin-login-title">Admin Login</h2>
//             <div className="admin-login-form">
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={user_name}
//                 onChange={(e) => setUserName(e.target.value)}
//                 className="admin-input"
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={user_password}
//                 onChange={(e) => setUserPassword(e.target.value)}
//                 className="admin-input"
//               />
//               <button onClick={handleAdminLogin} className="admin-submit-btn">
//                 Submit
//               </button>
//               <button onClick={handleBackToHome} className="admin-back-btn">
//                 Back to Main Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/AdminLogin.css';

const AdminLogin = () => {
  const [user_name, setUserName] = useState('');
  const [user_password, setUserPassword] = useState('');
  const navigate = useNavigate();
  const PORT = process.env.PORT || 5002;

  const handleAdminLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND}/api/admin/login`, { user_name, user_password, user_type: 'admin' });
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.token);
        navigate('/dashboard-admin');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Server error');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="admin-container">
      <div className="admin-login-form-container">
        <h2 className="admin-title">Admin Login</h2>
        <div className="admin-form">
          <input
            type="text"
            placeholder="Username"
            value={user_name}
            onChange={(e) => setUserName(e.target.value)}
            className="admin-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={user_password}
            onChange={(e) => setUserPassword(e.target.value)}
            className="admin-input"
          />
          <button onClick={handleAdminLogin} className="admin-button">
            Login
          </button>
          <button onClick={handleBackToHome} className="admin-back-button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;