// src/components/admin/CourseForm.jsx
import { useState, useEffect } from "react";

function CourseForm() {
  const [formData, setFormData] = useState({ name: "", code: "", type: "THEORY", departmentId: "", weeklyHours: 4 });
  const [courses, setCourses] = useState([]);
  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    const res = await fetch("http://localhost:5000/api/admin/course", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setCourses(data);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/admin/course", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Course Added!");
      setFormData({ name: "", code: "", type: "THEORY", departmentId: "", weeklyHours: 4 });
      fetchCourses();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <h3>Add New Course</h3>
        <input placeholder="Course Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input placeholder="Course Code (e.g., CS101)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option value="THEORY">Theory</option>
          <option value="LAB">Laboratory</option>
        </select>
        <input placeholder="Department ID (Use 1)" type="number" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} required />
        <input placeholder="Weekly Hours" type="number" value={formData.weeklyHours} onChange={e => setFormData({...formData, weeklyHours: e.target.value})} />
        <button type="submit">Save Course</button>
      </form>

      <h4>Existing Courses</h4>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Dept</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.type}</td>
              <td>{c.department?.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CourseForm;