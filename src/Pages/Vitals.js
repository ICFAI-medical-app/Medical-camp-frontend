import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { privateAxios } from '../api/axios';
import { vitalsSchema } from '../schemas/vitalsSchema';
import { toast } from 'react-toastify';
import { z } from 'zod';
import '../Styles/Vitals.css';

function Vitals() {
  const VitalEmptyData = {
    bookNumber: '',
    bp: '',
    pulse: '',
    rbs: '',
    weight: '',
    height: '',
    extra_note: ''
  }
  const [formData, setFormData] = useState({
    ...VitalEmptyData
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    const isNumeric = /^[0-9]*$/;
    const isDecimal = /^[0-9]*\.?[0-9]*$/;
    const isBp = /^[0-9/]*$/;

    if (name === 'pulse' || name === 'rbs') {
      if (isNumeric.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'height' || name === 'weight') {
      if (isDecimal.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'bp') {
      if (isBp.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const debounce = (func, delay) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, delay);
    };
  };

  const fetchVitals = async (value) =>{
    if(value !== ''){
      try {
      const response = await privateAxios.get(`/api/vitals/${value}`);
      const fetchedData = response.data;
      const sanitizedData = {
        bookNumber: value,
        bp: fetchedData.bp || '',
        pulse: fetchedData.pulse?.toString() || '',
        rbs: fetchedData.rbs?.toString() || '',
        weight: fetchedData.weight?.toString() || '',
        height: fetchedData.height?.toString() || '',
        extra_note: fetchedData.extra_note || ''
      };
      setFormData(sanitizedData);
      toast.success('Vitals fetched successfully!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setFormData({ ...VitalEmptyData, bookNumber: value });
        toast.info('No vitals found for this patient for the current month. Please enter new vitals.');
      } else {
        setFormData({ ...VitalEmptyData, bookNumber: value });
        toast.error(error.response?.data?.message || 'An error occurred while fetching vitals');
      }
    }
    } else {
      setFormData(VitalEmptyData);
    }
  }

  const debouncedFetchVitals = useCallback(
    debounce((value) => fetchVitals(value), 500),
    []
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      vitalsSchema.parse(formData);

      const response = await privateAxios.post('/api/vitals', {
        book_no: formData.bookNumber,
        rbs: formData.rbs || null,
        bp: formData.bp || null,
        height: formData.height || null,
        weight: formData.weight || null,
        pulse: formData.pulse || null,
        extra_note: formData.extra_note || null,
      });

      toast.success(response.data.message || 'Vitals recorded successfully!');
      setFormData(VitalEmptyData);
      window.scrollTo(0, 0);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while submitting vitals.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vitals-container">
      <h1 className="vitals-title">Vitals</h1>
      <form onSubmit={handleSubmit} className="vitals-form">
        <div className="vitals-form-group">
          <label>Book Number</label>
          <input
            type="text"
            name="bookNumber"
            value={formData.bookNumber}
            autoComplete="off"
            onChange={(e) => {
              handleChange(e);
              debouncedFetchVitals(e.target.value);
            }}
            required
          />
        </div>
        <div className="vitals-form-group">
          <label>BP (systolic/diastolic)</label>
          <input type="text" name="bp" value={formData.bp} onChange={handleChange} autoComplete="off" />
        </div>
        <div className="vitals-form-group">
          <label>Pulse</label>
          <input type="text" name="pulse" value={formData.pulse} onChange={handleChange} autoComplete="off" />
        </div>
        <div className="vitals-form-group">
          <label>RBS</label>
          <input type="text" name="rbs" value={formData.rbs} onChange={handleChange} autoComplete="off" />
        </div>
        <div className="vitals-form-group">
          <label>Weight (kg)</label>
          <input type="text" name="weight" value={formData.weight} onChange={handleChange} autoComplete="off" />
        </div>
        <div className="vitals-form-group">
          <label>Height (cm)</label>
          <input type="text" name="height" value={formData.height} onChange={handleChange} autoComplete="off" />
        </div>
        <div className="vitals-form-group">
          <label>Last Meal and Time</label>
          <input type="text" name="extra_note" value={formData.extra_note} onChange={handleChange} autoComplete='off' />
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
