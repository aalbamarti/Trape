import request from "supertest";
import app from "../server.js";
//import { pool } from "../db.js"; // your pool
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";

let db;
let testUserId;
let testToken;

//const testToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "testsecret");

beforeAll(async () => {
  // 1. Connect to your test DB
  db = await mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "trapezi_user",
    password: process.env.DB_PASSWORD || "yourpassword",
    database: process.env.DB_NAME || "trapezi",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

    // 2. Create a test user
  const passwordHash = await bcrypt.hash("password", 10);
  const [result] = await db.query(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    ["testuser", passwordHash]
  );
  testUserId = result.insertId;

  // 3. Generate a JWT token for that user
  testToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET || "devsecret");

  // 4. Make sure trick_id = 1 exists
  const [tricks] = await db.query("SELECT id FROM tricks WHERE id = 1");
  if (tricks.length === 0) {
    await db.query("INSERT INTO tricks (id, name) VALUES (?, ?)", [1, "Test Trick"]);
  }
});


afterAll(async () => {
  // 5. Cleanup test data
  await db.query("DELETE FROM user_progress WHERE user_id = ?", [testUserId]);
  await db.query("DELETE FROM users WHERE id = ?", [testUserId]);

  // 6. Close DB connection
  await db.end();
});

describe("POST /progress", () => {

  test("should return 400 if body is missing", async () => {
    const res = await request(app)
      .post("/progress")
      .set("Authorization", `Bearer ${testToken}`)  
      .send({}); // empty body

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("trick_id and status required");
  });

  test("should return 401 if no token", async () => {
    const res = await request(app)
      .post("/progress")
      .send({ trick_id: 1, status: "learning" });

    expect(res.statusCode).toBe(401);
  });
//Checks that a valid, authenticated request can successfully update user progress.
    test("returns 200 and updates progress with valid body and token", async () => {
    const res = await request(app)
      .post("/progress")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ trick_id: 1, status: "learning" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Progress updated");
  });

});
/*afterAll(async () => {
  await pool.end(); // closes all connections
});*/