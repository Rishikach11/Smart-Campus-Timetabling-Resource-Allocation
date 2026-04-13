import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../components/navbar";

function FacultyDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let user = null;
  try { user = token ? jwtDecode(token) : null; } catch { /* ignore */ }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Navbar />

      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 6px" }}>Welcome, {user?.name || "Faculty"} </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
          View your assigned teaching schedule for the week.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <DashboardCard
          icon="📋"
          title="My Teaching Schedule"
          description="See all your assigned classes, rooms, and batch details."
          action="View Schedule"
          onClick={() => navigate("/faculty/timetable")}
          color="#10b981"
        />
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, description, action, onClick, color }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: "#0f172a" }}>{title}</h3>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>{description}</p>
      <button
        onClick={onClick}
        style={{
          padding: "8px 16px",
          background: color,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {action}
      </button>
    </div>
  );
}

export default FacultyDashboard;
