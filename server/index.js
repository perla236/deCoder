import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const PORT = 5000;
const SECRET = "tajni_kljuc";

const db = new sqlite3.Database("./db.sqlite");

// Kreiranje tablica
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      type TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      highscore INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )
  `);

  // Dodavanje super admina ako ne postoji
  const adminUsername = "adminlovro";
  const adminPassword = "adminlovro";
  const adminEmail = "admin@domain.com";
  const hash = bcrypt.hashSync(adminPassword, 10);

  db.get(
    "SELECT * FROM users WHERE username=?",
    [adminUsername],
    (err, row) => {
      if (!row) {
        db.run(
          "INSERT INTO users(username, email, password, role) VALUES (?,?,?,?)",
          [adminUsername, adminEmail, hash, "admin"],
          function (err) {
            if (err)
              console.log("Greška prilikom kreiranja admina:", err.message);
            else
              console.log(
                `Admin korisnik kreiran: ${adminUsername} / ${adminPassword}`
              );
          }
        );
      }
    }
  );
});

app.use(cors());
app.use(express.json());

// ======== Auth ========
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !email.includes("@"))
    return res.status(400).json({ error: "Email nije validan" });
  if (!password || password.length < 6)
    return res
      .status(400)
      .json({ error: "Password mora imati minimalno 6 znakova" });

  db.get(
    "SELECT * FROM users WHERE username=? OR email=?",
    [username, email],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (user) return res.status(400).json({ error: "Korisnik već postoji" });

      const hash = bcrypt.hashSync(password, 10);
      db.run(
        "INSERT INTO users(username,email,password,role) VALUES (?,?,?,?)",
        [username, email, hash, "user"],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          const token = jwt.sign(
            { id: this.lastID, username, role: "user" },
            SECRET,
            { expiresIn: "1h" }
          );
          res.json({ token, role: "user", username });
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username=?", [username], (err, user) => {
    if (!user) return res.status(400).json({ error: "User not found" });
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role, username: user.username });
  });
});

// Middleware za auth
function verifyAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware za admin
function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ======== Admin rute ========
app.get("/admin/users", verifyAdmin, (req, res) => {
  db.all("SELECT id,username,email,role FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/admin/user-role", verifyAdmin, (req, res) => {
  const { username, role } = req.body;
  if (username === "adminlovro")
    return res.status(400).json({ error: "Ne možeš mijenjati super admina" });
  if (!["user", "admin"].includes(role))
    return res.status(400).json({ error: "Invalid role" });
  db.run(
    "UPDATE users SET role=? WHERE username=?",
    [role, username],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Role updated for ${username} to ${role}` });
    }
  );
});

// ======== Questions ========
app.get("/admin/questions", verifyAdmin, (req, res) => {
  db.all("SELECT * FROM questions", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/admin/questions", verifyAdmin, (req, res) => {
  const { question, type, options, answer } = req.body;
  db.run(
    "INSERT INTO questions(question,type,options,answer) VALUES(?,?,?,?)",
    [question, type, options || null, answer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, question, type, options, answer });
    }
  );
});

app.put("/admin/questions/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { question, type, options, answer } = req.body;
  db.run(
    "UPDATE questions SET question=?,type=?,options=?,answer=? WHERE id=?",
    [question, type, options || null, answer, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Question updated" });
    }
  );
});

app.delete("/admin/questions/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM questions WHERE id=?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Question deleted" });
  });
});

// ======== Game & Leaderboard ========
app.get("/game-questions", verifyAuth, (req, res) => {
  db.all("SELECT * FROM questions ORDER BY RANDOM() LIMIT 10", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/submit-score", verifyAuth, (req, res) => {
  const username = req.user.username;
  const { score } = req.body;
  if (score == null) return res.status(400).json({ error: "Score missing" });
  db.get(
    "SELECT * FROM leaderboard WHERE username=?",
    [username],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) {
        if (score > row.highscore)
          db.run("UPDATE leaderboard SET highscore=? WHERE username=?", [
            score,
            username,
          ]);
      } else {
        db.run("INSERT INTO leaderboard(username,highscore) VALUES(?,?)", [
          username,
          score,
        ]);
      }
      res.json({ message: "Score submitted" });
    }
  );
});

app.get("/leaderboard", (req, res) => {
  db.all(
    "SELECT username,highscore FROM leaderboard ORDER BY highscore DESC LIMIT 10",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get("/user-score/:username", (req, res) => {
  const { username } = req.params;
  db.get(
    "SELECT highscore FROM leaderboard WHERE username=?",
    [username],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ highscore: row?.highscore || 0 });
    }
  );
});

// ======== Chat ========
app.get("/chat", verifyAuth, (req, res) => {
  db.all("SELECT * FROM chat ORDER BY id ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const messagesWithRole = rows.map((row) => {
      return new Promise((resolve, reject) => {
        db.get(
          "SELECT role FROM users WHERE username=?",
          [row.username],
          (err, user) => {
            if (err) reject(err);
            resolve({
              id: row.id,
              username: row.username,
              message: row.message,
              created_at: row.created_at, // ostaje string iz SQLite
              role: user?.role || "user",
            });
          }
        );
      });
    });

    Promise.all(messagesWithRole)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ error: err.message }));
  });
});

app.post("/chat", verifyAuth, (req, res) => {
  const username = req.user.username;
  const role = req.user.role;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message missing" });

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  db.run(
    "INSERT INTO chat(username,message,created_at) VALUES(?,?,?)",
    [username, message, now],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM chat WHERE id=?", [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ...row, role }); // sada row ima created_at
      });
    }
  );
});

app.delete("/chat/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM chat WHERE id=?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Poruka obrisana" });
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
