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
    { title: "1. Token Generation", icon: "🎟️", path: "/token" },
    { title: "2. Patient registration", icon: "👤", path: "/patient-registration" },
    { title: "3. Vitals", icon: "💓", path: "/vitals" },
    { title: "4. Patients Waiting", icon: "⏳", class:"in-progress" },
    { title: "5. Doctor assigning", icon: "👨‍⚕️", path: "/doctor-assigning" },
    // { title: "5.2 Doctor assigning automatic", icon: "👨‍⚕️", path: "/doctor-assigning-automatic" },
    { title: "6. Doctor Assitance", icon: "👩‍⚕️", class:"in-progress" },
    { title: "7. View Queues", icon: "📋", path: "/view-queue" },
    { title: "8. Doctor Prescription", icon: "📝", path: "/doctor-prescription" },
    { title: "9. Medicine pickup", icon: "💊", path: "/medicine-pickup" },
    { title: "10. Medicine Verification", icon: "🔍", path:"/medicine-verification" },
    { title: "11. Medicine Delivery", icon: "🚚", class:"in-progress" },
    { title: "12. Counselling", icon: "🗣️", class:"in-progress" },
    { title: "13. Lab", icon: "🔬", class:"in-progress" },
    { title: "14. Patient Support", icon: "🤝", class:"in-progress" },
    { title: "15. Food", icon: "🍽️", class:"in-progress" },
  ];


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="dashboard-card-container">
        {cardData.map((card, index) => (
          <Link to={card.path} key={index} className={`dashboard-card-link ${card.class}`}>
            <Card title={card.title} icon={card.icon} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
