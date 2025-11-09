import React, { useState, useEffect } from 'react';
import { privateAxios } from '../api/axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { format, parseISO, getHours, isValid } from 'date-fns';
import { unparse } from 'papaparse';
import '../Styles/CampAnalytics.css'; // Assuming existing styles are sufficient or will be updated

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1'];

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
  const [volunteers, setVolunteers] = useState([]);
  const [patientHistories, setPatientHistories] = useState([]);
  const [totalQueueCount, setTotalQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('graph'); // 'graph' or 'table'
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  // const [filterCamp, setFilterCamp] = useState(''); // Placeholder for future camp filtering

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          patientsRes,
          doctorsRes,
          medicinesRes,
          vitalsRes,
          volunteersRes,
          queueRes,
          patientHistoryRes
        ] = await Promise.all([
          privateAxios.get("/api/admin/get_patients"),
          privateAxios.get("/api/admin/get_doctors"),
          privateAxios.get("/api/admin/get_medicines"),
          privateAxios.get("/api/vitals"),
          privateAxios.get("/api/admin/get_volunteers"), // New API call for volunteers
          privateAxios.get("/api/queue/total"), // New API call for total queue count
          privateAxios.get("/api/patient-history/summary") // New API call for patient history summary
        ]);

        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setMedicines(medicinesRes.data);
        setVitals(vitalsRes.data);
        setVolunteers(volunteersRes.data);
        setTotalQueueCount(queueRes.data.totalQueueCount);
        setPatientHistories(patientHistoryRes.data);

        console.log("Fetched Patients:", patientsRes.data);
        console.log("Fetched Doctors:", doctorsRes.data);
        console.log("Fetched Medicines:", medicinesRes.data);
        console.log("Fetched Vitals:", vitalsRes.data);
        console.log("Fetched Volunteers:", volunteersRes.data);
        console.log("Fetched Total Queue Count:", queueRes.data.totalQueueCount);
        console.log("Fetched Patient Histories:", patientHistoryRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  // --- Filtering Logic ---
  const filteredPatients = patients.filter(patient => {
    if (!patient.createdAt) return false; // Skip if createdAt is undefined
    const patientDate = parseISO(patient.createdAt);
    if (!isValid(patientDate)) return false; // Skip if date is invalid
    const matchesMonth = filterMonth ? format(patientDate, 'yyyy-MM') === filterMonth : true;
    const matchesDoctor = filterDoctor ? patient.assigned_doctor === filterDoctor : true;
    return matchesMonth && matchesDoctor;
  });

  const filteredPatientHistories = patientHistories.filter(history => {
    // Filter histories based on visits that match the month/doctor filters
    const hasMatchingVisit = history.visits.some(visit => {
      if (!visit.timestamp) return false; // Skip if timestamp is undefined
      const visitDate = parseISO(visit.timestamp + '-01'); // Assuming timestamp is YYYY-MM
      if (!isValid(visitDate)) return false; // Skip if date is invalid
      const matchesMonth = filterMonth ? format(visitDate, 'yyyy-MM') === filterMonth : true;
      // Doctor filter for patient histories is more complex, might need to check assigned_doctor in patient model
      // For now, we'll filter based on patient registration date if doctor filter is applied
      return matchesMonth;
    });
    return hasMatchingVisit;
  });


  // --- Data Processing for Charts & Cards ---

  // 1. Camp Participation Overview (Summary Cards)
  const totalPatientsRegistered = filteredPatients.length;
  const totalDoctorsParticipated = doctors.length; // Doctors are generally static for a camp
  const totalVolunteers = volunteers.length;
  const totalMedicinesIssued = medicines.reduce((sum, med) => sum + med.total_quantity, 0); // Assuming total_quantity is issued

  // 2. Gender-wise Distribution
  const genderData = [
    { name: 'Male', value: filteredPatients.filter(p => p.patient_sex === 'Male').length },
    { name: 'Female', value: filteredPatients.filter(p => p.patient_sex === 'Female').length },
    { name: 'Other', value: filteredPatients.filter(p => p.patient_sex === 'Other').length },
  ].filter(g => g.value > 0);

  // 3. Patient Registration Trend
  const registrationTrendMap = filteredPatients.reduce((acc, patient) => {
    if (patient.createdAt) {
      const parsedDate = parseISO(patient.createdAt);
      if (isValid(parsedDate)) {
        const date = format(parsedDate, 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
      }
    }
    return acc;
  }, {});
  const registrationTrendData = Object.keys(registrationTrendMap)
    .sort()
    .map(date => ({ date, registrations: registrationTrendMap[date] }));

  // 4. Doctor–Patient Ratio
  const doctorPatientMap = filteredPatients.reduce((acc, patient) => {
    if (patient.assigned_doctor) {
      acc[patient.assigned_doctor] = (acc[patient.assigned_doctor] || 0) + 1;
    }
    return acc;
  }, {});
  const doctorPatientData = Object.keys(doctorPatientMap).map(doctorId => {
    const doctor = doctors.find(d => d._id === doctorId);
    return {
      name: doctor ? doctor.doctor_name : `Unknown Doctor (${doctorId})`,
      patients: doctorPatientMap[doctorId]
    };
  });

  // 5. Medicine Distribution Summary
  const medicineDistributionMap = filteredPatients.reduce((acc, patient) => {
    // Assuming prescriptions are linked to patients or can be derived from patient histories
    // For now, using the overall medicines data as a proxy for distribution
    // A more accurate approach would involve iterating through patientHistories.visits.medicines_prescribed
    return acc;
  }, {});

  // Using the overall medicines data for now, as patient-specific prescription data is in patientHistories
  // To get actual prescribed medicine distribution, we need to aggregate from patientHistories
  const prescribedMedicineDistributionMap = filteredPatientHistories.reduce((acc, history) => {
    if (Array.isArray(history.visits)) { // Ensure visits is an array
      history.visits.forEach(visit => {
        if (Array.isArray(visit.medicines_prescribed)) { // Ensure medicines_prescribed is an array
          visit.medicines_prescribed.forEach(med => {
            const medicineDetail = medicines.find(m => m.medicine_id === med.medicine_id);
            const medicineName = medicineDetail ? medicineDetail.medicine_name : `Unknown Medicine (${med.medicine_id})`;
            acc[medicineName] = (acc[medicineName] || 0) + med.quantity;
          });
        }
      });
    }
    return acc;
  }, {});

  const medicineDistributionData = Object.keys(prescribedMedicineDistributionMap)
    .map(name => ({ name, quantity: prescribedMedicineDistributionMap[name] }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // 6. Vitals Summary (Average Metrics)
  const averageVitals = vitals.reduce((acc, vital) => {
    acc.bp += vital.bp;
    acc.pulse += vital.pulse;
    acc.weight += vital.weight;
    acc.temperature += vital.temperature;
    return acc;
  }, { bp: 0, pulse: 0, weight: 0, temperature: 0 });

  if (vitals.length > 0) {
    averageVitals.bp /= vitals.length;
    averageVitals.pulse /= vitals.length;
    averageVitals.weight /= vitals.length;
    averageVitals.temperature /= vitals.length;
  }

  // 7. Counselling & Follow-Up Stats
  let counsellingCompleted = 0;
  let counsellingPending = 0;
  filteredPatientHistories.forEach(history => {
    if (Array.isArray(history.visits)) { // Ensure visits is an array
      history.visits.forEach(visit => {
        if (visit.counselling !== undefined) { // Check if counselling field exists
          if (visit.counselling) {
            counsellingCompleted++;
          } else {
            counsellingPending++;
          }
        }
      });
    }
  });
  const counsellingData = [
    { name: 'Completed', value: counsellingCompleted },
    { name: 'Pending', value: counsellingPending },
  ].filter(c => c.value > 0);

  // 8. Registration Timing Overview
  const registrationTimingMap = filteredPatients.reduce((acc, patient) => {
    if (patient.createdAt) {
      const parsedDate = parseISO(patient.createdAt);
      if (isValid(parsedDate)) {
        const hour = getHours(parsedDate);
        acc[hour] = (acc[hour] || 0) + 1;
      }
    }
    return acc;
  }, {});
  const registrationTimingData = Object.keys(registrationTimingMap)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(hour => ({ hour: `${hour}:00`, registrations: registrationTimingMap[hour] }));

  // 9. Old vs New Patient Ratio
  let newPatients = 0;
  let oldPatients = 0;
  filteredPatientHistories.forEach(history => {
    if (Array.isArray(history.visits)) { // Ensure visits is an array
      history.visits.forEach(visit => {
        if (visit.status) { // Check if status field exists
          if (visit.status === 'new') {
            newPatients++;
          } else if (visit.status === 'old') {
            oldPatients++;
          }
        }
      });
    }
  });
  const patientRatioData = [
    { name: 'New Patients', value: newPatients },
    { name: 'Old Patients', value: oldPatients },
  ].filter(p => p.value > 0);

  // --- Export to CSV ---
  const handleExport = () => {
    const dataToExport = [
      ["Metric", "Value"],
      ["Total Patients Registered", totalPatientsRegistered],
      ["Total Doctors Participated", totalDoctorsParticipated],
      ["Total Volunteers", totalVolunteers],
      ["Total Medicines Issued", totalMedicinesIssued],
      ["Patients in Queue", totalQueueCount],
      ["Average BP", averageVitals.bp.toFixed(2)],
      ["Average Pulse", averageVitals.pulse.toFixed(2)],
      ["Average Weight", averageVitals.weight.toFixed(2)],
      ["Average Temperature", averageVitals.temperature.toFixed(2)],
      ["Counselling Completed", counsellingCompleted],
      ["Counselling Pending", counsellingPending],
      ["New Patients", newPatients],
      ["Old Patients", oldPatients],
    ];

    // Add chart data
    dataToExport.push(["", ""]); // Separator
    dataToExport.push(["Gender Distribution"]);
    genderData.forEach(item => dataToExport.push([item.name, item.value]));

    dataToExport.push(["", ""]); // Separator
    dataToExport.push(["Patient Registration Trend"]);
    registrationTrendData.forEach(item => dataToExport.push([item.date, item.registrations]));

    dataToExport.push(["", ""]); // Separator
    dataToExport.push(["Doctor-Patient Ratio"]);
    doctorPatientData.forEach(item => dataToExport.push([item.name, item.patients]));

    dataToExport.push(["", ""]); // Separator
    dataToExport.push(["Medicine Distribution Summary"]);
    medicineDistributionData.forEach(item => dataToExport.push([item.name, item.quantity]));

    dataToExport.push(["", ""]); // Separator
    dataToExport.push(["Registration Timing Overview"]);
    registrationTimingData.forEach(item => dataToExport.push([item.hour, item.registrations]));


    const csv = unparse(dataToExport);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "camp_analytics_summary.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique months for filter
  const availableMonths = [...new Set(
    patients.filter(p => p.createdAt).map(p => {
      const parsedDate = parseISO(p.createdAt);
      return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM') : null;
    }).filter(Boolean) // Filter out nulls
  )].sort().reverse();

  return (
    <div className="analytics-container">
      <h1>Camp Analytics Dashboard</h1>

      <div className="filters">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">Filter by Month</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>{format(parseISO(month + '-01'), 'MMM yyyy')}</option>
          ))}
        </select>
        <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
          <option value="">Filter by Doctor</option>
          {doctors.map(doctor => (
            <option key={doctor._id} value={doctor._id}>{doctor.doctor_name}</option>
          ))}
        </select>
        {/* <select value={filterCamp} onChange={(e) => setFilterCamp(e.target.value)}>
          <option value="">Filter by Camp</option>
          {/* Add camp options here once camp data is available }
        </select> */}
        <button onClick={() => setView(v => v === 'graph' ? 'table' : 'graph')}>
          Toggle View ({view === 'graph' ? 'Table' : 'Graph'})
        </button>
        <button onClick={handleExport}>
          Export to CSV
        </button>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Patients Registered</h3>
          <p>{totalPatientsRegistered}</p>
        </div>
        <div className="card">
          <h3>Total Doctors Participated</h3>
          <p>{totalDoctorsParticipated}</p>
        </div>
        <div className="card">
          <h3>Total Volunteers</h3>
          <p>{totalVolunteers}</p>
        </div>
        <div className="card">
          <h3>Total Medicines Issued</h3>
          <p>{totalMedicinesIssued}</p>
        </div>
        <div className="card">
          <h3>Patients in Queue</h3>
          <p>{totalQueueCount}</p>
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

      <div className="charts-container">
        {view === 'graph' ? (
          <>
            {genderData.length > 0 && (
              <div className="chart">
                <h3>Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-gender-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {patientRatioData.length > 0 && (
              <div className="chart">
                <h3>Old vs New Patient Ratio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={patientRatioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {patientRatioData.map((entry, index) => (
                        <Cell key={`cell-patient-ratio-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {counsellingData.length > 0 && (
              <div className="chart">
                <h3>Counselling & Follow-Up Stats</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={counsellingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {counsellingData.map((entry, index) => (
                        <Cell key={`cell-counselling-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {registrationTrendData.length > 0 && (
              <div className="chart">
                <h3>Patient Registration Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registrationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="registrations" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {registrationTimingData.length > 0 && (
              <div className="chart">
                <h3>Registration Timing Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={registrationTimingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="registrations" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {doctorPatientData.length > 0 && (
              <div className="chart">
                <h3>Doctor-Patient Ratio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={doctorPatientData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="patients" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {medicineDistributionData.length > 0 && (
              <div className="chart">
                <h3>Medicine Distribution Summary</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" data={medicineDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <>
            {genderData.length > 0 && (
              <>
                <h3>Gender Distribution</h3>
                <TableView
                  data={genderData}
                  columns={[{ title: 'Gender', key: 'name' }, { title: 'Count', key: 'value' }]}
                />
              </>
            )}
            {patientRatioData.length > 0 && (
              <>
                <h3>Old vs New Patient Ratio</h3>
                <TableView
                  data={patientRatioData}
                  columns={[{ title: 'Type', key: 'name' }, { title: 'Count', key: 'value' }]}
                />
              </>
            )}
            {counsellingData.length > 0 && (
              <>
                <h3>Counselling & Follow-Up Stats</h3>
                <TableView
                  data={counsellingData}
                  columns={[{ title: 'Status', key: 'name' }, { title: 'Count', key: 'value' }]}
                />
              </>
            )}
            {registrationTrendData.length > 0 && (
              <>
                <h3>Patient Registration Trend</h3>
                <TableView
                  data={registrationTrendData}
                  columns={[{ title: 'Date', key: 'date' }, { title: 'Registrations', key: 'registrations' }]}
                />
              </>
            )}
            {registrationTimingData.length > 0 && (
              <>
                <h3>Registration Timing Overview</h3>
                <TableView
                  data={registrationTimingData}
                  columns={[{ title: 'Hour', key: 'hour' }, { title: 'Registrations', key: 'registrations' }]}
                />
              </>
            )}
            {doctorPatientData.length > 0 && (
              <>
                <h3>Doctor-Patient Ratio</h3>
                <TableView
                  data={doctorPatientData}
                  columns={[{ title: 'Doctor', key: 'name' }, { title: 'Patients', key: 'patients' }]}
                />
              </>
            )}
            {medicineDistributionData.length > 0 && (
              <>
                <h3>Medicine Distribution Summary</h3>
                <TableView
                  data={medicineDistributionData}
                  columns={[{ title: 'Medicine', key: 'name' }, { title: 'Quantity', key: 'quantity' }]}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CampAnalytics;
