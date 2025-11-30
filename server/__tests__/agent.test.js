const request = require("supertest");
const app = require("../src/index");

describe("Agent Endpoints", () => {
  const validApiKey = process.env.APP_API_KEY || "dev-key";

  describe("POST /agent/ask", () => {
    it("should reject request without message", async () => {
      const res = await request(app)
        .post("/agent/ask")
        .set("x-api-key", validApiKey)
        .send({})
        .expect(400);

      expect(res.body.error).toBe("bad_request");
    });

    it("should handle search intent and use search_db tool", async () => {
      const res = await request(app)
        .post("/agent/ask")
        .set("x-api-key", validApiKey)
        .send({ message: "search for laptop" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.toolUsed).toBe(true);
      expect(res.body.toolName).toBe("search_db");
      expect(res.body).toHaveProperty("response");
      expect(res.body).toHaveProperty("toolResult");
    });

    it("should handle ticket intent and use create_ticket tool", async () => {
      const res = await request(app)
        .post("/agent/ask")
        .set("x-api-key", validApiKey)
        .send({ message: "create a ticket for login issue" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.toolUsed).toBe(true);
      expect(res.body.toolName).toBe("create_ticket");
    });

    it("should respond without tool for general conversation", async () => {
      const res = await request(app)
        .post("/agent/ask")
        .set("x-api-key", validApiKey)
        .send({ message: "hello how are you" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.toolUsed).toBe(false);
      expect(res.body).toHaveProperty("response");
    });
  });
});
