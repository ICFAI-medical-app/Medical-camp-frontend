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
  const [volunteers, setVolunteers] = useState([]);
  const [patientHistories, setPatientHistories] = useState([]);
  const [totalQueueCount, setTotalQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('graph');

  const navigate = useNavigate();
  const location = useLocation();

  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  const [selectedCamp, setSelectedCamp] = useState('All');

  const [appliedFilters, setAppliedFilters] = useState({
    month: 'All',
    camp: 'All',
    doctor: 'All',
    hasSubmitted: false,
  });

  // On initial load, sync from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const month = queryParams.get('month') || 'All';
    const camp = queryParams.get('camp') || 'All';
    const doctor = queryParams.get('doctor') || 'All';

    if (month !== 'All' || camp !== 'All' || doctor !== 'All') {
      setSelectedMonth(month);
      setSelectedCamp(camp);
      setSelectedDoctor(doctor);
      setAppliedFilters({ month, camp, doctor, hasSubmitted: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Sync URL with applied filters
  useEffect(() => {
    if (!appliedFilters.hasSubmitted) return;
    const params = new URLSearchParams();
    if (appliedFilters.month !== 'All') params.set('month', appliedFilters.month);
    if (appliedFilters.camp !== 'All') params.set('camp', appliedFilters.camp);
    if (appliedFilters.doctor !== 'All') params.set('doctor', appliedFilters.doctor);
    navigate({ search: params.toString() }, { replace: true });
  }, [appliedFilters, navigate]);

  // Build unique, sorted options
  const { monthOptions, doctorOptions, campOptions } = useMemo(() => {
    const monthSet = new Set();
    const campSet = new Set();
    const doctorSet = new Set();

    patients.forEach(p => {
      if (p?.createdAt) monthSet.add(format(new Date(p.createdAt), 'yyyy-MM'));
      if (p?.camp) campSet.add(p.camp);
    });
    doctors.forEach(d => {
      if (d?.doctor_name) doctorSet.add(d.doctor_name);
    });

    const months = ['All', ...Array.from(monthSet).sort((a, b) => a.localeCompare(b))];
    const camps = ['All', ...Array.from(campSet).sort((a, b) => a.localeCompare(b))];
    const drs = ['All', ...Array.from(doctorSet).sort((a, b) => a.localeCompare(b))];

    return { monthOptions: months, doctorOptions: drs, campOptions: camps };
  }, [patients, doctors]);

  // Validate current selections against available options
  useEffect(() => {
    if (!monthOptions.includes(selectedMonth)) setSelectedMonth('All');
    if (!campOptions.includes(selectedCamp)) setSelectedCamp('All');
    if (!doctorOptions.includes(selectedDoctor)) setSelectedDoctor('All');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOptions, campOptions, doctorOptions]);

  // Apply all three filters
  const filteredPatients = useMemo(() => {
    const { month, camp, doctor } = appliedFilters;
    if (!appliedFilters.hasSubmitted) return [];

    const doctorMap = doctors.reduce((acc, doc) => {
      if (doc?.doctor_name && doc?._id) acc[doc.doctor_name] = doc._id;
      return acc;
    }, {});

    return patients.filter(p => {
      const monthMatch =
        month === 'All' ||
        (p.createdAt && format(new Date(p.createdAt), 'yyyy-MM') === month);

      const doctorMatch =
        doctor === 'All' ||
        (p.assigned_doctor && p.assigned_doctor === doctorMap[doctor]);

      const campMatch =
        camp === 'All' ||
        (p.camp && p.camp === camp);

      return monthMatch && doctorMatch && campMatch;
    });
  }, [patients, doctors, appliedFilters]);

  // Charts/tables data (keep hooks above any return)
  const genderData = useMemo(() => ([
    { name: 'Male', value: filteredPatients.filter(p => p.patient_sex === 'Male').length },
    { name: 'Female', value: filteredPatients.filter(p => p.patient_sex === 'Female').length },
    { name: 'Other', value: filteredPatients.filter(p => p.patient_sex === 'Other').length },
  ]), [filteredPatients]);

  const registrationTrendData = useMemo(() => {
    // keep chronological order using yyyy-MM as key
    const map = new Map();
    filteredPatients.forEach(p => {
      if (!p?.createdAt) return;
      const ym = format(new Date(p.createdAt), 'yyyy-MM');
      map.set(ym, (map.get(ym) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([ym, count]) => ({ month: format(new Date(`${ym}-01`), 'MMM yyyy'), registrations: count }));
  }, [filteredPatients]);

  const doctorPatientData = useMemo(() => (
    doctors
      .map(doctor => ({
        name: doctor.doctor_name,
        patients: filteredPatients.filter(p => p.assigned_doctor === doctor._id).length
      }))
      .filter(d => d.patients > 0)
  ), [doctors, filteredPatients]);

  const medicineDistributionData = useMemo(() => {
    // If medicines should be per filtered patients, adjust here accordingly
    const arr = medicines.reduce((acc, m) => {
      const found = acc.find(i => i.name === m.medicine_name);
      if (found) found.quantity++;
      else acc.push({ name: m.medicine_name, quantity: 1 });
      return acc;
    }, []);
    return arr.sort((a, b) => b.quantity - a.quantity).slice(0, 10);
  }, [medicines]);

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
      doctor: selectedDoctor,
      hasSubmitted: true
    });
  };

  const handleReset = () => {
    setSelectedMonth('All');
    setSelectedCamp('All');
    setSelectedDoctor('All');
    setAppliedFilters({ month: 'All', camp: 'All', doctor: 'All', hasSubmitted: false });
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

  // Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, medicinesRes, vitalsRes] = await Promise.all([
          privateAxios.get('/api/admin/get_patients'),
          privateAxios.get('/api/admin/get_doctors'),
          privateAxios.get('/api/admin/get_medicines'),
          privateAxios.get('/api/vitals'),
        ]);
        setPatients(patientsRes.data || []);
        setDoctors(doctorsRes.data || []);
        setMedicines(medicinesRes.data || []);
        setVitals(vitalsRes.data || []);
        // console logs left for debugging; remove if noisy
        console.log('Fetched Patients:', patientsRes.data);
        console.log('Fetched Doctors:', doctorsRes.data);
        console.log('Fetched Medicines:', medicinesRes.data);
        console.log('Fetched Vitals:', vitalsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

        <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
          {doctorOptions.map(doctor => <option key={doctor} value={doctor}>{doctor}</option>)}
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
        <button
          onClick={handleExport}
          disabled={!appliedFilters.hasSubmitted}
          aria-disabled={!appliedFilters.hasSubmitted}
        >
          Export to CSV
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
                      <h3>Patient Registration Trend</h3>
                      <LineChart
                        width={500}
                        height={300}
                        data={registrationTrendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="registrations" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </div>

                    <div className="chart">
                      <h3>Doctor-Patient Ratio</h3>
                      <BarChart
                        width={500}
                        height={300}
                        data={doctorPatientData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="patients" fill="#8884d8" />
                      </BarChart>
                    </div>

                    <div className="chart">
                      <h3>Medicine Distribution</h3>
                      <BarChart
                        layout="vertical"
                        width={500}
                        height={300}
                        data={medicineDistributionData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantity" fill="#8884d8" />
                      </BarChart>
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

                    <h3>Patient Registration Trend</h3>
                    <TableView
                      data={registrationTrendData}
                      columns={[{ title: 'Month', key: 'month' }, { title: 'Registrations', key: 'registrations' }]}
                    />

                    <h3>Doctor-Patient Ratio</h3>
                    <TableView
                      data={doctorPatientData}
                      columns={[{ title: 'Doctor', key: 'name' }, { title: 'Patients', key: 'patients' }]}
                    />

                    <h3>Medicine Distribution</h3>
                    <TableView
                      data={medicineDistributionData}
                      columns={[{ title: 'Medicine', key: 'name' }, { title: 'Quantity', key: 'quantity' }]}
                    />
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
