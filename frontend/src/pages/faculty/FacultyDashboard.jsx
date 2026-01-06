import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";

function FacultyDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />

      <h1>Faculty Dashboard</h1>
      <p>Welcome. You can view your teaching schedule here.</p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/faculty/timetable")}
          style={{
            padding: "10px 16px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          My Timetable
        </button>
      </div>
    </div>
  );
}

export default FacultyDashboard;
