import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    // Clear storage to break the ProtectedRoute permission
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "10px 20px", 
      background: "#007bff33", 
      color: "black",
      marginBottom: "20px",
      borderRadius: "8px"
    }}>
      <span style={{ fontWeight: "bold" }}>Smart Campus ({role})</span>
      <button 
        onClick={handleLogout} 
        style={{ 
          backgroundColor: "#ff4d4d", 
          color: "white", 
          border: "none", 
          padding: "8px 15px", 
          borderRadius: "4px",
          cursor: "pointer" 
        }}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;