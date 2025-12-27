// Data service for Camp Analytics
import { privateAxios } from './axios';

// Fetch all data for analytics
export const fetchCampAnalyticsData = async (month) => {
  const monthParam = month && month !== 'All' ? `?month=${month}` : '';
  
  const [patientsRes, doctorsRes, medicinesRes, volunteersRes, patientHistoriesRes] = await Promise.all([
    privateAxios.get(`/api/admin/get_patients${monthParam}`),
    privateAxios.get(`/api/admin/get_doctors${monthParam}`),
    privateAxios.get('/api/admin/get_medicines'), // Medicines are not month-specific
    privateAxios.get('/api/admin/get_volunteers'),
    privateAxios.get(`/api/patient-history/summary${monthParam}`),
  ]);

  return {
    patients: patientsRes.data || [],
    doctors: doctorsRes.data || [],
    medicines: medicinesRes.data || [],
    volunteers: volunteersRes.data || [],
    patientHistories: patientHistoriesRes.data || [],
  };
};

// Fetch all data for filter options
export const fetchFilterOptionsData = async () => {
  const [allDoctorsRes, allPatientHistoriesRes] = await Promise.all([
    privateAxios.get('/api/admin/get_doctors'), // No month filter for options
    privateAxios.get('/api/patient-history/summary'), // No month filter for options
  ]);

  return {
    allDoctors: allDoctorsRes.data || [],
    allPatientHistories: allPatientHistoriesRes.data || [],
  };
};