const request = require("supertest");
const app = require("../src/index");

describe("Admin Endpoints", () => {
  const validApiKey = process.env.APP_API_KEY || "dev-key";

  describe("GET /admin/health", () => {
    it("should return health status", async () => {
      const res = await request(app)
        .get("/admin/health")
        .set("x-api-key", validApiKey)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe("healthy");
      expect(res.body).toHaveProperty("uptime");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("memory");
    });
  });

  describe("GET /admin/audit", () => {
    it("should return audit logs", async () => {
      const res = await request(app)
        .get("/admin/audit")
        .set("x-api-key", validApiKey)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.logs)).toBe(true);
      expect(res.body).toHaveProperty("count");
    });

    it("should respect limit parameter", async () => {
      const res = await request(app)
        .get("/admin/audit?limit=5")
        .set("x-api-key", validApiKey)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.logs.length).toBeLessThanOrEqual(5);
    });
  });

  describe("GET /admin/tickets", () => {
    it("should return tickets list", async () => {
      const res = await request(app)
        .get("/admin/tickets")
        .set("x-api-key", validApiKey)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body).toHaveProperty("count");
    });
  });
});
