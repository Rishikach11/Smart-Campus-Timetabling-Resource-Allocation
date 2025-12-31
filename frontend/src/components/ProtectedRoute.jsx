import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // This log will tell you exactly why you're being redirected
  console.log("Guard Check - Role in Storage:", role, "Allowed Roles:", allowedRoles);

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // Ensure this comparison is true (e.g., "ADMIN" is in ["ADMIN"])
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;