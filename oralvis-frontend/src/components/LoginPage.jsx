import { useState } from "react";
import axios from "axios";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const token = res.data.token;
      setToken(token);

      // Decode the JWT token to get the role
      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);
      const redirectPath = decoded.role === "Technician" ? "/technician" : "/dentist";
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default LoginPage;