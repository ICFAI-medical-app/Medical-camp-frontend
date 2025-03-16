import React , { useState , useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ViewPatients() {
    const navigate = useNavigate();
    const [medicines , setMedicines] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5002/api/admin/get_medicines")
        .then((response) => {
            // console.log(response.data);
            setMedicines(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
    }
    , [])

    return (
        <div>
            <h1>View Medicines</h1>
            <div>
                {medicines.map((medicine, index) => (
                    <div className="card-link" key={index}>
                        <div>
                            <div className="card-icon">💊</div>
                            <div className="card-content">
                                <h3>Formulation: {medicine.medicine_formulation}</h3>
                                <p>{medicine.medicine_id}</p>
                                <p>Quantity: {medicine.total_quantity}</p>
                                <div>
                                    <h4>Details:</h4>
                                    {medicine.medicine_details.map((detail, index) => (
                                        <div key={index} >
                                            <p>{detail.medicine_name}</p>
                                            <p>
                                                Expiry Date: {detail.expiry_date}
                                            </p>
                                            <p>
                                                Quantity: {detail.quantity}
                                            </p>
                                        </div>     
                                    ))}

                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
                <div>
                    <button onClick={() => navigate("/")}>Back to Dashboard</button>
                </div>
        </div>
        
    )
}

export default ViewPatients;