import React from 'react';

const CSVDownloadButtons = ({
  handleExportVolunteers,
  handleExportPatients,
  appliedFilters,
  filteredVolunteers,
  filteredPatients
}) => {
  return (
    <div className="csv-buttons">
      <button
        onClick={handleExportVolunteers}
        disabled={!appliedFilters.hasSubmitted || filteredVolunteers.length === 0}
        aria-disabled={!appliedFilters.hasSubmitted || filteredVolunteers.length === 0}
      >
        Download Volunteers CSV
      </button>
      <button
        onClick={handleExportPatients}
        disabled={!appliedFilters.hasSubmitted || filteredPatients.length === 0}
        aria-disabled={!appliedFilters.hasSubmitted || filteredPatients.length === 0}
      >
        Download Patients CSV
      </button>
    </div>
  );
};

export default CSVDownloadButtons;