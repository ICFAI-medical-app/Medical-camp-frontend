import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQrScanner } from '../Context/QrScannerContext';
import '../Styles/Dashboard.css';

function Dashboard() {
  const { openScanner } = useQrScanner();
  const navigate = useNavigate();
  const [scannedBookNumber, setScannedBookNumber] = useState('');

  const handleDashboardScan = (bookNumber) => {
    setScannedBookNumber(bookNumber);
    // Optionally provide some visual feedback on the dashboard that a book number was scanned
    alert(`Book Number ${bookNumber} scanned! Now click a card to proceed.`);
  };

  const handleViewQueue = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/view-queues/${type}`);
  };

  const Card = ({ title, icon, queueType }) => (
    <div className="dashboard-card" style={{ position: 'relative', paddingBottom: queueType ? '40px' : '20px' }}>
      <div className="dashboard-card-icon">{icon}</div>
      <div className="dashboard-card-content">
        <h3>{title}</h3>
      </div>
      {queueType && (
        <button
          onClick={(e) => handleViewQueue(e, queueType)}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            borderRadius: '20px',
            border: 'none',
            background: '#4299e1',
            color: 'white',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.target.style.background = '#3182ce'}
          onMouseOut={(e) => e.target.style.background = '#4299e1'}
        >
          View Queues
        </button>
      )}
    </div>
  );
  const cardData = [
    { title: "1. Patient Registration", icon: "👤", path: "/patient-registration" },
    { title: "2. Doctor assigning", icon: "👨‍⚕️", path: "/doctor-assigning" },
    // { title3 "5.2 Doctor assigning automatic", icon: "👨‍⚕️", path: "/doctor-assigning-automatic" },
    { title: "3. Vitals", icon: "💓", path: "/vitals", queueType: "vitals" },
    { title: "4. Doctor Counsaltation", icon: "👩‍⚕️", path: "/counsultation", queueType: "consultation" },
    { title: "5. Doctor Prescription", icon: "📝", path: "/doctor-prescription" },
    { title: "6. Stock Update", icon: "💊", path: "/medicine-pickup" },
    { title: "7. Counselling", icon: "🗣️", path: "/counselling" },
    { title: "8. Food", icon: "🍽️", path: "/food" },
    { title: "9. Search Patient", icon: "🔍", path: "/patient-search" },
    { title: "10. Patient Status", icon: "📋", path: "/patient-status" },
    // { title: "8. Lab", icon: "🔬", path: "/lab-tests" },
    // { title: "9. Patient Support", icon: "🤝", path:"/in-progress" },
    // { title: "10. Token Generation", icon: "🎟️", class:"in-progress" },
    // { title: "11. Patients Waiting", icon: "⏳", class:"in-progress" },
    // { title: "12. Doctor Assitance", icon: "👩‍⚕️", class:"in-progress" },
    // { title: "13. View Queues", icon: "📋", class: "in-progress" },
    // { title: "14. Medicine Delivery", icon: "🚚", class:"in-progress" },
  ];


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>

      <div className="dashboard-actions">
        {/* <button
          onClick={() => openScanner(handleDashboardScan)}
          className="dashboard-scan-btn-global"
          title="Scan QR Code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><g><rect fill="none" height="24" width="24" /></g><g><g><path d="M3,11h8V3H3V11z M5,5h4v4H5V5z" /><path d="M3,21h8v-8H3V21z M5,15h4v4H5V15z" /><path d="M13,3v8h8V3H13z M19,9h-4V5h4V9z" /><rect height="2" width="2" x="13" y="13" /><rect height="2" width="2" x="17" y="17" /><rect height="2" width="2" x="19" y="19" /><rect height="2" width="2" x="13" y="19" /><rect height="2" width="2" x="19" y="13" /><rect height="2" width="2" x="15" y="15" /><rect height="2" width="2" x="17" y="13" /><rect height="2" width="2" x="15" y="19" /></g></g></svg>
          Scan Book QR (Dashboard)
        </button> */}
        <Link to="/volunteer-manual" className="volunteer-manual-btn">
          Volunteer Manual
        </Link>
        {scannedBookNumber && (
          <p className="scanned-number-display">
            Scanned Book Number: {scannedBookNumber}
          </p>
        )}
      </div>
      <div className="dashboard-card-container">
        {cardData.map((card, index) => (
          <Link
            to={card.path}
            key={index}
            className={`dashboard-card-link ${card.class || ''}`}
            state={{ bookNumber: scannedBookNumber }} // Pass scanned book number to target page
          >
            <Card title={card.title} icon={card.icon} queueType={card.queueType} />
          </Link>
        ))}
      </div>
    </div >
  );
}

export default Dashboard;
