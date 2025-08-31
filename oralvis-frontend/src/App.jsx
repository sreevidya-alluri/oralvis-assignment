import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import TechnicalDashboard from "./components/TechnicalDashboard";
import DentistDashboard from "./components/DentistDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./components/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute requiredRole="Technician" />}>
          <Route path="/technician" element={<TechnicalDashboard />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="Dentist" />}>
          <Route path="/dentist" element={<DentistDashboard />} />
        </Route>
        <Route path="*" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;