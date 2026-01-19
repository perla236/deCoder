import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/leaderboard");
        const data = await res.json();
        setLeaders(data);
      } catch (err) {
        console.error("Ne mogu dohvatiti leaderboard", err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Leaderboard</h2>
      <ol>
        {leaders.map((l, i) => (
          <li key={i}>
            {l.username} - {l.highscore} poena
          </li>
        ))}
      </ol>
      <button onClick={() => navigate("/")} style={{ marginTop: "1rem" }}>
        Nazad
      </button>
    </div>
  );
}
