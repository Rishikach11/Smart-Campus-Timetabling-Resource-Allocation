import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import TimetableGrid from "../../components/TimetableGrid.jsx";
import { jwtDecode } from "jwt-decode"; 

function StudentDashboard() {
  const [entries, setEntries] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ name: "", batchId: null });
  const token = localStorage.getItem("token");

  const fetchStudentData = async (batchId) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [entryRes, slotRes] = await Promise.all([
        fetch(`http://localhost:5000/api/timetable/batch/${batchId}`, { headers }),
        fetch(`http://localhost:5000/api/timetable/timeslots`, { headers })
      ]);

      const entryData = await entryRes.json();
      const slotData = await slotRes.json();

      setEntries(Array.isArray(entryData) ? entryData : []);
      setTimeSlots(Array.isArray(slotData) ? slotData : []);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setStudentInfo({ name: decoded.name, batchId: decoded.batchId });
      fetchStudentData(decoded.batchId);
    }
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <div style={{ marginBottom: "30px" }}>
        <h1>Welcome, {studentInfo.name}</h1>
        <p style={{ color: "#666" }}>Viewing timetable for Batch ID: {studentInfo.batchId}</p>
      </div>

      <hr />
      {/* Read-only view of the grid */}
      <TimetableGrid entries={entries} timeSlots={timeSlots} />
    </div>
  );
}

export default StudentDashboard;