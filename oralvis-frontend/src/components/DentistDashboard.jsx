import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import jsPDF from "jspdf";

import { useNavigate } from "react-router-dom";
import '../styles/DentistDashboard.css';

const API_URL = import.meta.env.VITE_API_URL;

function DentistDashboard() {
  const [scans, setScans] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/scans`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(res => setScans(res.data));
  }, []);

  const handleDownload = (scan) => {
    const doc = new jsPDF();
    doc.text(`Patient: ${scan.patientName}`, 10, 10);
    doc.text(`ID: ${scan.patientId}`, 10, 20);
    doc.text(`Scan Type: ${scan.scanType}`, 10, 30);
    doc.text(`Region: ${scan.region}`, 10, 40);
    doc.text(`Date: ${scan.uploadDate}`, 10, 50);
    doc.addImage(scan.imageUrl, "JPEG", 10, 60, 120, 80); // May need conversion for some images
    doc.save(`${scan.patientName}_scan_report.pdf`);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    console.log("JWT token removed from localStorage");
    navigate("/login");
  };

  return (
    <div className="dentist-container">
      <div className="dentist-dashboard">
        <h2>Dental Scans</h2>
        <table>
          <thead>
            <tr><th>Name</th><th>ID</th><th>Type</th><th>Region</th><th>Date</th><th>Image</th><th>PDF</th></tr>
          </thead>
          <tbody>
            {scans.map(scan => (
              <tr key={scan.id}>
                <td>{scan.patientName}</td>
                <td>{scan.patientId}</td>
                <td>{scan.scanType}</td>
                <td>{scan.region}</td>
                <td>{scan.uploadDate}</td>
                <td>
                  <button onClick={() => handleImageClick(scan.imageUrl)}>View Image</button>
                </td>
                <td>
                  <button onClick={() => handleDownload(scan)}>Download Report</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={handleLogout} className="logout-button">
          Logout
        </button>
        {selectedImage && (
          <div className="modal active">
            <div className="modal-content">
              <button className="close-modal" onClick={closeModal}>×</button>
              <img src={selectedImage} alt="Scan" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DentistDashboard;