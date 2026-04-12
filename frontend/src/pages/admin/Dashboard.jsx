import { useState } from "react";
import FacultyForm from "../../components/admin/FacultyForm";
import CourseForm from "../../components/admin/CourseForm";
import Navbar from "../../components/navbar"; 
import RoomForm from "../../components/admin/RoomForm";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("FACULTY");
  const navigate = useNavigate();

  const renderForm = () => {
    switch (activeTab) {
      case "FACULTY": return <FacultyForm />;
      case "COURSE": return <CourseForm />;
      case "ROOM": return <RoomForm />;
      default: return <FacultyForm />;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Navbar /> 
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => navigate("/admin/timetable")}>Go to Timetable</button>
      </div>

      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        {["FACULTY", "COURSE", "ROOM"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: activeTab === tab ? "#007bff33" : "#007bff33",
              color: activeTab === tab ? "black" : "black"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
        {renderForm()}
      </div>
    </div>
  );
}

export default AdminDashboard;