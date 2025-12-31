import { useState, useEffect } from "react";

function FacultyForm() {
  const [formData, setFormData] = useState({ name: "", email: "", departmentId: "", loadLimit: 16 });
  const [facultyList, setFacultyList] = useState([]);
  const token = localStorage.getItem("token");

  // Function to fetch faculty
  const fetchFaculty = async () => {
    const res = await fetch("http://localhost:5000/api/admin/faculty", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setFacultyList(data);
  };

  useEffect(() => { fetchFaculty(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/admin/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Faculty Added!");
      setFormData({ name: "", email: "", departmentId: "", loadLimit: 16 });
      fetchFaculty(); // Refresh the list
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
        <h3>Add New Faculty</h3>
        <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input placeholder="Department ID (Use 1 for CS)" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} required />
        <button type="submit">Save Faculty</button>
      </form>

      {/* --- List View --- */}
      <h4>Existing Faculty</h4>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Dept</th>
            <th>Max Load</th>
          </tr>
        </thead>
        <tbody>
          {facultyList.map(f => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.email}</td>
              <td>{f.department?.code}</td>
              <td>{f.maxWeeklyLoad} hrs</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FacultyForm;