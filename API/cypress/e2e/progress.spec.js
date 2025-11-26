// cypress/e2e/progress.spec.js
describe("Backend progress API", () => {
  it("should be reachable", () => {
    cy.request("GET", "/health").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.ok).to.be.true;
    });
  });
});

describe("Backend progress API", () => {
  let token;

  // 1️⃣ Login or create a test user
  before(() => {
    // Try to create test user first
    cy.request({
      method: "POST",
      url: "/register",
      body: { username: "testuser", password: "testpassword" },
      failOnStatusCode: false // ignore if user already exists
    });

    // Then log in
    cy.request("POST", "/login", {
      username: "testuser",
      password: "testpassword"
    }).then((res) => {
      expect(res.status).to.eq(200);
      token = res.body.token;
    });
  });

  // 3️⃣ Test updating progress
  it("should update progress", () => {
    cy.request({
      method: "POST",
      url: "/progress",
      headers: { Authorization: `Bearer ${token}` },
      body: { trick_id: 1, status: "learning" },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.eq("Progress updated");
    });
  });

  // 4️⃣ Test invalid requests
  it("should fail without token", () => {
    cy.request({
      method: "POST",
      url: "/progress",
      body: { trick_id: 1, status: "learning" },
      failOnStatusCode: false, // don't throw on 401
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("should fail with missing body", () => {
    cy.request({
      method: "POST",
      url: "/progress",
      headers: { Authorization: `Bearer ${token}` },
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq("trick_id and status required");
    });
  });
});
