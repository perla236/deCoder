import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  return (
    <div className="container">
      <h1>deCoder</h1>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/register")}>Register</button>
    </div>
  );
}
