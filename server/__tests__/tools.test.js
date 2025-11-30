const request = require("supertest");
const app = require("../src/index");

describe("Tools Endpoints", () => {
  const validApiKey = process.env.APP_API_KEY || "dev-key";

  describe("GET /tools", () => {
    it("should return list of available tools", async () => {
      const res = await request(app)
        .get("/tools")
        .set("x-api-key", validApiKey)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.tools)).toBe(true);
      expect(res.body.tools.length).toBeGreaterThan(0);

      // Check tool structure
      const tool = res.body.tools[0];
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("description");
      expect(tool).toHaveProperty("schema");
      expect(tool).toHaveProperty("metadata");
    });
  });

  describe("POST /invoke", () => {
    it("should reject request without tool name", async () => {
      const res = await request(app)
        .post("/invoke")
        .set("x-api-key", validApiKey)
        .send({ input: {} })
        .expect(400);

      expect(res.body.error).toBe("bad_request");
    });

    it("should reject request with unknown tool", async () => {
      const res = await request(app)
        .post("/invoke")
        .set("x-api-key", validApiKey)
        .send({ tool: "unknown_tool", input: {} })
        .expect(404);

      expect(res.body.error).toBe("not_found");
    });

    it("should reject invalid input for search_db", async () => {
      const res = await request(app)
        .post("/invoke")
        .set("x-api-key", validApiKey)
        .send({
          tool: "search_db",
          input: {}, // missing required 'q' field
        })
        .expect(400);

      expect(res.body.error).toBe("validation_error");
    });

    it("should successfully execute search_db tool", async () => {
      const res = await request(app)
        .post("/invoke")
        .set("x-api-key", validApiKey)
        .send({
          tool: "search_db",
          input: { q: "laptop", limit: 5 },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.tool).toBe("search_db");
      expect(res.body.result).toHaveProperty("hits");
      expect(Array.isArray(res.body.result.hits)).toBe(true);
      expect(res.body.metadata).toHaveProperty("executionTime");
    });

    it("should successfully execute create_ticket tool", async () => {
      const res = await request(app)
        .post("/invoke")
        .set("x-api-key", validApiKey)
        .send({
          tool: "create_ticket",
          input: {
            title: "Test Ticket",
            body: "This is a test ticket description",
            priority: "medium",
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.result).toHaveProperty("ticket");
      expect(res.body.result.ticket).toHaveProperty("id");
      expect(res.body.result.ticket.title).toBe("Test Ticket");
    });

    it("should execute run_query tool (admin only)", async () => {
      const res = await request(app)
        .post("/invoke")
        .set("x-api-key", validApiKey)
        .send({
          tool: "run_query",
          input: { query: "SELECT * FROM products LIMIT 5" },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.result).toHaveProperty("rows");
    });

    it("should reject dangerous queries", async () => {
      const res = await request(app)
        .post("/invoke")
        .set("x-api-key", validApiKey)
        .send({
          tool: "run_query",
          input: { query: "DROP TABLE products" },
        })
        .expect(500);

      expect(res.body.error).toBe("execution_error");
      expect(res.body.message).toContain("Dangerous operation");
    });
  });
});
