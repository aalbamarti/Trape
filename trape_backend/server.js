import express from "express";
import mysql from "mysql2/promise"; // promise version for async/await
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

//app.use(cors());

// Required for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index1.html"));
});

console.log(process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);
// Database connection
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// MySQL connection configuration


let connection;

// Initialize connection
async function initDb() {
  try {
    connection = await mysql.createConnection(db);
    console.log("✅ Connected to MySQL");
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1); // stop server if DB fails
  }
}

// Endpoint to fetch tricks
app.get("/tricks", async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM tricks");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

const PORT = 3000;

app.listen(PORT, async () => {
  await initDb();
  console.log(`Server running at http://localhost:${PORT}`);
});


//User registration route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [existing] = await db.query("SELECT id FROM users WHERE username=?", [username]);
    if (existing.length > 0) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hash]);

    res.json({ message: "User created", userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
//User login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username=?", [username]);
    if (users.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware to authenticate JWT tokens
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

//Track user progress
// Get all progress for the logged-in user
app.get("/progress", authenticate, async (req, res) => {
  const userId = req.userId;
  const [rows] = await db.query("SELECT * FROM user_progress WHERE user_id=?", [userId]);
  res.json(rows);
});

// Update status of a trick
app.post("/progress", authenticate, async (req, res) => {
  const userId = req.userId;
  const { trick_id, status } = req.body;

  try {
    // Insert or update
    await db.query(`
      INSERT INTO user_progress (user_id, trick_id, status) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status=VALUES(status)
    `, [userId, trick_id, status]);

    res.json({ message: "Progress updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
