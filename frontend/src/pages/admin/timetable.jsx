import { useEffect, useState } from "react";

function AdminTimetable() {
  const [batchId, setBatchId] = useState(1);
  const [timetable, setTimetable] = useState({});
  const [allTimeSlots, setAllTimeSlots] = useState([]); // Master list
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: "", type: "" });

  const TOKEN = "YOUR_JWT_TOKEN"; // Temporary until Phase 2 Login

  // Fetch both Master Slots and Timetable Data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Master Slots (for grid structure)
      const slotsRes = await fetch("http://localhost:5000/api/timeslots", {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const slotsData = await slotsRes.json();
      
      // Extract unique time ranges for the Y-axis (e.g., "09:00-10:00")
      const uniqueTimes = [...new Set(slotsData.map(s => `${s.startTime}-${s.endTime}`))];
      setAllTimeSlots(uniqueTimes);

      // 2. Fetch Timetable Entries (for grid content)
      const tableRes = await fetch(`http://localhost:5000/api/timetable/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const tableData = await tableRes.json();
      setTimetable(tableData || {});
      
      setLoading(false);
    } catch (err) {
      setStatus({ message: "Error loading data", type: "red" });
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [batchId]);

  const handleGenerate = async () => {
    setStatus({ message: "Generating...", type: "blue" });
    try {
      const res = await fetch(`http://localhost:5000/api/generate/batch/${batchId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setStatus({ message: "Success! Timetable updated ✅", type: "green" });
      loadData(); // Refresh grid
    } catch (err) {
      setStatus({ message: err.message, type: "red" });
    }
  };

  const days = ["MON", "TUE", "WED", "THU", "FRI"]; 

  if (loading) return <h2>Loading System...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Control: Batch {batchId}</h2>
      
      <button onClick={handleGenerate} style={{ marginBottom: "10px" }}>
        Generate New Timetable
      </button>

      {status.message && (
        <p style={{ color: status.type }}>{status.message}</p>
      )}

      <select value={batchId} onChange={(e) => setBatchId(Number(e.target.value))}>
        <option value={1}>Batch 1</option>
        <option value={2}>Batch 2</option>
        <option value={3}>Batch 3</option>
      </select>

      <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Time</th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {allTimeSlots.map(timeRange => (
            <tr key={timeRange}>
              <td><strong>{timeRange}</strong></td>
              {days.map(day => {
                // Find entry where "09:00-10:00" matches the timeRange
                const entry = timetable[day]?.find(e => e.time === timeRange);
                return (
                  <td key={day} style={{ height: "60px", textAlign: "center" }}>
                    {entry ? (
                      <div>
                        <strong>{entry.course}</strong><br/>
                        <small>{entry.faculty} | {entry.room}</small><br/>
                        <span style={{ fontSize: '10px' }}>{entry.type}</span>
                      </div>
                    ) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTimetable;