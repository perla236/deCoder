import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.error) toast.error(data.error);
    else {
      localStorage.setItem("token", data.token);
      toast.success("Ulogirani ste!");
      if (data.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? "Sakrij" : "Prikaži"} lozinku
      </button>
      <br />
      <button onClick={handleLogin}>Login</button>
      <br />
      <button onClick={() => navigate("/")}>Nazad na deCoder</button>
    </div>
  );
}
