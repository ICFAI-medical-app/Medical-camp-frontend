
import React, { useState, useEffect } from "react";
import { privateAxios } from "../api/axios";
import '../Styles/DownloadQRCodes.css';

function DownloadQRCodes() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        privateAxios
            .get("/api/admin/get_patients")
            .then((response) => {
                setPatients(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="loading-container">Loading patients...</div>;
    }

    return (
        <div className="download-qr-container">
            <div className="no-print header-actions">
                <h1>Download Patient QR Codes</h1>
                <button onClick={handlePrint} className="print-all-btn">
                    Print / Save as PDF
                </button>
            </div>

            <div className="qr-grid">
                {patients.map((patient) => (
                    <div key={patient._id} className="qr-card">
                        <div className="qr-image-container">
                            {patient.qr ? (
                                <img src={patient.qr} alt={`QR for ${patient.book_no}`} />
                            ) : (
                                <div className="no-qr">No QR</div>
                            )}
                        </div>
                        <div className="qr-details">
                            <h3 className="qr-book-no">{patient.book_no}</h3>
                            <p className="qr-name">{patient.patient_name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DownloadQRCodes;
