import { FastifyInstance } from "fastify";
import { buildTestVenueApp, TestVenueApp } from "./app.builder";

describe("Venue Endpoints (Integration)", () => {
  let testApp: TestVenueApp;
  let app: FastifyInstance;

  beforeEach(async () => {
    testApp = await buildTestVenueApp();
    app = testApp.app;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /venues", () => {
    it("creates venue and returns 201", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/venues",
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("id");
    });

    it("returns 400 when name is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/venues",
        payload: {
          capacity: 500,
          address: "123 Main St",
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /venues", () => {
    it("returns all venues", async () => {
      await app.inject({
        method: "POST",
        url: "/venues",
        payload: {
          name: "Hall 1",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const res = await app.inject({
        method: "GET",
        url: "/venues",
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it("returns empty array when no venues", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/venues",
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(body).toEqual([]);
    });
  });

  describe("GET /venues/:venueId", () => {
    it("returns venue by id", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/venues",
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id;

      const res = await app.inject({
        method: "GET",
        url: `/venues/${venueId}`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("name", "Main Hall");
    });
  });

  describe("PATCH /venues/:venueId", () => {
    it("updates venue and returns 204", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/venues",
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id;

      const res = await app.inject({
        method: "PATCH",
        url: `/venues/${venueId}`,
        payload: {
          name: "Updated Hall",
        },
      });

      expect(res.statusCode).toBe(204);
    });
  });

  describe("DELETE /venues/:venueId", () => {
    it("deletes venue and returns 204", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/venues",
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id;

      const res = await app.inject({
        method: "DELETE",
        url: `/venues/${venueId}`,
      });

      expect(res.statusCode).toBe(204);
    });

    it("returns 409 when deleting venue with events", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/venues",
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id as string;
      testApp.eventChecker.setHasEvents(venueId, true);

      const res = await app.inject({
        method: "DELETE",
        url: `/venues/${venueId}`,
      });

      expect(res.statusCode).toBe(409);
    });
  });
});
