// src/Pages/CampAnalytics.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { privateAxios } from '../api/axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { format } from 'date-fns';
import { unparse } from 'papaparse';
import '../Styles/CampAnalytics.css';

const TableView = ({ data, columns }) => (
  <div className="table-responsive">
    <table>
      <thead>
        <tr>
          {columns.map(col => <th key={col.key}>{col.title}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CampAnalytics = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [patientHistories, setPatientHistories] = useState([]);
  const [allPatientHistoriesForMonths, setAllPatientHistoriesForMonths] = useState([]);
  const [allDoctorsForMonths, setAllDoctorsForMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('graph');

  const navigate = useNavigate();
  const location = useLocation();

  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCamp, setSelectedCamp] = useState('All');

  const [appliedFilters, setAppliedFilters] = useState({
    month: 'All',
    camp: 'All',
    hasSubmitted: true, // Changed to true to display data on initial load
  });

  // On initial load, sync from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const month = queryParams.get('month') || 'All';
    const camp = queryParams.get('camp') || 'All';

    if (month !== 'All' || camp !== 'All') {
      setSelectedMonth(month);
      setSelectedCamp(camp);
      setAppliedFilters({ month, camp, hasSubmitted: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Sync URL with applied filters
  useEffect(() => {
    if (!appliedFilters.hasSubmitted) return;
    const params = new URLSearchParams();
    if (appliedFilters.month !== 'All') params.set('month', appliedFilters.month);
    if (appliedFilters.camp !== 'All') params.set('camp', appliedFilters.camp);
    navigate({ search: params.toString() }, { replace: true });
  }, [appliedFilters, navigate]);

  // Build unique, sorted options for filters (from all data)
  const { monthOptions, doctorOptions, campOptions } = useMemo(() => {
    const monthSet = new Set();
    const campSet = new Set();
    const doctorSet = new Set();

    // Use allPatientHistoriesForMonths to get all available months
    allPatientHistoriesForMonths.forEach(history => {
      history.visits.forEach(visit => {
        if (visit?.timestamp) monthSet.add(visit.timestamp);
      });
    });

    // Use allDoctorsForMonths to get all available doctors
    allDoctorsForMonths.forEach(d => {
      if (d?.doctor_name) doctorSet.add(d.doctor_name);
    });

    // Camp options are still derived from the currently filtered patients,
    // as camp is a patient-specific attribute and not directly tied to visits/doctors in the same way.
    // If camp filtering is also to be "all-encompassing" for options, it would need a separate fetch as well.
    patients.forEach(p => {
      if (p?.camp) campSet.add(p.camp);
    });

    const months = ['All', ...Array.from(monthSet).sort((a, b) => a.localeCompare(b))];
    const camps = ['All', ...Array.from(campSet).sort((a, b) => a.localeCompare(b))];
    const drs = ['All', ...Array.from(doctorSet).sort((a, b) => a.localeCompare(b))];

    console.log('Generated month options:', months);
    console.log('Generated camp options:', camps);
    console.log('Generated doctor options:', drs);

    return { monthOptions: months, doctorOptions: drs, campOptions: camps };
  }, [allPatientHistoriesForMonths, allDoctorsForMonths, patients]); // Depend on all data for options

  // Validate current selections against available options
  useEffect(() => {
    if (!monthOptions.includes(selectedMonth)) setSelectedMonth('All');
    if (!campOptions.includes(selectedCamp)) setSelectedCamp('All');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOptions, campOptions]);

  // Apply filters
  const filteredPatients = useMemo(() => {
    const { month, camp } = appliedFilters;
    if (!appliedFilters.hasSubmitted) return [];

    console.log('Filtering patients with:', { month, camp }); // Debug log
    console.log('Patients before filtering:', patients); // Debug log
    console.log('Patient Histories for filtering:', patientHistories); // Debug log

    const filtered = patients.filter(p => {
      // Month match: Check patient's createdAt OR patient's history visits
      const monthMatch =
        month === 'All' ||
        (p.createdAt && format(new Date(p.createdAt), 'yyyy-MM') === month) ||
        (patientHistories.some(history =>
          history.book_no === p.book_no &&
          history.visits.some(visit => visit.timestamp === month)
        ));

      const campMatch =
        camp === 'All' ||
        (p.camp && p.camp === camp);

      return monthMatch && campMatch;
    });
    console.log('Patients after filtering:', filtered); // Debug log
    return filtered;
  }, [patients, appliedFilters, patientHistories]);

  // Charts/tables data (keep hooks above any return)
  const genderData = useMemo(() => {
    const maleCount = filteredPatients.filter(p => p.patient_sex && p.patient_sex.toLowerCase() === 'male').length;
    const femaleCount = filteredPatients.filter(p => p.patient_sex && p.patient_sex.toLowerCase() === 'female').length;
    const otherCount = filteredPatients.filter(p => p.patient_sex && p.patient_sex.toLowerCase() === 'other').length;

    return [
      { name: 'Male', value: maleCount },
      { name: 'Female', value: femaleCount },
    ];
  }, [filteredPatients]);


  const doctorPatientData = useMemo(() => {
    const doctorVisitCounts = new Map();

    patientHistories.forEach(history => {
      history.visits.forEach(visit => {
        if (visit.doctor_id) {
          doctorVisitCounts.set(visit.doctor_id, (doctorVisitCounts.get(visit.doctor_id) || 0) + 1);
        }
      });
    });

    const data = Array.from(doctorVisitCounts.entries())
      .map(([doctorId, count]) => {
        // Match doctor_id from patient history visits with doctor.doctor_id (numeric ID)
        const doctor = allDoctorsForMonths.find(d => d.doctor_id === doctorId);
        return {
          name: doctor ? doctor.doctor_name : `Unknown Doctor (ID: ${doctorId})`,
          patients: count
        };
      })
      .filter(d => d.patients > 0);

    console.log('Doctor-Patient Ratio Data:', data); // Final debug log
    return data;
  }, [doctors, patientHistories]);

  const medicineDistributionData = useMemo(() => {
    const aggregatedMedicines = new Map();

    patientHistories.forEach(history => {
      history.visits.forEach(visit => {
        if (visit.medicines_given) {
          visit.medicines_given.forEach(givenMed => {
            const medId = givenMed.medicine_id;
            aggregatedMedicines.set(
              medId,
              (aggregatedMedicines.get(medId) || 0) + givenMed.quantity
            );
          });
        }
      });
    });

    const data = Array.from(aggregatedMedicines.entries()).map(([medicine_id, distributed_quantity]) => ({
      medicine_id,
      distributed_quantity,
    }));

    return data.sort((a, b) => a.medicine_id.localeCompare(b.medicine_id)); // Sort by medicine_id
  }, [patientHistories]);

  const averageVitals = useMemo(() => {
    const filteredPatientIds = new Set(filteredPatients.map(p => p._id));
    const relevantVitals = vitals.filter(v => filteredPatientIds.has(v.patientId));

    const sum = relevantVitals.reduce((a, v) => ({
      bp: a.bp + (v?.bp || 0),
      pulse: a.pulse + (v?.pulse || 0),
      weight: a.weight + (v?.weight || 0),
      temperature: a.temperature + (v?.temperature || 0),
    }), { bp: 0, pulse: 0, weight: 0, temperature: 0 });

    const count = relevantVitals.length;
    if (count === 0) return { bp: 0, pulse: 0, weight: 0, temperature: 0 };

    return {
      bp: sum.bp / count,
      pulse: sum.pulse / count,
      weight: sum.weight / count,
      temperature: sum.temperature / count,
    };
  }, [vitals, filteredPatients]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const handleSubmit = () => {
    setAppliedFilters({
      month: selectedMonth,
      camp: selectedCamp,
      hasSubmitted: true
    });
  };

  const handleReset = () => {
    setSelectedMonth('All');
    setSelectedCamp('All');
    setAppliedFilters({ month: 'All', camp: 'All', hasSubmitted: false });
    navigate({ search: '' }, { replace: true });
  };

  const handleExport = () => {
    const csv = unparse({
      fields: ['Metric', 'Value'],
      data: [
        ['Total Patients', filteredPatients.length],
        ['Total Doctors', doctors.length],
        ['Total Medicines', medicines.length],
        ['Average BP', averageVitals.bp.toFixed(2)],
        ['Average Pulse', averageVitals.pulse.toFixed(2)],
        ['Average Weight', averageVitals.weight.toFixed(2)],
        ['Average Temperature', averageVitals.temperature.toFixed(2)],
      ]
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'camp_summary.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMedicineDistribution = () => {
    const csv = unparse({
      fields: ['Medicine ID', 'Distributed Quantity'],
      data: medicineDistributionData.map(item => ({
        'Medicine ID': item.medicine_id,
        'Distributed Quantity': item.distributed_quantity,
      }))
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'medicine_distribution.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDoctorPatientRatio = () => {
    const csv = unparse({
      fields: ['Doctor', 'Patients Visited'],
      data: doctorPatientData.map(item => ({
        'Doctor': item.name,
        'Patients Visited': item.patients,
      }))
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'doctor_patient_ratio.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch all data for month/doctor options once on mount
  useEffect(() => {
    const fetchAllOptionsData = async () => {
      try {
        const [allDoctorsRes, allPatientHistoriesRes] = await Promise.all([
          privateAxios.get('/api/admin/get_doctors'), // No month filter for options
          privateAxios.get('/api/patient-history/summary'), // No month filter for options
        ]);
        setAllDoctorsForMonths(allDoctorsRes.data || []);
        setAllPatientHistoriesForMonths(allPatientHistoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching all data for options:', error);
      }
    };
    fetchAllOptionsData();
  }, []); // Run only once on mount

  // Fetch filtered data based on applied filters
  useEffect(() => {
    const fetchData = async () => {
      if (!appliedFilters.hasSubmitted) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const monthParam = appliedFilters.month !== 'All' ? `?month=${appliedFilters.month}` : '';

        const [patientsRes, doctorsRes, medicinesRes, vitalsRes, patientHistoriesRes] = await Promise.all([
          privateAxios.get(`/api/admin/get_patients${monthParam}`),
          privateAxios.get(`/api/admin/get_doctors${monthParam}`),
          privateAxios.get('/api/admin/get_medicines'), // Medicines are not month-specific
          privateAxios.get('/api/vitals'), // Vitals are not month-specific, filtered on frontend
          privateAxios.get(`/api/patient-history/summary${monthParam}`),
        ]);
        setPatients(patientsRes.data || []);
        setDoctors(doctorsRes.data || []);
        setMedicines(medicinesRes.data || []);
        setVitals(vitalsRes.data || []);
        setPatientHistories(patientHistoriesRes.data || []);
        
        console.log('Fetched Patients:', patientsRes.data);
        console.log('Fetched Doctors:', doctorsRes.data);
        console.log('Fetched Medicines:', medicinesRes.data);
        console.log('Fetched Vitals:', vitalsRes.data);
        console.log('Fetched Patient Histories:', patientHistoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appliedFilters]); // Re-run when appliedFilters change

  return (
    <div className="analytics-container">
      <h1>Camp Analytics Dashboard</h1>

      {/* Filters */}
      <div className="filters">
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {monthOptions.map(month => <option key={month} value={month}>{month}</option>)}
        </select>

        <select
          value={selectedCamp}
          onChange={e => setSelectedCamp(e.target.value)}
          disabled={campOptions.length <= 1}
        >
          {campOptions.map(camp => <option key={camp} value={camp}>{camp}</option>)}
        </select>


        <button type="button" onClick={handleSubmit}>Apply Filters</button>
        <button type="button" onClick={handleReset}>Reset</button>
        <button
          onClick={() => setView(v => v === 'graph' ? 'table' : 'graph')}
          disabled={!appliedFilters.hasSubmitted}
          aria-disabled={!appliedFilters.hasSubmitted}
        >
          Toggle View
        </button>
      </div>

      {/* Loading / Content */}
      {loading ? (
        <div>Loading...</div>
      ) : !appliedFilters.hasSubmitted ? (
        <div className="empty-state">
          <h2>Select filters and click “Apply Filters” to see results.</h2>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="summary-cards">
            <div className="card">
              <h3>Total Patients</h3>
              <p>{filteredPatients.length}</p>
            </div>
            <div className="card">
              <h3>Total Doctors</h3>
              <p>{doctors.length}</p>
            </div>
            <div className="card">
              <h3>Total Medicines</h3>
              <p>{medicines.length}</p>
            </div>
          </div>

          <div className="summary-cards">
            <div className="card">
              <h3>Average BP</h3>
              <p>{averageVitals.bp.toFixed(2)}</p>
            </div>
            <div className="card">
              <h3>Average Pulse</h3>
              <p>{averageVitals.pulse.toFixed(2)}</p>
            </div>
            <div className="card">
              <h3>Average Weight</h3>
              <p>{averageVitals.weight.toFixed(2)}</p>
            </div>
            <div className="card">
              <h3>Average Temperature</h3>
              <p>{averageVitals.temperature.toFixed(2)}</p>
            </div>
          </div>

          {/* Charts or tables */}
          <div className="charts-container">
            {filteredPatients.length === 0 ? (
              <div className="empty-state">
                <h2>No data available for the selected filters.</h2>
              </div>
            ) : (
              <>
                {view === 'graph' && (
                  <>
                    <div className="chart">
                      <h3>Gender Distribution</h3>
                      <PieChart width={400} height={400}>
                        <Pie
                          data={genderData}
                          cx={200}
                          cy={200}
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`} // Display name and value
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </div>


                    <div className="chart">
                      <h3>Doctor-Patient Ratio</h3>
                      <TableView
                        data={doctorPatientData}
                        columns={[{ title: 'Doctor', key: 'name' }, { title: 'Patients Visited', key: 'patients' }]}
                      />
                      <button
                        onClick={handleExportDoctorPatientRatio}
                        disabled={!appliedFilters.hasSubmitted || doctorPatientData.length === 0}
                        aria-disabled={!appliedFilters.hasSubmitted || doctorPatientData.length === 0}
                      >
                        Export Doctor-Patient Ratio to CSV
                      </button>
                    </div>

                    <div className="chart">
                      <h3>Medicine Distribution</h3>
                      <TableView
                        data={medicineDistributionData}
                        columns={[{ title: 'Medicine ID', key: 'medicine_id' }, { title: 'Distributed Quantity', key: 'distributed_quantity' }]}
                      />
                      <button
                        onClick={handleExportMedicineDistribution}
                        disabled={!appliedFilters.hasSubmitted || medicineDistributionData.length === 0}
                        aria-disabled={!appliedFilters.hasSubmitted || medicineDistributionData.length === 0}
                      >
                        Export Medicine Distribution to CSV
                      </button>
                    </div>
                  </>
                )}

                {view === 'table' && (
                  <div>
                    <h3>Gender Distribution</h3>
                    <TableView
                      data={genderData}
                      columns={[{ title: 'Gender', key: 'name' }, { title: 'Count', key: 'value' }]}
                    />


                    <h3>Doctor-Patient Ratio</h3>
                    <TableView
                      data={doctorPatientData}
                      columns={[{ title: 'Doctor', key: 'name' }, { title: 'Patients', key: 'patients' }]}
                    />
                    <button
                      onClick={handleExportDoctorPatientRatio}
                      disabled={!appliedFilters.hasSubmitted || doctorPatientData.length === 0}
                      aria-disabled={!appliedFilters.hasSubmitted || doctorPatientData.length === 0}
                    >
                      Export Doctor-Patient Ratio to CSV
                    </button>

                    <h3>Medicine Distribution</h3>
                    <TableView
                      data={medicineDistributionData}
                      columns={[{ title: 'Medicine ID', key: 'medicine_id' }, { title: 'Distributed Quantity', key: 'distributed_quantity' }]}
                    />
                    <button
                      onClick={handleExportMedicineDistribution}
                      disabled={!appliedFilters.hasSubmitted || medicineDistributionData.length === 0}
                      aria-disabled={!appliedFilters.hasSubmitted || medicineDistributionData.length === 0}
                    >
                      Export Medicine Distribution to CSV
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CampAnalytics;
