import React, { useState, useEffect } from 'react'; // Import useEffect
import '../Styles/LabTests.css';
import { privateAxios } from '../api/axios'; // Import privateAxios

const LabTestsPage = () => {
  const labTests = [
    "CBP",
    "Creatinine",
    "ESR",
    "RBS",
    "FBS",
    "CRP",
    "TSH",
    "Thyroid Profile",
  ];

  const [selectedTests, setSelectedTests] = useState([]);
  const [bookNo, setBookNo] = useState(''); // Keep bookNo state for input field
  const [submissionMessage, setSubmissionMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' or 'error'
  const [prescriptionExists, setPrescriptionExists] = useState(false);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
  const [prescriptionStatusMessage, setPrescriptionStatusMessage] = useState('');
  const [prescriptionMessageTimeoutId, setPrescriptionMessageTimeoutId] = useState(null); // New state for timeout ID

  const handleCheckboxChange = (test) => {
    setSelectedTests((prevSelectedTests) =>
      prevSelectedTests.includes(test)
        ? prevSelectedTests.filter((t) => t !== test)
        : [...prevSelectedTests, test]
    );
  };

  const handleBookNoChange = (e) => {
    setBookNo(e.target.value);
    setPrescriptionExists(false); // Reset prescription status on bookNo change
    setPrescriptionStatusMessage('');
    if (prescriptionMessageTimeoutId) {
      clearTimeout(prescriptionMessageTimeoutId);
      setPrescriptionMessageTimeoutId(null);
    }
  };

  useEffect(() => {
    if (prescriptionMessageTimeoutId) {
      clearTimeout(prescriptionMessageTimeoutId);
      setPrescriptionMessageTimeoutId(null);
    }

    const checkPrescription = async () => {
      if (bookNo) {
        setIsLoadingPrescription(true);
        setPrescriptionStatusMessage('Checking for prescription...');
        try {
          const response = await privateAxios.get(`/api/patient-history/check-prescription/${bookNo}`);
          setPrescriptionExists(response.data.hasPrescription);
          setPrescriptionStatusMessage(response.data.message);
          const timeoutId = setTimeout(() => {
            setPrescriptionStatusMessage('');
          }, 10000);
          setPrescriptionMessageTimeoutId(timeoutId);
        } catch (error) {
          console.error('Error checking prescription:', error.response?.data || error.message);
          setPrescriptionExists(false);
          setPrescriptionStatusMessage(`Error checking prescription: ${error.response?.data?.message || error.message}`);
          const timeoutId = setTimeout(() => {
            setPrescriptionStatusMessage('');
          }, 10000);
          setPrescriptionMessageTimeoutId(timeoutId);
        } finally {
          setIsLoadingPrescription(false);
        }
      } else {
        setPrescriptionExists(false);
        setPrescriptionStatusMessage('');
      }
    };

    const handler = setTimeout(checkPrescription, 500); // Debounce API call
    return () => {
      clearTimeout(handler);
      if (prescriptionMessageTimeoutId) {
        clearTimeout(prescriptionMessageTimeoutId);
        setPrescriptionMessageTimeoutId(null);
      }
    };
  }, [bookNo]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setSubmissionMessage(null); // Clear previous messages
    setMessageType(null);

    if (!bookNo) {
      setSubmissionMessage('Please enter a Book No.');
      setMessageType('error');
      return;
    }
    if (!prescriptionExists) {
      setSubmissionMessage('A doctor\'s prescription is mandatory before submitting lab tests.');
      setMessageType('error');
      return;
    }
    if (selectedTests.length === 0) {
      setSubmissionMessage('Please select at least one lab test.');
      setMessageType('error');
      return;
    }

    if (!bookNo) {
      setSubmissionMessage('Please enter a Book No.');
      setMessageType('error');
      return;
    }
    if (selectedTests.length === 0) {
      setSubmissionMessage('Please select at least one lab test.');
      setMessageType('error');
      return;
    }

    try {
      const response = await privateAxios.post('/api/labtests', {
        book_no: bookNo, // Send as book_no
        labTests: selectedTests,
      });
      console.log('Lab test results submitted:', response.data);
      setSubmissionMessage(response.data.message); // Use the message from the backend
      setMessageType('success');
      // Optionally clear the form
      setBookNo('');
      setSelectedTests([]);

      // Clear the message after 10 seconds
      setTimeout(() => {
        setSubmissionMessage(null);
        setMessageType(null);
      }, 10000); // 10 seconds
    } catch (error) {
      console.error('Error submitting lab test results:', error.response?.data || error.message);
      setSubmissionMessage(`Failed to submit lab test records: ${error.response?.data?.message || error.message}`);
      setMessageType('error');

      // Clear the error message after 10 seconds
      setTimeout(() => {
        setSubmissionMessage(null);
        setMessageType(null);
      }, 10000); // 10 seconds
    }
  };

  return (
    <div className="lab-tests-container">
      <h2>Select Lab Tests</h2>
      <form onSubmit={handleSubmit}> {/* Add onSubmit handler */}
        {submissionMessage && (
          <div className={`submission-message ${messageType}`}>
            {submissionMessage}
          </div>
        )}
        <div className="book-no-input-group">
          <label htmlFor="bookNo">Book No:</label>
          <input
            type="text"
            id="bookNo"
            value={bookNo}
            onChange={handleBookNoChange}
            placeholder="Enter Book No"
          />
        </div>
        {isLoadingPrescription && <div className="prescription-status-message loading">Checking prescription...</div>}
        {!isLoadingPrescription && prescriptionStatusMessage && (
          <div className={`prescription-status-message ${prescriptionExists ? 'success' : 'error'}`}>
            {prescriptionStatusMessage}
          </div>
        )}
        {labTests.map((test, index) => (
          <div key={index} className="lab-test-item">
            <input
              type="checkbox"
              id={`test-${index}`}
              name={test}
              checked={selectedTests.includes(test)}
              onChange={() => handleCheckboxChange(test)}
            />
            <label htmlFor={`test-${index}`}>{test}</label>
          </div>
        ))}
        <button type="submit" className="submit-button" disabled={isLoadingPrescription || !prescriptionExists}>
          Submit Lab Tests
        </button>
      </form>
    </div>
  );
};

export default LabTestsPage;
