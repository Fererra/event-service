import { FastifyInstance } from "fastify";
import { UserRole } from "../../../../src/shared/domain/value-objects/user-role.enum";
import { buildTestRegistrationsApp, TestRegistrationsApp } from "./app.builder";

const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("Registration Endpoints (Integration)", () => {
  let testApp: TestRegistrationsApp;
  let app: FastifyInstance;

  beforeEach(async () => {
    testApp = await buildTestRegistrationsApp(UserRole.USER);
    app = testApp.app;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /events/:eventId/registrations", () => {
    it("creates registration and returns 201", async () => {
      testApp.eventRepo.setEvent(1);
      testApp.ticketRepo.setTicket(10, 1, 100);

      const res = await app.inject({
        method: "POST",
        url: "/events/1/registrations",
        payload: { ticket_id: 10 },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("registration");
    });

    it("returns 400 when ticket_id is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/events/1/registrations",
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when eventId is not a number", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/events/invalid/registrations",
        payload: { ticket_id: 10 },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /users/:userId/registrations", () => {
    it("returns user registrations", async () => {
      testApp.eventRepo.setEvent(1);
      testApp.ticketRepo.setTicket(10, 1, 100);

      await app.inject({
        method: "POST",
        url: "/events/1/registrations",
        payload: { ticket_id: 10 },
      });

      const res = await app.inject({
        method: "GET",
        url: `/users/${TEST_USER_ID}/registrations`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it("returns empty array when user has no registrations", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/users/${TEST_USER_ID}/registrations`,
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(body.length).toBe(0);
    });
  });

  describe("DELETE /users/:userId/registrations/:registrationId", () => {
    it("cancels registration and returns 204", async () => {
      testApp.eventRepo.setEvent(1);
      testApp.ticketRepo.setTicket(10, 1, 100);

      const createRes = await app.inject({
        method: "POST",
        url: "/events/1/registrations",
        payload: { ticket_id: 10 },
      });

      const registrationId = (
        (createRes.json() as Record<string, any>).registration as Record<string, unknown>
      ).id;

      const deleteRes = await app.inject({
        method: "DELETE",
        url: `/users/${TEST_USER_ID}/registrations/${registrationId}`,
      });

      expect(deleteRes.statusCode).toBe(204);
    });
  });

  describe("GET /events/:eventId/registrations (admin)", () => {
    it("returns registrations for event", async () => {
      const adminApp = await buildTestRegistrationsApp(UserRole.ADMIN);

      adminApp.eventRepo.setEvent(1);
      adminApp.ticketRepo.setTicket(10, 1, 100);

      const res = await adminApp.app.inject({
        method: "GET",
        url: "/events/1/registrations",
      });

      expect(res.statusCode).toBe(200);

      await adminApp.app.close();
    });
  });

  describe("GET /events/:eventId/tickets/:ticketId/registrations/count", () => {
    it("returns registration count for ticket", async () => {
      const adminApp = await buildTestRegistrationsApp(UserRole.ADMIN);

      adminApp.eventRepo.setEvent(1);
      adminApp.ticketRepo.setTicket(10, 1, 100);

      const res = await adminApp.app.inject({
        method: "GET",
        url: "/events/1/tickets/10/registrations/count",
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("count");

      await adminApp.app.close();
    });
  });
});
