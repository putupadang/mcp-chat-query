const request = require("supertest");
const app = require("../src/index");

describe("Authentication Middleware", () => {
  const validApiKey = process.env.APP_API_KEY || "dev-key";

  describe("GET /tools", () => {
    it("should reject requests without API key", async () => {
      const res = await request(app).get("/tools").expect(401);

      expect(res.body).toHaveProperty("error", "unauthorized");
      expect(res.body.message).toContain("API key");
    });

    it("should reject requests with invalid API key", async () => {
      const res = await request(app)
        .get("/tools")
        .set("x-api-key", "invalid-key")
        .expect(401);

      expect(res.body).toHaveProperty("error", "unauthorized");
    });

    it("should accept requests with valid API key", async () => {
      const res = await request(app)
        .get("/tools")
        .set("x-api-key", validApiKey)
        .expect(200);

      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("tools");
    });
  });
});
