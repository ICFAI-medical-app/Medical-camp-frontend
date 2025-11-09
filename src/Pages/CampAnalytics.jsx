import React, { useState, useEffect } from 'react';
import { privateAxios } from '../api/axios';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { unparse } from 'papaparse';
import '../Styles/CampAnalytics.css';
const TableView = ({ data, columns }) => (
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
);

const CampAnalytics = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('graph');

  const handleExport = () => {
    const csv = unparse({
      fields: ["Metric", "Value"],
      data: [
        ["Total Patients", patients.length],
        ["Total Doctors", doctors.length],
        ["Total Medicines", medicines.length],
        ["Average BP", averageVitals.bp.toFixed(2)],
        ["Average Pulse", averageVitals.pulse.toFixed(2)],
        ["Average Weight", averageVitals.weight.toFixed(2)],
        ["Average Temperature", averageVitals.temperature.toFixed(2)],
      ]
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "camp_summary.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, medicinesRes, vitalsRes] = await Promise.all([
          privateAxios.get("/api/admin/get_patients"),
          privateAxios.get("/api/admin/get_doctors"),
          privateAxios.get("/api/admin/get_medicines"),
          privateAxios.get("/api/vitals")
        ]);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setMedicines(medicinesRes.data);
        setVitals(vitalsRes.data);
        console.log("Fetched Patients:", patientsRes.data);
        console.log("Fetched Doctors:", doctorsRes.data);
        console.log("Fetched Medicines:", medicinesRes.data);
        console.log("Fetched Vitals:", vitalsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const genderData = [
    { name: 'Male', value: patients.filter(p => p.patient_sex === 'Male').length },
    { name: 'Female', value: patients.filter(p => p.patient_sex === 'Female').length },
    { name: 'Other', value: patients.filter(p => p.patient_sex === 'Other').length },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const registrationTrendData = patients.reduce((acc, patient) => {
    if (patient.createdAt) {
      const month = format(new Date(patient.createdAt), 'MMM yyyy');
      const existingMonth = acc.find(item => item.month === month);
      if (existingMonth) {
        existingMonth.registrations++;
      } else {
        acc.push({ month, registrations: 1 });
      }
    }
    return acc;
  }, []);

  const doctorPatientData = doctors.map(doctor => {
    const patientCount = patients.filter(p => p.assigned_doctor === doctor._id).length;
    return { name: doctor.doctor_name, patients: patientCount };
  });

  const medicineDistributionData = medicines.reduce((acc, medicine) => {
    const existingMedicine = acc.find(item => item.name === medicine.medicine_name);
    if (existingMedicine) {
      existingMedicine.quantity++;
    } else {
      acc.push({ name: medicine.medicine_name, quantity: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

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

  return (
    <div className="analytics-container">
      <h1>Camp Analytics Dashboard</h1>
      <div className="filters">
        <select>
          <option value="">Filter by Month</option>
        </select>
        <select>
          <option value="">Filter by Camp</option>
        </select>
        <select>
          <option value="">Filter by Doctor</option>
        </select>
        <button onClick={() => setView(v => v === 'graph' ? 'table' : 'graph')}>
          Toggle View
        </button>
        <button onClick={handleExport}>
          Export to CSV
        </button>
      </div>
      <div className="summary-cards">
        <div className="card">
          <h3>Total Patients</h3>
          <p>{patients.length}</p>
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
      <div className="charts-container">
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
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
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
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
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
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
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
    </div>
  );
};

export default CampAnalytics;
