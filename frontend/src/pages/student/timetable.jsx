import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import TimetableGrid from "../../components/TimetableGrid"; 
import { jwtDecode } from "jwt-decode"; // Ensure this is installed: npm install jwt-decode

function StudentTimetable() {
  const [entries, setEntries] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const token = localStorage.getItem("token");
  
  // 1. Get the real batchId from the token payload
  let studentBatchId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      studentBatchId = decoded.batchId;
    } catch (e) {
      console.error("Invalid token");
    }
  }

  useEffect(() => {
    // 2. Only fetch if we successfully found a batchId in the token
    if (!studentBatchId || !token) return;

    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [slotsRes, entriesRes] = await Promise.all([
          fetch("http://localhost:5000/api/timetable/timeslots", { headers }),
          fetch(`http://localhost:5000/api/timetable/batch/${studentBatchId}`, { headers })
        ]);
        
        const slots = await slotsRes.json();
        const ent = await entriesRes.json();
        
        if (slotsRes.ok) setTimeSlots(Array.isArray(slots) ? slots : []);
        if (entriesRes.ok) setEntries(Array.isArray(ent) ? ent : []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };
    fetchData();
  }, [token, studentBatchId]);

  // 3. Determine the Semester label dynamically from the data
  const semesterLabel = entries.length > 0 ? entries[0]?.batch?.semester : "Unknown";

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h1>My Class Schedule</h1>
      {studentBatchId ? (
        <p>Viewing timetable for Semester {semesterLabel}</p>
      ) : (
        <p style={{ color: "red" }}>Error: No Batch Assigned. Please contact Admin.</p>
      )}
      
      <TimetableGrid entries={entries} timeSlots={timeSlots} />
    </div>
  );
}

export default StudentTimetable;