import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Dashboard.css';

function Dashboard() {
  const Card = ({ title, icon }) => (
    <div className="dashboard-card">
      <div className="dashboard-card-icon">{icon}</div>
      <div className="dashboard-card-content">
        <h3>{title}</h3>
        {/* <p>Subhead</p> */}
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
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="dashboard-card-container">
        {cardData.map((card, index) => (
          <Link to={card.path} key={index} className="dashboard-card-link">
            <Card title={card.title} icon={card.icon} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
