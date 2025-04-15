import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children , required_type}) => {
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');

    if (!authToken) {
        return <Navigate to="/" replace />;
    }

    if (required_type && userType !== required_type) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;