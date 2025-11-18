const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "trapezi_user",
  password: "yourpassword",
  database: "trapezi"
});

db.connect(err => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

app.get("/tricks", (req, res) => {
  db.query("SELECT * FROM tricks", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json(results);
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
