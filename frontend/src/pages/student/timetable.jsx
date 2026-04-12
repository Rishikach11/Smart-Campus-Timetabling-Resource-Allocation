import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

const API_URL = import.meta.env.VITE_API_URL;

const DAYS_ORDER = ["MON", "TUE", "WED", "THU", "FRI"];
const DAY_LABELS = { MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday" };

function StudentTimetable() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [timetable, setTimetable] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | generated | pending | error | no-batch
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        // Step 1: resolve batchId from the authenticated user
        const meRes = await fetch(`${API_URL}/api/me`, { headers });
        if (!meRes.ok) throw new Error("Could not verify identity");

        const me = await meRes.json();
        const batchId = me?.batch?.id;

        if (!batchId) {
          setStatus("no-batch");
          setMessage("You are not assigned to any batch. Please contact your administrator.");
          return;
        }

        // Step 2: fetch timetable for this batch
        const res = await fetch(`${API_URL}/api/timetable/batch/${batchId}`, { headers });
        const data = await res.json();

        if (data.generated && Object.keys(data.timetable || {}).length > 0) {
          setTimetable(data.timetable);
          setStatus("generated");
        } else {
          setStatus("pending");
          setMessage("Your timetable has not been generated yet. Please check back later.");
        }
      } catch {
        setStatus("error");
        setMessage("Failed to load timetable. Please try again.");
      }
    };

    fetchTimetable();
  }, []);

  const sortedDays = timetable ? DAYS_ORDER.filter((d) => timetable[d]) : [];

  const statusColors = {
    generated: { bg: "#d1fae5", color: "#065f46", label: "✅ Generated" },
    pending:   { bg: "#fef3c7", color: "#92400e", label: "⏳ Pending" },
    loading:   { bg: "#f1f5f9", color: "#64748b", label: "Loading..." },
    error:     { bg: "#fee2e2", color: "#991b1b", label: "❌ Error" },
    "no-batch":{ bg: "#f1f5f9", color: "#64748b", label: "📭 No Batch" },
  };
  const s = statusColors[status] || statusColors.pending;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "920px", margin: "0 auto" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>My Timetable</h1>
        <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, background: s.bg, color: s.color }}>
          {s.label}
        </span>
      </div>

      {message && (
        <p style={{ color: "#555", padding: "12px 16px", background: "#f5f5f5", borderRadius: "6px", marginBottom: "20px" }}>
          {message}
        </p>
      )}

      {timetable && sortedDays.length === 0 && (
        <p style={{ color: "#aaa", fontStyle: "italic" }}>No classes scheduled this week.</p>
      )}

      {timetable && sortedDays.map((day) => (
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
                    <td style={td}>{s.time}</td>
                    <td style={td}><strong>{s.course}</strong></td>
                    <td style={td}>{s.faculty}</td>
                    <td style={td}>{s.room}</td>
                    <td style={td}>
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
    </div>
  );
}

const td = { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", color: "#334155" };

export default StudentTimetable;
