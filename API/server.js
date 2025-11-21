// server.js (fixed)
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// __dirname shim for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static files
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index1.html")); // change name if needed
});

// create a pool and use it for all queries
const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "trapezi_user",
  password: process.env.DB_PASSWORD || "yourpassword",
  database: process.env.DB_NAME || "trapezi",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test route to confirm DB works
app.get("/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows[0] });
  } catch (err) {
    console.error("health check db error:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// fetch tricks (uses pool)
app.get("/tricks", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tricks");
    res.json(rows);
  } catch (err) {
    console.error("GET /tricks error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username & password required" });

  try {
    const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hash]);
    res.json({ message: "User created", userId: result.insertId });
  } catch (err) {
    console.error("POST /register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username & password required" });

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "devsecret", { expiresIn: "1d" });
    res.json({ token, userId: user.id });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// GET user progress
app.get("/progress", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await db.query("SELECT * FROM user_progress WHERE user_id = ?", [userId]);
    res.json(rows);
  } catch (err) {
    console.error("GET /progress error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPSERT progress
app.post("/progress", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { trick_id, status } = req.body;
    if (!trick_id || !status) return res.status(400).json({ error: "trick_id and status required" });

    await db.query(
      `INSERT INTO user_progress (user_id, trick_id, status) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
      [userId, trick_id, status]
    );
    res.json({ message: "Progress updated" });
  } catch (err) {
    console.error("POST /progress error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/progress", authenticate, async (req, res) => {
  const { trickId, status } = req.body;
  const userId = req.user.id;

  await db.query(
    `INSERT INTO user_progress (user_id, trick_id, status)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW()`,
    [userId, trickId, status]
  );

  res.json({ success: true });
});


// single app.listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
