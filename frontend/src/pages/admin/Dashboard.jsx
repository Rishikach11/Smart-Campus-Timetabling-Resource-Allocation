import { useState } from "react";
import FacultyForm from "../../components/admin/FacultyForm";
import CourseForm from "../../components/admin/CourseForm";
import RoomForm from "../../components/admin/RoomForm";
import Navbar from "../../components/navbar";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "FACULTY", label: " Faculty", description: "Add faculty members and assign departments" },
  { key: "COURSE",  label: " Courses",  description: "Create courses and set weekly hours" },
  { key: "ROOM",    label: " Rooms",    description: "Register classrooms and labs" },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("FACULTY");
  const navigate = useNavigate();

  const renderForm = () => {
    switch (activeTab) {
      case "FACULTY": return <FacultyForm />;
      case "COURSE":  return <CourseForm />;
      case "ROOM":    return <RoomForm />;
      default:        return <FacultyForm />;
    }
  };

  const activeDesc = TABS.find((t) => t.key === activeTab)?.description || "";

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <Navbar />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px" }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Manage faculty, courses, and rooms. Then generate timetables.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/timetable")}
          style={{
            padding: "10px 18px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
           Timetable Management
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "0", borderBottom: "2px solid #e2e8f0" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "none",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#3b82f6" : "#64748b",
                cursor: "pointer",
                borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                marginBottom: "-2px",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form area */}
      <div style={{
        border: "1px solid #e2e8f0",
        borderTop: "none",
        borderRadius: "0 0 10px 10px",
        padding: "24px",
        background: "#fff",
      }}>
        <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748b" }}>{activeDesc}</p>
        {renderForm()}
      </div>
    </div>
  );
}

export default AdminDashboard;