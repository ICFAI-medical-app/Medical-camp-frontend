// import React from 'react';
// import { Link } from 'react-router-dom';
// import './../Styles/Dashboard.css';

// function Dashboard() {
//   const Card = ({ title }) => (
//     <div className="card">
//       <div className="card-icon">🔲</div>
//       <div className="card-content">
//         <h3>{title}</h3>
//         <p>Subhead</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="dashboard">
//       <h1>Dashboard</h1>
//       <div className="card-container">
//         <Link to="/patient-registration">
//           <Card title="Patient registration" />
//         </Link>
//         <Link to="/vitals">
//           <Card title="Vitals" />
//         </Link>
//         <Link to="/doctor-assigning">
//           <Card title="Doctor assigning" />
//         </Link>
//         <Link to="/doctor-prescription">
//           <Card title="Doctor Prescription" />
//         </Link>
//         <Link to="/medicine-pickup">
//           <Card title="Medicine pickup" />
//         </Link>
//         <Link to="/medicine-verification">
//           <Card title="Medicine verification" />
//         </Link>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Dashboard.css';

function Dashboard() {
  const Card = ({ title, icon }) => (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>Subhead</p>
      </div>
    </div>
  );

  const cardData = [
    { title: "Patient registration", icon: "👤", path: "/patient-registration" },
    { title: "Vitals", icon: "💓", path: "/vitals" },
    { title: "Doctor assigning", icon: "👨‍⚕️", path: "/doctor-assigning" },
    { title: "Doctor Prescription", icon: "📝", path: "/doctor-prescription" },
    { title: "Medicine pickup", icon: "💊", path: "/medicine-pickup" },
    { title: "Medicine verification", icon: "✓", path: "/medicine-verification" },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="card-grid">
        {cardData.map((card, index) => (
          <Link to={card.path} key={index} className="card-link">
            <Card title={card.title} icon={card.icon} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;