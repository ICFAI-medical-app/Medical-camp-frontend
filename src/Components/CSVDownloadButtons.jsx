import React from 'react';

const CSVDownloadButtons = ({
  handleExportVolunteers,
  handleExportPatients,
  handleExportMedicineInventory,
  appliedFilters,
  filteredVolunteers,
  filteredPatients,
  medicines
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
      <button
        onClick={handleExportMedicineInventory}
        disabled={!appliedFilters.hasSubmitted || medicines.length === 0}
        aria-disabled={!appliedFilters.hasSubmitted || medicines.length === 0}
      >
        Download Medicine Inventory CSV
      </button>
    </div>
  );
};

export default CSVDownloadButtons;