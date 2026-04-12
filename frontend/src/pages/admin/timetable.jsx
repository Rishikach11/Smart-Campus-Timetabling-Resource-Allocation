import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

const API_URL = import.meta.env.VITE_API_URL;

const DAYS_ORDER = ["MON", "TUE", "WED", "THU", "FRI"];
const DAY_LABELS = { MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday" };

function AdminTimetable() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [timetableStatus, setTimetableStatus] = useState("pending"); // pending | generated | partial
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

useEffect(() => {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  fetch(`${API_URL}/api/batch`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => res.json())
    .then(setBatches)
    .catch(() => setMessage("Failed to load batches"));
}, []);

  const loadTimetable = async (id) => {
    if (!id) { setTimetable(null); return; }
    try {
      const res = await fetch(`${API_URL}/api/timetable/batch/${id}`, { headers });
      const data = await res.json();
      if (data.generated) {
        setTimetable(data.timetable);
        const totalSlots = Object.values(data.timetable).flat().length;
        setTimetableStatus(totalSlots > 0 ? "generated" : "partial");
      } else {
        setTimetable(null);
        setTimetableStatus("pending");
      }
    } catch {
      setTimetable(null);
      setTimetableStatus("pending");
    }
  };

  const handleBatchChange = (e) => {
    const val = e.target.value;
    setBatchId(val);
    setMessage("");
    setTimetable(null);
    setTimetableStatus("pending");
    if (val) loadTimetable(val);
  };

  const generateTimetable = async () => {
    if (!batchId) { setMessage("Please select a batch first."); return; }
    setLoading(true);
    setMessage("Generating timetable...");
    try {
      const res = await fetch(`${API_URL}/api/generate/batch/${batchId}`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        const created = data.entriesCreated ?? 0;
        if (created > 0) {
          setMessage(`✅ Timetable generated — ${created} entries scheduled.`);
          setTimetableStatus("generated");
        } else {
          setMessage("⚠️ Generation completed but no slots could be allocated due to constraints.");
          setTimetableStatus("partial");
        }
        await loadTimetable(batchId);
      } else {
        setMessage(`❌ ${data.message || "Generation failed"}`);
      }
    } catch {
      setMessage("❌ Generation failed. Check the server.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndRegenerate = async () => {
    setShowConfirm(false);
    if (!batchId) return;
    setLoading(true);
    setMessage("Resetting timetable...");
    try {
      // Step 1: Reset
      const resetRes = await fetch(`${API_URL}/api/timetable/batch/${batchId}`, {
        method: "DELETE",
        headers,
      });
      if (!resetRes.ok) throw new Error("Reset failed");
      const resetData = await resetRes.json();
      setMessage(`Reset complete (${resetData.deleted} entries removed). Regenerating...`);
      setTimetable(null);
      setTimetableStatus("pending");

      // Step 2: Regenerate
      const genRes = await fetch(`${API_URL}/api/generate/batch/${batchId}`, {
        method: "POST",
        headers,
      });
      const genData = await genRes.json();
      if (genRes.ok) {
        const created = genData.entriesCreated ?? 0;
        setMessage(`✅ Reset & regenerated — ${created} entries scheduled.`);
        setTimetableStatus(created > 0 ? "generated" : "partial");
        await loadTimetable(batchId);
      } else {
        setMessage(`❌ Reset succeeded but generation failed: ${genData.message}`);
      }
    } catch (e) {
      setMessage(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find((b) => String(b.id) === String(batchId));
  const sortedDays = timetable ? DAYS_ORDER.filter((d) => timetable[d]) : [];

  const statusConfig = {
    generated: { bg: "#d1fae5", color: "#065f46", label: "✅ Generated" },
    partial:   { bg: "#fef3c7", color: "#92400e", label: "⚠️ Partial" },
    pending:   { bg: "#f1f5f9", color: "#64748b", label: "📋 Pending" },
  };
  const sc = statusConfig[timetableStatus] || statusConfig.pending;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      <Navbar />
      <h1 style={{ marginBottom: "20px" }}>Timetable Management</h1>

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
            Select Batch
          </label>
          <select
            value={batchId}
            onChange={handleBatchChange}
            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", minWidth: "260px", background: "#fff" }}
          >
            <option value="">— Choose a batch —</option>
            {batches.map((b, idx) => (
              <option key={b.id} value={b.id}>
                {b.department?.name} ({b.department?.code}) · Sem {b.semester} · Batch #{idx + 1}
              </option>
            ))}
          </select>
        </div>

        {batchId && (
          <span style={{ marginTop: "20px", padding: "4px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, background: sc.bg, color: sc.color }}>
            {sc.label}
          </span>
        )}

        <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
          <button
            onClick={generateTimetable}
            disabled={!batchId || loading}
            style={btnStyle("#3b82f6", loading || !batchId)}
          >
            {loading ? "Working..." : "Generate Timetable"}
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={!batchId || loading}
            style={btnStyle("#ef4444", loading || !batchId)}
          >
            Reset & Regenerate
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", maxWidth: "420px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ marginTop: 0, color: "#1e293b" }}>Confirm Reset</h2>
            <p style={{ color: "#475569" }}>
              This will <strong>delete all existing timetable entries</strong> for{" "}
              <strong>{selectedBatch?.department?.name} Sem {selectedBatch?.semester}</strong> and regenerate from scratch.
            </p>
            <p style={{ color: "#ef4444", fontSize: "13px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button onClick={() => setShowConfirm(false)} style={btnStyle("#94a3b8", false)}>
                Cancel
              </button>
              <button onClick={resetAndRegenerate} style={btnStyle("#ef4444", false)}>
                Yes, Reset & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status message */}
      {message && (
        <div style={{ padding: "12px 16px", borderRadius: "6px", marginBottom: "20px", background: message.startsWith("✅") ? "#f0fdf4" : message.startsWith("⚠️") ? "#fffbeb" : message.startsWith("❌") ? "#fef2f2" : "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontSize: "14px" }}>
          {message}
        </div>
      )}

      {/* Timetable Preview */}
      {!batchId && (
        <p style={{ color: "#94a3b8", fontStyle: "italic" }}>Select a batch to view or generate its timetable.</p>
      )}

      {batchId && !timetable && timetableStatus === "pending" && !loading && (
        <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No timetable generated for this batch yet.</p>
      )}

      {timetable && (
        <>
          <h2 style={{ marginBottom: "16px", color: "#1e293b" }}>
            Timetable Preview — {selectedBatch?.department?.name} Sem {selectedBatch?.semester}
          </h2>
          {sortedDays.length === 0 && (
            <p style={{ color: "#aaa", fontStyle: "italic" }}>No entries to display.</p>
          )}
          {sortedDays.map((day) => (
            <div key={day} style={{ marginBottom: "28px" }}>
              <h3 style={{ marginBottom: "8px", color: "#1e293b", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px" }}>
                {DAY_LABELS[day] || day}
              </h3>
              {timetable[day].length === 0 ? (
                <p style={{ color: "#aaa", fontStyle: "italic" }}>No classes today</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Time", "Course", "Faculty", "Room", "Type"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: "13px", color: "#475569", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetable[day].map((s, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                        <td style={tdStyle}>{s.time}</td>
                        <td style={tdStyle}><strong>{s.course}</strong></td>
                        <td style={tdStyle}>{s.faculty}</td>
                        <td style={tdStyle}>{s.room}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 500,
                            background: s.type === "LAB" ? "#ede9fe" : "#dbeafe",
                            color: s.type === "LAB" ? "#5b21b6" : "#1e40af" }}>
                            {s.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const tdStyle = { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", color: "#334155" };

const btnStyle = (bg, disabled) => ({
  padding: "8px 16px",
  background: disabled ? "#cbd5e1" : bg,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 600,
  fontSize: "14px",
  transition: "opacity 0.15s",
});

export default AdminTimetable;
