import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // Decode token to get user info
  let user = null;
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (e) {
      console.error("Invalid token");
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      backgroundColor: "#e3f2fd",
      marginBottom: "20px",
      borderRadius: "8px"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Smart Campus ({user?.role || "Guest"})
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {/* Common Links */}
        <Link to={user?.role === "ADMIN" ? "/admin/dashboard" : 
                  user?.role === "FACULTY" ? "/faculty/dashboard" : 
                  "/student/dashboard"} 
              style={{ textDecoration: "none", color: "#333" }}>
          Dashboard
        </Link>

        {/* Role-Specific Links */}
        {user?.role === "ADMIN" && (
          <Link to="/admin/timetable" style={{ textDecoration: "none", color: "#333", fontWeight: "600" }}>
            Timetable Management
          </Link>
        )}

        {user?.role === "STUDENT" && (
          <Link to="/student/timetable" style={{ textDecoration: "none", color: "#333" }}>
            My Timetable
          </Link>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.9rem", color: "#555" }}>Hi, {user?.name || "User"}</span>
          <button 
            onClick={handleLogout} 
            style={{
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              padding: "5px 15px",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;