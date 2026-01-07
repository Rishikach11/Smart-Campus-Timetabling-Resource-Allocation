import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

function AdminTimetable() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 1️⃣ Load batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/batch", { headers });
        const data = await res.json();
        if (res.ok) setBatches(data);
      } catch (err) {
        setMessage("Failed to load batches");
      }
    };
    fetchBatches();
  }, []);

  // 2️⃣ Generate timetable
  const generateTimetable = async () => {
    if (!selectedBatch) {
      setMessage("Please select a batch");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const genRes = await fetch(
        `http://localhost:5000/api/generate/batch/${selectedBatch}`,
        { method: "POST", headers }
      );

      const genData = await genRes.json();
      if (!genRes.ok) {
        setMessage(genData.error || "Generation failed");
        setLoading(false);
        return;
      }

      const viewRes = await fetch(
        `http://localhost:5000/api/timetable/batch/${selectedBatch}`,
        { headers }
      );

      const viewData = await viewRes.json();
      if (viewData.generated) {
        setTimetable(viewData.timetable);
        setMessage("Timetable generated successfully");
      } else {
        setTimetable(null);
        setMessage("No timetable generated");
      }
    } catch (err) {
      setMessage("Something went wrong during generation");
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ Reset timetable (ADMIN ONLY)
  const resetTimetable = async () => {
    if (!selectedBatch) {
      setMessage("Please select a batch first");
      return;
    }

    const confirmReset = window.confirm(
      "This will DELETE the entire timetable for this batch.\n\nDo you want to continue?"
    );

    if (!confirmReset) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/timetable/batch/${selectedBatch}`,
        { method: "DELETE", headers }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to reset timetable");
        setLoading(false);
        return;
      }

      setTimetable(null);
      setMessage(
        `Timetable reset successfully. Deleted ${data.deleted} entries.`
      );
    } catch (err) {
      setMessage("Error resetting timetable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h1>Admin Timetable</h1>

      <div style={{ marginBottom: "16px" }}>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.department.code} - Sem {b.semester}
            </option>
          ))}
        </select>

        <button onClick={generateTimetable} disabled={loading}>
          {loading ? "Generating..." : "Generate Timetable"}
        </button>

        <button
          onClick={resetTimetable}
          disabled={loading}
          style={{ marginLeft: "10px", color: "red" }}
        >
          Reset Timetable
        </button>
      </div>

      {message && <p>{message}</p>}

      {timetable &&
        Object.entries(timetable).map(([day, slots]) => (
          <div key={day} style={{ marginBottom: "20px" }}>
            <h3>{day}</h3>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s, i) => (
                  <tr key={i}>
                    <td>{s.time}</td>
                    <td>{s.course}</td>
                    <td>{s.faculty}</td>
                    <td>{s.room}</td>
                    <td>{s.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}

export default AdminTimetable;
