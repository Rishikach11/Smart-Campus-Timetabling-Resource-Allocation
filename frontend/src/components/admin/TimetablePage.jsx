import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import TimetableGrid from "../TimetableGrid.jsx";

function TimetablePage() {
  const [data, setData] = useState({ batches: [], courses: [], faculties: [], rooms: [], timeSlots: [] });
  const [selection, setSelection] = useState({ batchId: "", courseId: "", facultyId: "", roomId: "" });
  const [entries, setEntries] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch all dependencies and existing entries
// src/components/admin/TimetablePage.jsx

// Inside TimetablePage.jsx
const refreshData = async () => {
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const [b, c, f, r, slots, currentEntries] = await Promise.all([
      // Pluralized to match your .routes.js files
      fetch("http://localhost:5000/api/batches", { headers }).then(res => res.json()), //
      fetch("http://localhost:5000/api/courses", { headers }).then(res => res.json()), //
      fetch("http://localhost:5000/api/faculty", { headers }).then(res => res.json()), //
      fetch("http://localhost:5000/api/rooms", { headers }).then(res => res.json()),   //
      
      // Fixed: Removed "/timetable" prefix to match index.js + timetable.routes.js
      fetch("http://localhost:5000/api/timeslots", { headers }).then(res => res.json()), 
      fetch("http://localhost:5000/api/all", { headers }).then(res => res.json()), 
    ]);
    
    setData({ 
      batches: Array.isArray(b) ? b : [], 
      courses: Array.isArray(c) ? c : [], 
      faculties: Array.isArray(f) ? f : [], 
      rooms: Array.isArray(r) ? r : [], 
      timeSlots: Array.isArray(slots) ? slots : [] 
    });
    setEntries(Array.isArray(currentEntries) ? currentEntries : []);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  useEffect(() => { refreshData(); }, [token]);

  const handleGenerate = async () => {
    if (!selection.batchId || !selection.courseId || !selection.facultyId || !selection.roomId) {
      alert("Please select all fields");
      return;
    }

    const res = await fetch("http://localhost:5000/api/timetable/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(selection),
    });

    const json = await res.json();
    if (res.ok) {
      alert("Slot Allocated Successfully!");
      refreshData(); // Reload the grid to show new entry
    } else {
      alert(json.message || "Failed to allocate slot");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h1>Timetable Management</h1>

      <div style={{ 
        display: "flex", 
        gap: "10px", 
        padding: "20px", 
        backgroundColor: "#f9f9f9", 
        borderRadius: "8px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <select onChange={e => setSelection({...selection, batchId: e.target.value})} value={selection.batchId}>
          <option value="">Select Batch</option>
          {data.batches.map(b => <option key={b.id} value={b.id}>Sem {b.semester}</option>)}
        </select>

        <select onChange={e => setSelection({...selection, courseId: e.target.value})} value={selection.courseId}>
          <option value="">Select Course</option>
          {data.courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>

        <select onChange={e => setSelection({...selection, facultyId: e.target.value})} value={selection.facultyId}>
          <option value="">Select Faculty</option>
          {data.faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <select onChange={e => setSelection({...selection, roomId: e.target.value})} value={selection.roomId}>
          <option value="">Select Room</option>
          {data.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        <button 
          onClick={handleGenerate} 
          style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "8px 15px", cursor: "pointer", borderRadius: "4px" }}
        >
          Auto-Generate Slot
        </button>
      </div>

      <hr />

      {/* The Grid View */}
      <TimetableGrid entries={entries} timeSlots={data.timeSlots} />
    </div>
  );
}

export default TimetablePage;