import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";

export default function Game() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Niste ulogirani");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/game-questions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        toast.error("Ne mogu dohvatiti pitanja.");
      }
    };
    fetchQuestions();
  }, []);

  if (!questions.length) return <p>Učitavanje pitanja...</p>;

  const current = questions[currentIndex];

  const handleSubmit = async () => {
    if (!current) return;

    let correct = false;
    if (current.type === "text_input" || current.type === "fill_blank") {
      correct =
        userAnswer.trim().toLowerCase() === current.answer.trim().toLowerCase();
    } else if (
      current.type === "multiple_choice" ||
      current.type === "drag_drop"
    ) {
      correct = userAnswer === current.answer;
    }

    const newScore = correct ? score + 10 : score;
    if (correct) toast.success("Točno!");
    else toast.error(`Netočno! Točan odgovor: ${current.answer}`);

    setScore(newScore);
    setUserAnswer("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await submitScore(newScore);
    }
  };

  const submitScore = async (finalScore) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Nema tokena");

    try {
      await fetch("http://localhost:5000/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: finalScore }), // username ide iz tokena
      });
      toast.success(`Igra gotova! Score: ${finalScore}`);
      navigate("/"); // vrati na home
    } catch (err) {
      toast.error("Ne mogu poslati score.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>
        Pitanje {currentIndex + 1}/{questions.length}
      </h2>
      <p>{current.question}</p>

      {(current.type === "text_input" || current.type === "fill_blank") && (
        <input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Upiši odgovor"
        />
      )}

      {current.type === "multiple_choice" && (
        <div>
          {JSON.parse(current.options).map((opt, i) => (
            <button key={i} onClick={() => setUserAnswer(opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {current.type === "drag_drop" && (
        <>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            {JSON.parse(current.options).map((opt, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text", opt)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid black",
                  cursor: "grab",
                }}
              >
                {opt}
              </div>
            ))}
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault();
              setUserAnswer(e.dataTransfer.getData("text"));
            }}
            onDragOver={(e) => e.preventDefault()}
            style={{
              padding: "1rem",
              border: "2px dashed black",
              minHeight: "40px",
              textAlign: "center",
            }}
          >
            {userAnswer || "Drop ovdje"}
          </div>
        </>
      )}

      <br />
      {(current.type === "text_input" ||
        current.type === "fill_blank" ||
        current.type === "multiple_choice" ||
        (current.type === "drag_drop" && userAnswer)) && (
        <button onClick={handleSubmit} style={{ marginTop: "1rem" }}>
          Potvrdi odgovor
        </button>
      )}

      <button
        onClick={() => navigate("/")}
        style={{ marginTop: "1rem", marginLeft: "1rem" }}
      >
        Nazad
      </button>
    </div>
  );
}
