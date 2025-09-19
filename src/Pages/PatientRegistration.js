import React, { useState } from "react";
import { privateAxios } from "../api/axios";
import { z } from "zod";
import "../Styles/PatientRegistration.css";

// ✅ Zod schema with coercion to handle number inputs
const patientSchema = z.object({
  bookNumber: z.coerce.string().min(1, "Book number is required"),
  name: z.string().min(1, "Name is required"),
  phoneNumber: z
    .coerce.string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits")
    .regex(/^[6-9]\d{9}$/, "Phone number must start with 6-9 and be 10 digits"),
  age: z
    .coerce.string()
    .min(1, "Age is required")
    .refine((val) => Number(val) > 0 && Number(val) <= 120, "Enter a valid age"),
  gender: z.enum(["male", "female"], "Please select gender"),
  area: z.string().min(1, "Area is required"),
  oldNew: z.enum(["old", "new"], "Please select old/new"),
  eid: z.string().optional(),
});

function PatientRegistration() {
  const [formData, setFormData] = useState({
    bookNumber: "",
    name: "",
    phoneNumber: "",
    age: "",
    gender: "",
    area: "",
    oldNew: "",
    eid: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict phone number to digits only and max length 10
    if (name === "phoneNumber") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Zod validation
  const validateFields = () => {
    const result = patientSchema.safeParse(formData);
    if (!result.success) {
      const errors = {};
      result.error.issues.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  // Step 1: Fetch patient by book number
  const handleBookNumberSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookNumber) {
      setFieldErrors({ bookNumber: "Book number is required" });
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await privateAxios.get(`/api/patients/${formData.bookNumber}`);

      if (response.data) {
        setFormData({
          bookNumber: response.data.book_no || formData.bookNumber,
          name: response.data.patient_name || "",
          phoneNumber: response.data.patient_phone_no || "",
          age: response.data.patient_age || "",
          gender: response.data.patient_sex || "",
          area: response.data.patient_area || "",
          oldNew: response.data.oldNew || "",
          eid: response.data.eid || "",
        });
        setMessage("Patient data loaded successfully!");
      } else {
        setMessage("No patient found. Please fill in details manually.");
        setFormData((prev) => ({
          ...prev,
          name: "",
          phoneNumber: "",
          age: "",
          gender: "",
          area: "",
          oldNew: "",
          eid: "",
        }));
      }

      setShowFullForm(true);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "An error occurred while fetching patient data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Full form submit
  const handleFullFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const payload = {
        book_no: formData.bookNumber,
        patient_name: formData.name,
        patient_age: formData.age,
        patient_sex: formData.gender,
        patient_phone_no: formData.phoneNumber,
        patient_area: formData.area,
        oldNew: formData.oldNew,
        eid: formData.eid,
      };

      const response = await privateAxios.post("/api/patients", payload);

      setMessage(response.data?.message || "✅ Patient data saved successfully!");
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "❌ Failed to save patient data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patient-registration-container">
      <h1 className="patient-registration-title">Patient Registration</h1>

      {message && <div className="patient-registration-success-msg">{message}</div>}
      {error && <div className="patient-registration-error-msg">{error}</div>}

      {/* STEP 1: Book Number */}
      {!showFullForm && (
        <form onSubmit={handleBookNumberSubmit} className="patient-registration-form">
          <div className="patient-registration-form-group">
            <label>
              Book Number <span className="required">*</span>
            </label>
            <input
              type="number"
              name="bookNumber"
              value={formData.bookNumber}
              onChange={handleChange}
              className={fieldErrors.bookNumber ? "error-input" : ""}
              placeholder="Enter patient book number"
            />
            {fieldErrors.bookNumber && <div className="field-error">{fieldErrors.bookNumber}</div>}
          </div>

          <button type="submit" className="patient-registration-submit-btn" disabled={isLoading}>
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
      )}

      {/* STEP 2: Full Form */}
      {showFullForm && (
        <form onSubmit={handleFullFormSubmit} className="patient-registration-form">
          {/* Book Number */}
          <div className="patient-registration-form-group">
            <label>Book Number</label>
            <input type="text" name="bookNumber" value={formData.bookNumber} readOnly />
          </div>

          {/* Name */}
          <div className="patient-registration-form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient name"
              className={fieldErrors.name ? "error-input" : ""}
            />
            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
          </div>

          {/* Phone Number */}
          <div className="patient-registration-form-group">
            <label>Phone Number</label>
            <input
              type="number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className={fieldErrors.phoneNumber ? "error-input" : ""}
            />
            {fieldErrors.phoneNumber && <div className="field-error">{fieldErrors.phoneNumber}</div>}
          </div>

          {/* Age */}
          <div className="patient-registration-form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
              className={fieldErrors.age ? "error-input" : ""}
            />
            {fieldErrors.age && <div className="field-error">{fieldErrors.age}</div>}
          </div>

          {/* Gender */}
          <div className="patient-registration-form-group">
            <label>Gender</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                />
                Female
              </label>
            </div>
            {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
          </div>

          {/* Area */}
          <div className="patient-registration-form-group">
            <label>Area</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Enter area"
              className={fieldErrors.area ? "error-input" : ""}
            />
            {fieldErrors.area && <div className="field-error">{fieldErrors.area}</div>}
          </div>

          {/* Old/New */}
          <div className="patient-registration-form-group">
            <label>Old/New</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="oldNew"
                  value="old"
                  checked={formData.oldNew === "old"}
                  onChange={handleChange}
                />
                Old
              </label>
              <label>
                <input
                  type="radio"
                  name="oldNew"
                  value="new"
                  checked={formData.oldNew === "new"}
                  onChange={handleChange}
                />
                New
              </label>
            </div>
            {fieldErrors.oldNew && <div className="field-error">{fieldErrors.oldNew}</div>}
          </div>

          {/* EID (now editable) */}
          <div className="patient-registration-form-group">
            <label>EID</label>
            <input
              type="text"
              name="eid"
              value={formData.eid}
              onChange={handleChange}
              placeholder="Enter EID"
            />
            {fieldErrors.eid && <div className="field-error">{fieldErrors.eid}</div>}
          </div>

          <button type="submit" className="patient-registration-submit-btn" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Patient"}
          </button>
        </form>
      )}
    </div>
  );
}

export default PatientRegistration;
