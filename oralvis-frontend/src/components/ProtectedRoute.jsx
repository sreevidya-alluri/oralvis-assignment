import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ requiredRole }) => {
  const token = getToken();

  
  if (!token) {
    console.log("No token found, redirecting to /login");
    return <Navigate to="/login" />;
  }

  try {
   
    const decoded = jwtDecode(token);
    console.log("Decoded JWT in ProtectedRoute:", decoded);

  
    if (decoded.role !== requiredRole) {
      console.log(`Role mismatch. Required: ${requiredRole}, Found: ${decoded.role}`);
      return <Navigate to="/login" />;
    }

   
    return <Outlet />;
  } catch (error) {
   
    console.error("Error decoding JWT:", error);
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;