import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwt_decode(token);

    if (adminOnly && decoded.role !== "admin")
      return <Navigate to="/dashboard" />;
    if (!adminOnly && decoded.role === "admin") return <Navigate to="/admin" />;

    return children;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/" />;
  }
}
