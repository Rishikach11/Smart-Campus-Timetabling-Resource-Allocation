// src/components/admin/RoomForm.jsx
import { useState, useEffect } from "react";

function RoomForm() {
  const [formData, setFormData] = useState({ roomNumber: "", capacity: 30, type: "CLASSROOM" });
  const [rooms, setRooms] = useState([]);
  const token = localStorage.getItem("token");

  const fetchRooms = async () => {
    const res = await fetch("http://localhost:5000/api/admin/room", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setRooms(data);
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/admin/room", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Room Added!");
      setFormData({ roomNumber: "", capacity: 30, type: "CLASSROOM" });
      fetchRooms();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <h3>Add New Room</h3>
        <input placeholder="Room Number (e.g., L-101)" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} required />
        <input placeholder="Capacity" type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option value="CLASSROOM">Classroom</option>
          <option value="LAB">Laboratory</option>
        </select>
        <button type="submit">Save Room</button>
      </form>

      <h4>Existing Rooms</h4>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th>Room Number</th>
            <th>Capacity</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.capacity}</td>
              <td>{r.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoomForm;