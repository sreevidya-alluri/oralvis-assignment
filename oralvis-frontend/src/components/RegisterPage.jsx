import { useState } from "react";
import axios from "axios";
import { setToken } from "../utils/auth";
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
      // Register the user
      await axios.post(`${API_URL}/register`, form);
      setSuccess("User registered successfully! Logging in...");

      // Automatically log in the user
      const loginRes = await axios.post(`${API_URL}/login`, {
        email: form.email,
        password: form.password,
      });

      // Store the JWT token
      setToken(loginRes.data.token);

      // Redirect based on role
      const redirectPath = form.role === "Technician" ? "/technician" : "/dentist";
      setTimeout(() => navigate(redirectPath), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration or login failed");
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
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
}

export default RegisterPage;