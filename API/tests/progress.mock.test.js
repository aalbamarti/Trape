// tests/progress.mock.test.js
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";

// Mock db.js BEFORE importing server.js
jest.unstable_mockModule("../db.js", () => ({
  default: {
    query: jest.fn((sql) => {
      if (sql.startsWith("INSERT INTO user_progress")) return Promise.resolve([{}]);
      if (sql.startsWith("SELECT id FROM tricks")) return Promise.resolve([[{ id: 1 }]]);
      return Promise.resolve([[]]);
    })
  }
}));  
const { default: app } = await import("../server.js");

// Generate a test token
const testToken = jwt.sign({ id: 123 }, process.env.JWT_SECRET || "devsecret");

describe("POST /progress (mocked DB)", () => {
  test("should return 401 if no token", async () => {
    const res = await request(app)
      .post("/progress")
      .send({ trick_id: 1, status: "learning" });

    expect(res.statusCode).toBe(401);
  });

  test("should return 400 if body is missing", async () => {
    const res = await request(app)
      .post("/progress")
      .set("Authorization", `Bearer ${testToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("trick_id and status required");
  });

  test("returns 200 and updates progress with valid body and token", async () => {
    const res = await request(app)
      .post("/progress")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ trick_id: 1, status: "learning" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Progress updated");
  });
});
