import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

const API_URL = import.meta.env.VITE_API_URL;

function AdminTimetable() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/batches`, { headers })
      .then((res) => res.json())
      .then(setBatches)
      .catch(() => setMessage("Failed to load batches"));
  }, []);

  const generateTimetable = async () => {
    if (!batchId) {
      setMessage("Please select a batch");
      return;
    }

    setMessage("Generating timetable...");

    try {
      const res = await fetch(
        `${API_URL}/api/generate/batch/${batchId}`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(
          data.entriesCreated > 0
            ? "✅ Timetable generated (may be partially scheduled)"
            : "⚠️ No slots could be allocated due to constraints"
        );
      } else {
        setMessage(data.message || "Generation failed");
      }
    } catch {
      setMessage("Generation failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h1>Admin Timetable Generation</h1>

      <select
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
      >
        <option value="">Select Batch</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.department.code} – Sem {b.semester} (Batch ID: {b.id})
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={generateTimetable}>
        Generate Timetable
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AdminTimetable;
