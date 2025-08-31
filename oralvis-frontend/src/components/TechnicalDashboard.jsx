import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/TechnicalDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function TechnicalDashboard() {
  const [form, setForm] = useState({ patientName: "", patientId: "", scanType: "", region: "" });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log(`Form field changed: ${e.target.name} = ${e.target.value}`);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("jwt");
    console.log("JWT Token from localStorage:", token);
    if (!token) {
      setMessage("Authentication required. Please login.");
      console.error("No JWT token found in localStorage.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!image) {
      setMessage("Please select an image file.");
      console.error("No file selected.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      formData.append("image", image);
      console.log("Uploading formData fields:", [...formData.entries()]);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type header for FormData manually
        },
      });

      console.log("Upload response:", response.data);
      setMessage("Scan uploaded successfully!");
      // Reset form, image, and file input
      setForm({ patientName: "", patientId: "", scanType: "", region: "" });
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input value
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Upload failed:", error.response || error);
      setMessage("Upload failed. Check console for details.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    console.log("JWT token removed from localStorage");
    navigate("/login");
  };

  return (
    <div className="technician-container">
      <form className="technician-form" onSubmit={handleSubmit}>
        <h2>Upload Dental Scan</h2>
        <input name="patientName" placeholder="Name" value={form.patientName} onChange={handleChange} required />
        <input name="patientId" placeholder="Patient ID" value={form.patientId} onChange={handleChange} required />
        <input name="scanType" placeholder="Scan Type" value={form.scanType} onChange={handleChange} required />
        <input name="region" placeholder="Region" value={form.region} onChange={handleChange} required />
        <input type="file" accept="image/*" onChange={handleFile} required ref={fileInputRef} />
        <button type="submit">Upload</button>
        {message && <div className={message.includes("successfully") ? "message success" : "message error"}>{message}</div>}
        <button type="button" onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </form>
    </div>
  );
}

export default TechnicalDashboard;