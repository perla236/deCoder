# deCoder (decoder2)

[![Node.js](https://img.shields.io/badge/Node.js-v22.12.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Screenshots

### Home Page

![Home Page](screenshots/home.png)

### Game

![Game](screenshots/game.png)

### Leaderboard

![Leaderboard](screenshots/leaderboard.png)

### Admin Dashboard

![Admin](screenshots/admin.png)

---

## English Version

### Project Overview

deCoder is a web application built with **React** for frontend and **Express + SQLite** for backend. It features user registration/login, admin dashboard, and a quiz game with a leaderboard.

### Features

- **User Authentication:** Register and login with email, username, and password.
- **Admin Dashboard:** Only admin users can access the admin dashboard.
- **Game:** Users can play a quiz game with 10 random questions.
- **Leaderboard:** Users’ high scores are saved and displayed.
- **Security:** Passwords are hashed using bcrypt, JWT is used for authentication.

### Tech Stack

- **Frontend:** React (Vite), React Router, React Toastify
- **Backend:** Express, SQLite3, bcryptjs, JWT
- **Other:** CORS for cross-origin requests

### Installation

1. Clone the repository:

```bash
git clone <repo_url>
cd decoder/deCoder
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../
npm install
```

### Running the Project

- Start backend:

```bash
node server/index.js
```

- Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173/` and backend on `http://localhost:5000/`.

### Usage

1. Open the frontend in your browser.
2. Register a new user or login with admin:

   - Username: `adminlovro`
   - Password: `adminlovro`

3. Users can play the quiz game and check the leaderboard.
4. Admin can access `/admin/dashboard`.

---

## Hrvatska Verzija

### Pregled Projekta

deCoder je web aplikacija napravljena s **React** za frontend i **Express + SQLite** za backend. Uključuje registraciju/prijavu korisnika, admin dashboard i kviz igru s leaderboardom.

### Značajke

- **Autentikacija korisnika:** Registracija i prijava s emailom, korisničkim imenom i lozinkom.
- **Admin Dashboard:** Samo admin korisnici mogu pristupiti dashboardu.
- **Igra:** Korisnici mogu igrati kviz igru s 10 random pitanja.
- **Leaderboard:** Spremaju se najbolji rezultati korisnika i prikazuju na leaderboardu.
- **Sigurnost:** Lozinke se hashiraju s bcrypt, JWT se koristi za autentikaciju.

### Tehnologije

- **Frontend:** React (Vite), React Router, React Toastify
- **Backend:** Express, SQLite3, bcryptjs, JWT
- **Ostalo:** CORS za cross-origin zahtjeve

### Instalacija

1. Kloniraj repozitorij:

```bash
git clone <repo_url>
cd decoder/deCoder
```

2. Instaliraj server dependencies:

```bash
cd server
npm install
```

3. Instaliraj frontend dependencies:

```bash
cd ../
npm install
```

### Pokretanje Projekta

- Pokreni backend:

```bash
node server/index.js
```

- Pokreni frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173/`, Backend: `http://localhost:5000/`.

### Korištenje

1. Otvori frontend u pregledniku.
2. Registriraj novog korisnika ili se prijavi kao admin:

   - Username: `adminlovro`
   - Password: `adminlovro`

3. Obični korisnici mogu igrati kviz igru i pregledavati leaderboard.
4. Admin može pristupiti `/admin/dashboard`.
