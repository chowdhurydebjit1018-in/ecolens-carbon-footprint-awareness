import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("GET /api/health", () => {
  it("should return ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
    expect(res.body.data.services).toHaveProperty("firebase");
  });
});
