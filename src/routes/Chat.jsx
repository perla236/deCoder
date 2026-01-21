import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const token = localStorage.getItem("token");
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    let active = true;

    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:5000/chat", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Ne mogu dohvatiti poruke");
        const data = await res.json();
        if (active) setMessages(data);
      } catch (err) {
        toast.error(err.message);
      }
    };

    const poll = async () => {
      await fetchMessages();
      if (active) setTimeout(poll, 3000);
    };
    poll();

    return () => {
      active = false;
    };
  }, [navigate, token]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Greška pri slanju poruke");
        return;
      }

      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch {
      toast.error("Greška pri slanju poruke");
    }
  };

  // parse SQLite datetime "YYYY-MM-DD HH:MM:SS"
  const formatDate = (str) => {
    if (!str) return "";
    const [datePart, timePart] = str.split(" ");
    if (!datePart || !timePart) return str;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // kreiramo Date objekt
    const date = new Date(year, month - 1, day, hour + 1, minute, second);

    return date.toLocaleString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Zagreb",
    });
  };

  // Scroll logika
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    setIsAtBottom(atBottom);
  };

  const deleteMessage = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/chat/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Greška pri brisanju poruke");

      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #c9c9c9",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ color: "#000" }}>Chat</h2>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          maxHeight: 400,
          overflowY: "auto",
          border: "1px solid #d4d4d4",
          padding: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "0.5rem",
              color: msg.role === "admin" ? "red" : "#000",
            }}
          >
            <b>{msg.username}</b>{" "}
            <span style={{ fontSize: "0.8rem", color: "#555" }}>
              [{formatDate(msg.created_at)}]
            </span>
            : {msg.message}
            {token &&
              JSON.parse(atob(token.split(".")[1])).role === "admin" && (
                <button
                  onClick={() => deleteMessage(msg.id)}
                  style={{
                    marginLeft: "0.5rem",
                    background: "transparent",
                    border: "none",
                    color: "red",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ✖
                </button>
              )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          style={{ flex: 1, padding: "0.5rem", border: "1px solid #d4d4d4" }}
          placeholder="Upiši poruku..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: "0.5rem 1rem" }}>
          Pošalji
        </button>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        style={{ marginTop: "1rem" }}
      >
        Nazad na Dashboard
      </button>
    </div>
  );
}
