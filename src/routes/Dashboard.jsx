import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [highscore, setHighscore] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwt_decode(token);
      setUsername(decoded.username);

      // Dohvati vlastiti highscore
      fetch(`http://localhost:5000/user-score/${decoded.username}`)
        .then((res) => res.json())
        .then((data) => setHighscore(data.highscore))
        .catch(() => toast.error("Ne mogu dohvatiti tvoj rezultat."));
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info("Odjavljeni ste");
    navigate("/");
  };

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <h1>Dobrodošli, {username}!</h1>
      <p>Vaš najbolji rezultat: {highscore} bodova</p>

      <div style={{ margin: "1rem 0" }}>
        <button
          onClick={() => navigate("/game")}
          style={{ marginRight: "1rem" }}
        >
          🎮 Igraj
        </button>
        <button
          onClick={() => navigate("/leaderboard")}
          style={{ marginRight: "1rem" }}
        >
          🏆 Leaderboard
        </button>

        <button
          onClick={() => navigate("/chat")}
          style={{ marginRight: "1rem" }}
        >
          💬 Chat
        </button>

        <button class="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
