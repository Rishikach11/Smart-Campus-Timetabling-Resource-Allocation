import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function FacultyForm() {
  const [formData, setFormData] = useState({ name: "", email: "", departmentId: "", loadLimit: 16 });
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchFaculty = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/faculty`, { headers });
      const data = await res.json();
      if (res.ok) setFacultyList(data);
    } catch { /* silent */ }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/departments`, { headers });
      const data = await res.json();
      if (res.ok) setDepartments(data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch(`${API_URL}/api/admin/faculty`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setStatus("success");
      setFormData({ name: "", email: "", departmentId: "", loadLimit: 16 });
      fetchFaculty();
      setTimeout(() => setStatus(""), 2500);
    } else {
      const err = await res.json();
      setStatus("error:" + (err.error || "Failed to add faculty"));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldRow}>
          <Field label="Full Name">
            <input style={input} placeholder="Dr. Jane Smith" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </Field>
          <Field label="Email">
            <input style={input} type="email" placeholder="faculty@university.edu" value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })} required />
          </Field>
        </div>
        <div style={fieldRow}>
          <Field label="Department">
            <select
              style={input}
              value={formData.departmentId}
              onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
              required
            >
              <option value="">— Select department —</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Max Weekly Load (hrs)">
            <input style={input} type="number" min="1" max="40" value={formData.loadLimit}
              onChange={e => setFormData({ ...formData, loadLimit: e.target.value })} required />
          </Field>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="submit" style={submitBtn} disabled={status === "saving"}>
            {status === "saving" ? "Saving..." : "Add Faculty"}
          </button>
          {status === "success" && <span style={{ color: "#16a34a", fontSize: "13px" }}>✅ Faculty added</span>}
          {status.startsWith("error:") && <span style={{ color: "#dc2626", fontSize: "13px" }}>❌ {status.slice(6)}</span>}
        </div>
      </form>

      {facultyList.length > 0 && (
        <>
          <h4 style={{ marginTop: "24px", marginBottom: "8px", color: "#374151" }}>Faculty Members ({facultyList.length})</h4>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Name", "Email", "Department", "Max Load"].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {facultyList.map(f => (
                <tr key={f.id}>
                  <Td>{f.name}</Td>
                  <Td>{f.email}</Td>
                  <Td>{f.department?.name || f.department?.code || "—"}</Td>
                  <Td>{f.maxWeeklyLoad} hrs/week</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// Shared sub-components
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

export default FacultyForm;