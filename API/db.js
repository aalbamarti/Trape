// db.js
import mysql from "mysql2/promise";

const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "trapezi_user",
  password: process.env.DB_PASSWORD || "yourpassword",
  database: process.env.DB_NAME || "trapezi",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;

