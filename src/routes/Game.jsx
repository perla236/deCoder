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
      {current.type !== "drag_drop" && <p>{current.question}</p>}

      {(current.type === "text_input" || current.type === "fill_blank") && (
        <input
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Upiši odgovor"
        />
      )}

      {current.type === "multiple_choice" && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {JSON.parse(current.options).map((opt, i) => {
            // Provjeravamo je li ovo dugme ono koje je korisnik kliknuo
            const isSelected = userAnswer === opt;

            return (
              <button
                key={i}
                onClick={() => setUserAnswer(opt)}
                style={{
                  padding: "10px 20px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.33)",
                  cursor: "pointer",
                  backgroundColor: isSelected
                    ? "#2196f3"
                    : "rgba(240, 240, 240, 0)",
                  //color: isSelected ? "white" : "black",
                  color: "white",
                  borderRadius: "5px",
                  transition: "all 0.2s ease", // Da promjena boje bude glatka
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {current.type === "drag_drop" && (
        <div style={{ marginBottom: "2rem" }}>
          {/* REČENICA S DROP ZONOM */}
          <div>
            {current.question.split("____").map((part, index, array) => (
              <span key={index}>
                {part}
                {index < array.length - 1 && (
                  <span
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedValue = e.dataTransfer.getData("text");
                      setUserAnswer(droppedValue);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "120px",
                      height: "40px",
                      borderBottom: "3px solid #333",
                      margin: "0 10px",
                      backgroundColor: userAnswer
                        ? "rgba(227, 242, 253, 0)"
                        : "rgba(245, 245, 245, 0)",
                      borderRadius: "4px",
                      verticalAlign: "middle",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => setUserAnswer("")} // Klik na rupu vraća odgovor nazad
                    title="Klikni za uklanjanje"
                  >
                    {userAnswer || "povuci ovdje"}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* DOSTUPNE OPCIJE (Prikazuju se samo one koje NISU odabrane) */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "1rem",
            }}
          >
            {JSON.parse(current.options)
              .filter((opt) => opt !== userAnswer) // Sakrij opciju ako je već u rečenici
              .map((opt, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text", opt)}
                  style={{
                    padding: "0.8rem 1.2rem",
                    border: "2px solid rgba(33, 149, 243, 0)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(245, 245, 245, 0)",
                    cursor: "grab",
                    fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.33)",
                  }}
                >
                  {opt}
                </div>
              ))}
          </div>

          {userAnswer && (
            <p style={{ fontSize: "0.8rem", color: "gray", marginTop: "10px" }}>
              * Klikni na riječ u rečenici ako je želiš maknuti.
            </p>
          )}
        </div>
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
        class="logout"
        onClick={() => navigate("/")}
        style={{ marginTop: "1rem", marginLeft: "1rem" }}
      >
        Nazad
      </button>
    </div>
  );
}
