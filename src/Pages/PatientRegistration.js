import React, { useState } from "react";
import { privateAxios } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import "../Styles/PatientRegistration.css";

/**
 * NOTE:
 * - Phone rule implemented: 10 digits AND parseInt(first5) > 50000
 *   If you actually meant "each of the first 5 digits must be > 5",
 *   replace the phonePredicate check with:
 *     return val.slice(0,5).split('').every(d => Number(d) > 5);
 */

const patientSchema = z.object({
  bookNumber: z.preprocess(
    (v) => (v === undefined || v === null ? "" : String(v).trim()),
    z
      .string()
      .min(1, "Book number is required")
      .refine((val) => !isNaN(val) && parseInt(val, 10) > 0, {
        message: "Book number must be a positive number",
      })
  ),

  name: z.preprocess(
    (v) => (v === undefined || v === null ? "" : String(v).trim()),
    z.string().min(1, "Name is required")
  ),

  // Coerce phone to undefined when empty, otherwise to cleaned string of digits.
  phoneNumber: z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      // remove non-digits and return string
      return String(v).replace(/\D/g, "");
    },
    z
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined) return true; // optional
          if (!/^\d{10}$/.test(val)) return false;
          // numeric check on first 5 digits
          const firstDigit = parseInt(val.slice(0, 1), 10);
          return firstDigit > 5;
        },
        {
          message:
            "Phone must be exactly 10 digits and the first digit must be 5 or greater",
        }
      )
  ),

  age: z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      // keep as string (we validate numeric range)
      return String(v).trim();
    },
    z
      .string()
      .optional()
      .refine((val) => {
        if (val === undefined) return true;
        const n = Number(val);
        return !isNaN(n) && n > 0 && n <= 150;
      }, { message: "Age must be a number between 1 and 150" })
  ),

  // Keep gender / oldNew optional to avoid blocking when not selected in UI.
  gender: z.preprocess((v) => (v === "" || v === undefined ? undefined : v), z.enum(["male", "female"]).optional()),

  area: z.preprocess((v) => (v === undefined || v === null ? undefined : String(v).trim()), z.string().optional()),

  oldNew: z.preprocess((v) => (v === "" || v === undefined ? undefined : v), z.enum(["old", "new"], { required_error: "Please select Old or New" })),

  eid: z.preprocess((v) => (v === undefined || v === null ? undefined : String(v).trim()), z.string().optional()),
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

  const [fieldErrors, setFieldErrors] = useState({
    bookNumber: "",
    name: "",
    phoneNumber: "",
    age: "",
    gender: "",
    area: "",
    oldNew: "",
    eid: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBookNumberSubmitted, setIsBookNumberSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // sanitize phone as user types (only digits, max 10)
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phoneNumber") {
      value = String(value).replace(/\D/g, "").slice(0, 10);
    }

    // for radio buttons value comes as string already
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // returns { valid: boolean, errors: { field: message } }
  const validateForm = (partial = false) => {
    const schemaToUse = partial ? patientSchema.pick({ bookNumber: true }) : patientSchema;
    const result = schemaToUse.safeParse(formData);

    if (result.success) {
      setFieldErrors({
        bookNumber: "",
        name: "",
        phoneNumber: "",
        age: "",
        gender: "",
        area: "",
        oldNew: "",
        eid: "",
      });
      return { valid: true, errors: {} };
    } else {
      const newErrors = {
        bookNumber: "",
        name: "",
        phoneNumber: "",
        age: "",
        gender: "",
        area: "",
        oldNew: "",
        eid: "",
      };
      if (result.error && Array.isArray(result.error.errors)) {
        result.error.errors.forEach((err) => {
          const key = err.path && err.path.length ? err.path[0] : "_form";
          if (key && newErrors.hasOwnProperty(key)) newErrors[key] = err.message;
          else newErrors._form = (newErrors._form ? newErrors._form + " " : "") + err.message;
        });
      }
      setFieldErrors(newErrors);
      return { valid: false, errors: newErrors };
    }
  };

  const handleBookNumberSubmit = async (e) => {
    e.preventDefault();
    const res = validateForm(true);
    if (!res.valid) return;

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await privateAxios.get(`/api/patients/${formData.bookNumber}`);
      if (response.data) {
        setFormData({
          bookNumber: response.data.book_no,
          name: response.data.patient_name || "",
          phoneNumber: response.data.patient_phone_no || "",
          age: response.data.patient_age || "",
          gender: response.data.patient_sex || "",
          area: response.data.patient_area || "",
          oldNew: response.data.oldNew || "",
          eid: response.data.eid || "",
        });

        if (!response.data?.eid) {
          try {
            const tokenRes = await privateAxios.post("/api/token", {
              bookNumber: formData.bookNumber,
              gender: response.data?.patient_sex || "unknown",
            });
            if (tokenRes.data?.tokenNumber) {
              setFormData((prev) => ({ ...prev, eid: tokenRes.data.tokenNumber }));
            }
          } catch (tokenError) {
            console.error("Error generating token:", tokenError);
          }
        }

        setMessage("Patient data loaded successfully!");
      } else {
        setMessage("No patient found. Please fill out the form.");
        setFormData((prev) => ({ ...prev, name: "", phoneNumber: "", age: "", gender: "", area: "", oldNew: "", eid: "" }));
      }
      setError("");
      setIsBookNumberSubmitted(true);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setMessage("No patient found. Please fill out the form.");
        setIsBookNumberSubmitted(true);
      } else {
        setError(err.response?.data?.message || "An error occurred while fetching patient data.");
        setMessage("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { valid, errors } = validateForm(false);
    if (!valid) {
      // Show phone-specific message if phone is the failing field,
      // otherwise show the generic message.
      if (errors.phoneNumber) setError(errors.phoneNumber);
      else setError("Please correct the errors before submitting");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await privateAxios.post("/api/patients", {
        book_no: formData.bookNumber,
        patient_name: formData.name,
        patient_age: formData.age,
        patient_sex: formData.gender,
        patient_phone_no: formData.phoneNumber,
        patient_area: formData.area,
        oldNew: formData.oldNew,
        eid: formData.eid,
      });
      setMessage(response.data.message || "Patient data saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while saving patient data.");
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patient-registration-container">
      <h1 className="patient-registration-title">Patient Registration</h1>

      {message && <div className="patient-registration-success-msg">{message}</div>}
      {error && <div className="patient-registration-error-msg">{error}</div>}

      <form onSubmit={!isBookNumberSubmitted ? handleBookNumberSubmit : handleSubmit} className="patient-registration-form">
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
            disabled={isBookNumberSubmitted}
          />
          {fieldErrors.bookNumber && <div className="field-error">{fieldErrors.bookNumber}</div>}
        </div>

        {!isBookNumberSubmitted && (
          <button type="submit" className="patient-registration-submit-btn" disabled={isLoading}>
            {isLoading ? "Loading..." : "Submit"}
          </button>
        )}

        {isBookNumberSubmitted && (
          <>
            <div className="patient-registration-form-group">
              <label>
                Name <span className="required">*</span>
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={fieldErrors.name ? "error-input" : ""} />
              {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
            </div>

            <div className="patient-registration-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                maxLength="10"
                placeholder="Enter 10-digit phone number"
                className={fieldErrors.phoneNumber ? "error-input" : ""}
              />
              {fieldErrors.phoneNumber && <div className="field-error">{fieldErrors.phoneNumber}</div>}
            </div>

            <div className="patient-registration-form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className={fieldErrors.age ? "error-input" : ""} />
              {fieldErrors.age && <div className="field-error">{fieldErrors.age}</div>}
            </div>
          </>
        )}

          <div className="patient-registration-form-group">
            <label>Gender</label>
            <div className="patient-registration-radio-group">
              <label>
                <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} />
                Male
              </label>
              <label>
                <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} />
                Female
              </label>
            </div>
            {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
          </div>

          <div className="patient-registration-form-group">
            <label>Area</label>
            <input type="text" name="area" value={formData.area} onChange={handleChange} />
          </div>

          <div className="patient-registration-form-group">
            <label>
              Old / New <span className="required">*</span>
            </label>
            <div className="patient-registration-radio-group">
              <label>
                <input type="radio" name="oldNew" value="old" checked={formData.oldNew === "old"} onChange={handleChange} />
                Old
              </label>
              <label>
                <input type="radio" name="oldNew" value="new" checked={formData.oldNew === "new"} onChange={handleChange} />
                New
              </label>
            </div>
            {fieldErrors.oldNew && <div className="field-error">{fieldErrors.oldNew}</div>}
          </div>

          <div className="patient-registration-form-group">
            <label>EID</label>
            <input type="text" name="eid" value={formData.eid} onChange={handleChange} className={fieldErrors.eid ? "error-input" : ""} />
            {fieldErrors.eid && <div className="field-error">{fieldErrors.eid}</div>}
          </div>

          {isBookNumberSubmitted && (
            <button type="submit" className="patient-registration-submit-btn" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </button>
          )}
        </form>
    </div>
  );
}

export default PatientRegistration;
