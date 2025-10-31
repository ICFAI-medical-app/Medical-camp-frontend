import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { privateAxios } from '../api/axios';
import { z } from 'zod';
import '../Styles/Vitals.css';

const vitalsSchema = z.object({
  bookNumber: z.string()
    .regex(/^[0-9]+$/, { message: 'Book Number must contain only digits' })
    .optional()
    .or(z.literal('')),
  bloodPressure: z.union([
    z.string().length(0),
    z.string().regex(
      /^(\d{2,3})\/(\d{2,3})$/,
      { message: 'Blood Pressure must be in format "120/80"' }
    )
  ]),
  pulse: z.union([
    z.string().length(0),
    z.preprocess(val => (val === '' ? undefined : Number(val)),
      z.number()
        .min(30, { message: 'Enter a value between 30 and 220 bpm for pulse' })
        .max(220, { message: 'Enter a value between 30 and 220 bpm for pulse' })
    )
  ]),
  rbs: z.union([
    z.string().length(0),
    z.preprocess(val => (val === '' ? undefined : Number(val)),
      z.number()
        .min(40, { message: 'Enter a value between 40 and 600 mg/dL for RBS' })
        .max(600, { message: 'Enter a value between 40 and 600 mg/dL for RBS' })
    )
  ]),
  weight: z.union([
    z.string().length(0),
    z.preprocess(val => (val === '' ? undefined : Number(val)),
      z.number()
        .min(2, { message: 'Enter a value between 2 and 300 kg for weight' })
        .max(300, { message: 'Enter a value between 2 and 300 kg for weight' })
    )
  ]),
  height: z.union([
    z.string().length(0),
    z.preprocess(val => (val === '' ? undefined : Number(val)),
      z.number()
        .min(30, { message: 'Enter a value between 30 and 250 cm for height' })
        .max(250, { message: 'Enter a value between 30 and 250 cm for height' })
    )
  ]),
  extra_note: z.string().optional(),
});

function Vitals() {
  const VitalEmptyData = {
    bookNumber: '',
    bloodPressure: '',
    pulse: '',
    rbs: '',
    weight: '',
    height: '',
    extra_note: '',
  };

  const [formData, setFormData] = useState({ ...VitalEmptyData });
  const [message, setMessage] = useState(''); // Reintroduce message state for success messages
  const [error, setError] = useState(''); // Reintroduce error state for general errors
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Effect to clear general messages after a few seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const validateForm = (data) => {
    const parsed = vitalsSchema.safeParse(data);
    if (!parsed.success) {
      const errors = {};
      for (const issue of parsed.error.issues) {
        errors[issue.path[0]] = issue.message;
      }
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    validateForm(updatedData);
  };

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const fetchVitals = async (value) => {
    setMessage(''); // Clear previous messages
    setError(''); // Clear previous errors
    setValidationErrors({}); // Clear previous validation errors
    setIsLoading(true);
    if (value !== '') {
      try {
        const response = await privateAxios.get(`/api/vitals/${value}`);
        // Expecting either systolic/diastolic (old) or combined format.
        let bp = '';
        if (response.data.systolic && response.data.diastolic) {
          bp = `${response.data.systolic}/${response.data.diastolic}`;
        } else if (response.data.bloodPressure) {
          bp = response.data.bloodPressure;
        }
        setFormData({ ...VitalEmptyData, ...response.data, bloodPressure: bp, bookNumber: value });
        setMessage('Vitals fetched successfully!');
      } catch (err) {
        if (err.response?.status === 404) {
          setFormData({ ...VitalEmptyData, bookNumber: value });
          setMessage('No vitals found for this patient for the current month. Please enter new vitals.');
        } else {
          setFormData({ ...VitalEmptyData, bookNumber: value });
          setError(err.response?.data?.message || 'An error occurred while fetching vitals');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setFormData(VitalEmptyData);
      setMessage('');
      setError('');
      setValidationErrors({});
    }
  };

  const debouncedFetchVitals = useCallback(
    debounce((value) => fetchVitals(value), 500),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setError(''); // Clear previous errors
    setValidationErrors({}); // Clear previous validation errors
    if (!validateForm(formData)) {
      setError('Please correct the highlighted errors before submitting.');
      window.scrollTo(0, 0);
      return;
    }
    setIsLoading(true);
    try {
      // Split blood pressure before sending
      let systolic = null;
      let diastolic = null;
      if (formData.bloodPressure && formData.bloodPressure.includes('/')) {
        const [sys, dia] = formData.bloodPressure.split('/');
        systolic = sys;
        diastolic = dia;
      }
      const response = await privateAxios.post('/api/vitals', {
        book_no: formData.bookNumber,
        systolic: systolic,
        diastolic: diastolic,
        pulse: formData.pulse || null,
        rbs: formData.rbs || null,
        weight: formData.weight || null,
        height: formData.height || null,
        extra_note: formData.extra_note || null,
      });
      setMessage(response.data.message || 'Vitals recorded successfully!');
      setFormData({ ...VitalEmptyData });
      setValidationErrors({}); // Clear validation errors on successful submission
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
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
            placeholder="Digits only"
            value={formData.bookNumber}
            autoComplete="off"
            className={validationErrors.bookNumber ? 'error-input' : ''}
            onChange={(e) => {
              handleChange(e);
              debouncedFetchVitals(e.target.value);
            }}
            required
          />
          {validationErrors.bookNumber && <div className="vitals-error-msg">{validationErrors.bookNumber}</div>}
        </div>
        <div className="vitals-form-group">
          <label>Blood Pressure (mmHg)</label>
          <input
            type="text"
            name="bloodPressure"
            placeholder="e.g. 120/80"
            value={formData.bloodPressure}
            className={validationErrors.bloodPressure ? 'error-input' : ''}
            onChange={handleChange}
          />
          {validationErrors.bloodPressure && (
            <div className="vitals-error-msg">{validationErrors.bloodPressure}</div>
          )}
        </div>
        <div className="vitals-form-group">
          <label>Pulse (bpm)</label>
          <input
            type="number"
            name="pulse"
            placeholder="30–220 bpm"
            value={formData.pulse}
            autoComplete="off"
            className={validationErrors.pulse ? 'error-input' : ''}
            onChange={handleChange}
          />
          {validationErrors.pulse && <div className="vitals-error-msg">{validationErrors.pulse}</div>}
        </div>
        <div className="vitals-form-group">
          <label>RBS (mg/dL)</label>
          <input
            type="number"
            name="rbs"
            placeholder="40–600 mg/dL"
            value={formData.rbs}
            autoComplete="off"
            className={validationErrors.rbs ? 'error-input' : ''}
            onChange={handleChange}
          />
          {validationErrors.rbs && <div className="vitals-error-msg">{validationErrors.rbs}</div>}
        </div>
        <div className="vitals-form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            placeholder="2–300 kg"
            value={formData.weight}
            autoComplete="off"
            className={validationErrors.weight ? 'error-input' : ''}
            onChange={handleChange}
          />
          {validationErrors.weight && <div className="vitals-error-msg">{validationErrors.weight}</div>}
        </div>
        <div className="vitals-form-group">
          <label>Height (cm)</label>
          <input
            type="number"
            name="height"
            placeholder="30–250 cm"
            value={formData.height}
            autoComplete="off"
            className={validationErrors.height ? 'error-input' : ''}
            onChange={handleChange}
          />
          {validationErrors.height && <div className="vitals-error-msg">{validationErrors.height}</div>}
        </div>
        <div className="vitals-form-group">
          <label>Last Meal and Time</label>
          <input
            type="text"
            name="extra_note"
            value={formData.extra_note}
            autoComplete="off"
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="vitals-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default Vitals;
