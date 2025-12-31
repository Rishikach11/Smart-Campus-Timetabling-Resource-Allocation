import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Simple function to decode JWT payload
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 401) {
        throw new Error("Invalid email or password");
    }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Store token
      localStorage.setItem("token", data.token); 

      // Decode the role from the token
      const decoded = parseJwt(data.token);
      if (!decoded || !decoded.role) throw new Error("Invalid token data"); 

      localStorage.setItem("role", decoded.role);

      // Redirect based on role
      if (decoded.role === "ADMIN") {
        navigate("/admin/dashboard"); 
      } else {
        navigate("/student/timetable"); 
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", border: "1px solid #ccc" }}>
      <h2>Smart Campus Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label><br/>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label><br/>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%" }} />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ width: "100%", padding: "10px" }}>Login</button>
      </form>
    </div>
  );
}

export default Login;