import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import TimetableGrid from "../TimetableGrid.jsx";

function TimetablePage() {
  const [data, setData] = useState({ batches: [], courses: [], faculties: [], rooms: [], timeSlots: [] });
  const [selection, setSelection] = useState({ batchId: "", courseId: "", facultyId: "", roomId: "" });
  const [entries, setEntries] = useState([]);
  const token = localStorage.getItem("token");

  const refreshData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [b, c, f, r, slots, currentEntries] = await Promise.all([
        fetch("http://localhost:5000/api/batches", { headers }).then(res => res.json()),
        fetch("http://localhost:5000/api/courses", { headers }).then(res => res.json()),
        fetch("http://localhost:5000/api/faculty", { headers }).then(res => res.json()),
        fetch("http://localhost:5000/api/rooms", { headers }).then(res => res.json()),
        fetch("http://localhost:5000/api/timetable/timeslots", { headers }).then(res => res.json()), 
        fetch("http://localhost:5000/api/timetable/all", { headers }).then(res => res.json()), 
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
      refreshData();
    } else {
      alert(json.message || "Failed to allocate slot");
    }
  };

  const handleBulkGenerate = async () => {
    if (!selection.batchId || !selection.courseId || !selection.facultyId || !selection.roomId) {
      alert("Please select all fields");
      return;
    }
    const res = await fetch("http://localhost:5000/api/timetable/bulk-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(selection),
    });

    const json = await res.json();
    if (res.ok) {
      alert(json.message);
      refreshData();
    } else {
      alert(json.message || "Bulk allocation failed");
    }
  };

  const handleResetBatch = async () => {
    if (!selection.batchId) return alert("Please select a batch first");
    if (!window.confirm("Delete all entries for this batch? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/timetable/batch/${selection.batchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Batch timetable cleared successfully.");
        refreshData();
      }
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  const filteredEntries = entries.filter(e => e.batchId === parseInt(selection.batchId));

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h1>Timetable Management</h1>

      <div style={{ 
        display: "flex", gap: "10px", padding: "20px", 
        backgroundColor: "#f9f9f9", borderRadius: "8px", 
        marginBottom: "30px", flexWrap: "wrap", alignItems: "center"
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

        <button onClick={handleGenerate} style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "8px 15px", cursor: "pointer", borderRadius: "4px" }}>
          Auto-Generate Slot
        </button>
        <button onClick={handleBulkGenerate} style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "8px 15px", cursor: "pointer", borderRadius: "4px" }}>
          Bulk Allocate Course
        </button>
        {/* CORRECTED BUTTON PLACEMENT */}
        <button onClick={handleResetBatch} style={{ backgroundColor: "#dc3545", color: "white", padding: "8px 15px", borderRadius: "4px", border: "none", cursor: "pointer" }}>
          Reset Batch
        </button>
      </div>

      <hr />

      <TimetableGrid 
        entries={selection.batchId ? filteredEntries : []} 
        timeSlots={data.timeSlots} 
      />
    </div>
  );
}

export default TimetablePage;