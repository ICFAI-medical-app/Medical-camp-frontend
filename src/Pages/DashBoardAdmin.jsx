import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Dashboard.css';

function DashboardAdmin() {
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
    { title: "Doctor", icon: "👨‍⚕️", path: "/doctor" },
    { title: "Update Doctor Availability", icon: "📅", path: "/doctor-availability" },
    // { title: "Add a volunteer", icon: "🧍", path: "/add-volunteer" },
    {title: "View Patients" , icon: "😷" , path: "/view-patients"},
    { title: "Update the medicine stock", icon: "💊", path: "/update-medicine-stock" },
    { title: "Add a new medicine to the inventory", icon: "💊", path: "/add-new-medicine" },
    { title: "Get all the medicines in the inventory", icon: "💊", path: "/get-medicines"},
    // { title: "Patient registration", icon: "👤", path: "/patient-registration" },
    // { title: "Vitals", icon: "💓", path: "/vitals" },
    // { title: "Doctor assigning", icon: "👨‍⚕️", path: "/doctor-assigning" },
    // { title: "Doctor Prescription", icon: "📝", path: "/doctor-prescription" },
    // { title: "Medicine pickup", icon: "💊", path: "/medicine-pickup" },
    // { title: "Medicine verification", icon: "✓", path: "/medicine-verification" },
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

export default DashboardAdmin;