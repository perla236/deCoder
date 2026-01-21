import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      toast.error("Lozinke se ne poklapaju");
      return;
    }

    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (data.error) toast.error(data.error);
    else {
      toast.success("Registrirani ste!");
      setTimeout(async () => {
        const loginRes = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const loginData = await loginRes.json();
        if (!loginData.error) {
          localStorage.setItem("token", loginData.token);
          toast.success("Automatski ste logirani!");
          if (loginData.role === "admin") navigate("/admin");
          else navigate("/dashboard");
        }
      }, 3000);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <input
        class="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        class="username"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <div className="passwordWrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <span
          class="hideShow"
          onClick={() => setShowPassword(!showPassword)}
          role="button"
          tabIndex="0"
        >
          {showPassword ? "⌣" : "👁"}
        </span>
      </div>

      <div className="passwordWrapper">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Ponovi password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <span class="hideShow" onClick={() => setShowConfirm(!showConfirm)}>
          {showConfirm ? "⌣" : "👁"}
        </span>
      </div>
      <br />
      <button onClick={handleRegister}>Register</button>
      <br />
      <button onClick={() => navigate("/")}>Nazad na deCoder</button>
    </div>
  );
}
