import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", role: "Technician" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/register`, form);
      setSuccess("User registered successfully!");
      
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="Technician">Technician</option>
          <option value="Dentist">Dentist</option>
        </select>
        <button type="submit">Register</button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success} <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Login</a></div>}
        <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Already have an account? Login</a>
      
      </form>
    </div>
  );
}

export default RegisterPage;