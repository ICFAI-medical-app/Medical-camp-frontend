import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from 'axios';
import { privateAxios } from "../api/axios";
import "../Styles/Vitals.css";

function Vitals() {
  const VitalEmptyData = {
    bookNumber: "",
    bp: "",
    pulse: "",
    rbs: "",
    weight: "",
    age: "",
    height: "",
    extra_note: "",
  };
  const [formData, setFormData] = useState({
    ...VitalEmptyData,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bpError, setBpError] = useState(""); // Add state for BP validation error
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bp") {
      if (value) {
        const parts = value.split("/");
        if (
          parts.length !== 2 || // Ensure there are exactly two parts
          isNaN(Number(parts[0])) || // Ensure the first part is a number
          isNaN(Number(parts[1])) // Ensure the second part is a number
        ) {
          setBpError(
            "BP must be in the format systolic/diastolic (e.g., 120/80)"
          );
        } else {
          setBpError("");
        }
      } else {
        setBpError("");
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const PORT = process.env.PORT || 5002;

  const fetchVitals = async (e) => {
    console.log(e.target.value);
    setIsLoading(true);
    if (e.target.value !== "") {
      try {
        // const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/vitals`);
        const response = await privateAxios.get(
          `/api/vitals/${e.target.value}`
        );
        setFormData({
          ...response.data,
          bookNumber: e.target.value,
        }); // Set book number in form data

        console.log(response.data)

        setMessage("Vitals fetched successfully!");
        setError("");
      } catch (error) {
        VitalEmptyData.bookNumber = e.target.value; // Set book number in case of error
        setFormData(VitalEmptyData);
        setError(
          error.response?.data?.message ||
            "An error occurred while fetching vitals"
        );
        setMessage("");
      } finally {
        setIsLoading(false);
      }
    } else {
      setFormData(VitalEmptyData);
      setMessage("");
      setError("");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.age && Number(formData.age) < 18) {
      setError("Patient must be 18 years or older for vitals entry");
      return;
    }
    setIsLoading(true);
    try {
      const response = await privateAxios.post("/api/vitals", {
        book_no: formData.bookNumber,
        rbs: formData.rbs || null,
        bp: formData.bp || null,
        height: formData.height || null,
        weight: formData.weight || null,
        age: formData.age || null,
        pulse: formData.pulse || null,
        extra_note: formData.extra_note || null,
      });
      setMessage(response.data.message || "Vitals recorded successfully!");
      setError("");
      setFormData({
        bookNumber: "",
        bp: "",
        pulse: "",
        rbs: "",
        weight: "",
        height: "",
        extra_note: "",
      });
      window.scrollTo(0, 0);
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
      setMessage("");
    } finally {
      setIsLoading(false); // Set loading back to false after submission
    }
  };

  return (
    <div className="vitals-container">
      <h1 className="vitals-title">Vitals</h1>
      {message && <div className="vitals-success-msg">{message}</div>}
      {error && <div className="vitals-error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="vitals-form">
        <div className="vitals-form-group">
          <label>Book Number</label>
          <input
            type="text"
            name="bookNumber"
            value={formData.bookNumber}
            autoComplete="off"
            onChange={(e) => {
              const regex = /^[0-9]+$/;
              if (regex.test(e.target.value) || e.target.value === "") {
                handleChange(e);
              } else {
                setError("enter valid book number");
              }
            }}
            onBlur={(e) => {
              if (formData.bookNumber) fetchVitals(e);
            }}
            required
          />
        </div>
        <div className="vitals-form-group">
          <label>BP (systolic/diastolic)</label>
          <input
            type="text"
            name="bp"
            value={formData.bp}
            onChange={(e) => {
              handleChange(e);
            }}
            autoComplete="off"
          />
        </div>
        <div className="vitals-form-group">
          <label>Pulse</label>
          <input
            type="text"
            name="pulse"
            value={formData.pulse}
            onChange={(e) => {
              const regex = /^[0-9]+$/;
              if (regex.test(e.target.value) || e.target.value === "") {
                handleChange(e);
              }
            }}
            autoComplete="off"
          />
        </div>
        <div className="vitals-form-group">
          <label>RBS</label>
          <input
            type="text"
            name="rbs"
            value={formData.rbs}
            onChange={(e) => {
              const regex = /^[0-9]+$/;
              if (regex.test(e.target.value) || e.target.value === "") {
                handleChange(e);
              }
            }}
            autoComplete="off"
          />
        </div>
        <div className="vitals-form-group">
          <label>Weight (kg)</label>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={(e) => {
              const regex = /^[0-9]+$/;
              if (regex.test(e.target.value) || e.target.value === "") {
                handleChange(e);
              }
            }}
            autoComplete="off"
          />
        </div>
        <div className="vitals-form-group">
          <label>Age</label>
          <input
            type="text"
            name="age"
            value={formData.age}
            onChange={(e) => {
              const regex = /^[0-9]+$/;
              if (regex.test(e.target.value) || e.target.value === "") {
                handleChange(e);
              }
            }}
            autoComplete="off"
          />
        </div>

        <div className="vitals-form-group">
          <label>Height (cm)</label>
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={(e) => {
              const regex = /^[0-9]+$/;
              if (regex.test(e.target.value) || e.target.value === "") {
                handleChange(e);
              }
            }}
            autoComplete="off"
          />
        </div>
        <div className="vitals-form-group">
          <label>Last Meal and Time</label>
          <input
            type="text"
            name="extra_note"
            value={formData.extra_note}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="vitals-submit-btn"
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? "Submitting..." : "Submit"} {/* Show loading text */}
        </button>
      </form>
    </div>
  );
}

export default Vitals;
