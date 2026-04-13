// src/components/admin/RoomForm.jsx
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function RoomForm() {
  const [formData, setFormData] = useState({ roomNumber: "", capacity: 30, type: "CLASSROOM" });
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/room`, { headers });
      const data = await res.json();
      if (res.ok) setRooms(data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch(`${API_URL}/api/admin/room`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setStatus("success");
      setFormData({ roomNumber: "", capacity: 30, type: "CLASSROOM" });
      fetchRooms();
      setTimeout(() => setStatus(""), 2500);
    } else {
      const err = await res.json();
      setStatus("error:" + (err.error || "Failed to add room"));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldRow}>
          <Field label="Room Number / Name">
            <input style={input} placeholder="e.g. L-101 or Lab-A" value={formData.roomNumber}
              onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} required />
          </Field>
          <Field label="Type">
            <select style={input} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="CLASSROOM">Classroom</option>
              <option value="LAB">Laboratory</option>
            </select>
          </Field>
          <Field label="Capacity">
            <input style={input} type="number" min="1" value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: e.target.value })} required />
          </Field>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="submit" style={submitBtn} disabled={status === "saving"}>
            {status === "saving" ? "Saving..." : "Add Room"}
          </button>
          {status === "success" && <span style={{ color: "#16a34a", fontSize: "13px" }}>✅ Room added</span>}
          {status.startsWith("error:") && <span style={{ color: "#dc2626", fontSize: "13px" }}>❌ {status.slice(6)}</span>}
        </div>
      </form>

      {rooms.length > 0 && (
        <>
          <h4 style={{ marginTop: "24px", marginBottom: "8px", color: "#374151" }}>Rooms ({rooms.length})</h4>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Room", "Type", "Capacity"].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id}>
                  <Td><strong>{r.name}</strong></Td>
                  <Td>
                    <span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                      background: r.type === "LAB" ? "#ede9fe" : "#dbeafe",
                      color: r.type === "LAB" ? "#5b21b6" : "#1e40af" }}>
                      {r.type}
                    </span>
                  </Td>
                  <Td>{r.capacity} seats</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>{label}</label>
      {children}
    </div>
  );
}
function Th({ children }) {
  return <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{children}</th>;
}
function Td({ children }) {
  return <td style={{ padding: "8px 12px", fontSize: "13px", borderBottom: "1px solid #f1f5f9", color: "#334155" }}>{children}</td>;
}

const formStyle = { display: "flex", flexDirection: "column", gap: "14px" };
const fieldRow = { display: "flex", gap: "14px", flexWrap: "wrap" };
const input = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" };
const submitBtn = { padding: "9px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "14px", cursor: "pointer" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "13px" };

export default RoomForm;