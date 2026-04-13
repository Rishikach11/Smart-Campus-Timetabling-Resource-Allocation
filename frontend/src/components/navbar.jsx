import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  let user = null;
  if (token) {
    try {
      user = jwtDecode(token);
    } catch {
      // invalid token — will be handled by ProtectedRoute
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin/dashboard" :
    user?.role === "FACULTY" ? "/faculty/dashboard" :
    "/student/dashboard";

  const navLinks = [];
  if (user?.role === "ADMIN") {
    navLinks.push({ to: "/admin/timetable", label: "Timetable Management" });
  }
  if (user?.role === "STUDENT") {
    navLinks.push({ to: "/student/timetable", label: "My Timetable" });
  }
  if (user?.role === "FACULTY") {
    navLinks.push({ to: "/faculty/timetable", label: "My Schedule" });
  }

  const isActive = (path) => location.pathname === path;

  const roleBadgeColor = {
    ADMIN: { bg: "#dbeafe", color: "#1e40af" },
    FACULTY: { bg: "#d1fae5", color: "#065f46" },
    STUDENT: { bg: "#fef3c7", color: "#92400e" },
  };
  const badge = roleBadgeColor[user?.role] || { bg: "#f1f5f9", color: "#64748b" };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 20px",
      background: "#fff",
      borderBottom: "1px solid #e2e8f0",
      marginBottom: "28px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      {/* Brand */}
      <Link
        to={dashboardPath}
        style={{ fontWeight: 700, fontSize: "17px", color: "#0f172a", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
      >
        🎓 <span>Smart Campus</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <NavLink to={dashboardPath} active={isActive(dashboardPath)}>Dashboard</NavLink>
        {navLinks.map((link) => (
          <NavLink key={link.to} to={link.to} active={isActive(link.to)}>
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* User info + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{
          fontSize: "13px",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span style={{ fontWeight: 500 }}>{user?.name || "User"}</span>
          <span style={{
            padding: "2px 8px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 700,
            background: badge.bg,
            color: badge.color,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {user?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        padding: "6px 14px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: active ? 600 : 400,
        color: active ? "#3b82f6" : "#475569",
        background: active ? "#eff6ff" : "transparent",
        textDecoration: "none",
        transition: "background 0.15s",
      }}
    >
      {children}
    </Link>
  );
}

export default Navbar;