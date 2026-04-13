// src/components/admin/CourseForm.jsx
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function CourseForm() {
  const [formData, setFormData] = useState({ name: "", code: "", type: "THEORY", departmentId: "", weeklyHours: 4 });
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/course`, { headers });
      const data = await res.json();
      if (res.ok) setCourses(data);
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
    fetchCourses();
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch(`${API_URL}/api/admin/course`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setStatus("success");
      setFormData({ name: "", code: "", type: "THEORY", departmentId: "", weeklyHours: 4 });
      fetchCourses();
      setTimeout(() => setStatus(""), 2500);
    } else {
      const err = await res.json();
      setStatus("error:" + (err.error || "Failed to add course"));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldRow}>
          <Field label="Course Name">
            <input style={input} placeholder="Data Structures" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </Field>
          <Field label="Course Code">
            <input style={input} placeholder="CS201" value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })} required />
          </Field>
        </div>
        <div style={fieldRow}>
          <Field label="Type">
            <select style={input} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="THEORY">Theory</option>
              <option value="LAB">Laboratory</option>
            </select>
          </Field>
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
          <Field label="Weekly Hours">
            <input style={input} type="number" min="1" max="20" value={formData.weeklyHours}
              onChange={e => setFormData({ ...formData, weeklyHours: e.target.value })} required />
          </Field>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="submit" style={submitBtn} disabled={status === "saving"}>
            {status === "saving" ? "Saving..." : "Add Course"}
          </button>
          {status === "success" && <span style={{ color: "#16a34a", fontSize: "13px" }}>✅ Course added</span>}
          {status.startsWith("error:") && <span style={{ color: "#dc2626", fontSize: "13px" }}>❌ {status.slice(6)}</span>}
        </div>
      </form>

      {courses.length > 0 && (
        <>
          <h4 style={{ marginTop: "24px", marginBottom: "8px", color: "#374151" }}>Courses ({courses.length})</h4>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Code", "Name", "Type", "Department", "Hrs/Week"].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <Td><code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: "3px" }}>{c.code}</code></Td>
                  <Td>{c.name}</Td>
                  <Td>
                    <span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "11px", fontWeight: 600,
                      background: c.type === "LAB" ? "#ede9fe" : "#dbeafe",
                      color: c.type === "LAB" ? "#5b21b6" : "#1e40af" }}>
                      {c.type}
                    </span>
                  </Td>
                  <Td>{c.department?.name || c.department?.code || "—"}</Td>
                  <Td>{c.weeklyHours}</Td>
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

export default CourseForm;