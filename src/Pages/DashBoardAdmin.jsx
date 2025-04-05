import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Dashboard.css';

function DashboardAdmin() {
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
    {title: "View Doctors" , icon: "👨‍⚕️" , path: "/get-doctors"},
    { title: "Add Doctor", icon: "👨‍⚕️", path: "/add-doctor" },
    { title: "Update Doctor Availability", icon: "📅", path: "/doctor-availability" },
    { title: "View Patients", icon: "😷", path: "/view-patients" },
    { title: "Update the medicine stock", icon: "💊", path: "/update-medicine-stock" },
    { title: "Add a new medicine to inventory", icon: "💊", path: "/add-new-medicine" },
    { title: "View Medicines", icon: "💊", path: "/get-medicines" },
    {title: "Expired Medicines", icon: "💊", path: "/expired-medicines"}
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

export default DashboardAdmin;
