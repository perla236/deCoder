import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";

export default function Admin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState("dashboard"); // "dashboard", "users", "questions"
  const [editingQuestion, setEditingQuestion] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const decoded = jwt_decode(token);
      setUsername(decoded.username);
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info("Odjavljeni ste");
    navigate("/");
  };

  // --- Users ---
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Ne mogu dohvatiti korisnike");
    }
  };

  const toggleAdmin = async (usernameTarget, makeAdmin) => {
    if (usernameTarget === "adminlovro") {
      toast.error("Super admina ne možeš mijenjati!");
      return;
    }

    const role = makeAdmin ? "admin" : "user";

    try {
      const res = await fetch("http://localhost:5000/admin/user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: usernameTarget, role }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Greška pri promjeni role.");
    }
  };

  // --- Questions ---
  const fetchQuestions = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/questions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestions(data);
    } catch {
      toast.error("Ne mogu dohvatiti pitanja");
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Obrisati pitanje?")) return;
    try {
      await fetch(`http://localhost:5000/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Pitanje obrisano");
      fetchQuestions();
    } catch {
      toast.error("Ne mogu obrisati pitanje");
    }
  };

  const saveQuestion = async (q) => {
    try {
      const method = q.id ? "PUT" : "POST";
      const url = q.id
        ? `http://localhost:5000/admin/questions/${q.id}`
        : "http://localhost:5000/admin/questions";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...q,
          options: Array.isArray(q.options)
            ? JSON.stringify(q.options)
            : q.options,
        }),
      });

      toast.success("Pitanje spremljeno");
      setEditingQuestion(null);
      fetchQuestions();
    } catch {
      toast.error("Ne mogu spremiti pitanje");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dobrodošli, {username}!</h1>
      <button onClick={handleLogout}>Logout</button>
      <hr />
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            setView("users");
            fetchUsers();
          }}
          style={{ marginRight: "1rem" }}
        >
          Administratori
        </button>
        <button
          onClick={() => {
            setView("questions");
            fetchQuestions();
          }}
        >
          Pitanja
        </button>

        <button
          onClick={() => navigate("/chat")}
          style={{ marginRight: "1rem" }}
        >
          💬 Chat
        </button>
      </div>

      {view === "users" && (
        <div>
          <h2>Korisnici</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.username !== "adminlovro" && (
                      <>
                        <button
                          onClick={() => toggleAdmin(u.username, true)}
                          style={{ marginRight: "0.5rem" }}
                        >
                          Postavi admin
                        </button>
                        <button onClick={() => toggleAdmin(u.username, false)}>
                          Makni admin
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "questions" && (
        <div>
          <h2>Pitanja</h2>
          <button
            onClick={() =>
              setEditingQuestion({
                question: "",
                type: "text_input",
                options: [],
                answer: "",
              })
            }
          >
            Novo pitanje
          </button>

          {editingQuestion && (
            <div
              style={{
                border: "1px solid black",
                padding: "1rem",
                margin: "1rem 0",
              }}
            >
              <input
                placeholder="Pitanje"
                value={editingQuestion.question}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    question: e.target.value,
                  })
                }
              />
              <select
                value={editingQuestion.type}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    type: e.target.value,
                  })
                }
              >
                <option value="text_input">Text Input</option>
                <option value="fill_blank">Fill Blank</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="drag_drop">Drag & Drop</option>
              </select>
              <input
                placeholder="Odgovor"
                value={editingQuestion.answer}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    answer: e.target.value,
                  })
                }
              />
              {(editingQuestion.type === "multiple_choice" ||
                editingQuestion.type === "drag_drop") && (
                <input
                  placeholder="Opcije (komama odvojene)"
                  value={editingQuestion.options.join(",")}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      options: e.target.value.split(","),
                    })
                  }
                />
              )}
              <button onClick={() => saveQuestion(editingQuestion)}>
                Spremi
              </button>
              <button onClick={() => setEditingQuestion(null)}>Odustani</button>
            </div>
          )}

          <ul>
            {questions.map((q) => (
              <li key={q.id}>
                {q.question} ({q.type})
                <button
                  onClick={() =>
                    setEditingQuestion({
                      ...q,
                      options: q.options ? JSON.parse(q.options) : [],
                    })
                  }
                  style={{ marginLeft: "0.5rem" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
