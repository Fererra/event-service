import {
  buildIntegrationTestApp,
  IntegrationTestApp,
} from "../../../shared/integration-app.builder";

describe("Registration Endpoints (Integration)", () => {
  let testApp: IntegrationTestApp;
  let adminAccessToken: string;
  let userAccessToken: string;
  let userId: string;

  beforeEach(async () => {
    testApp = await buildIntegrationTestApp();
    await testApp.dataSource.query(
      "TRUNCATE users, refresh_tokens, venues, events, tickets, registrations RESTART IDENTITY CASCADE",
    );

    const adminSignup = await testApp.app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: "admin@example.com",
        nickname: "admin",
        password: "password123",
      },
    });

    const adminUserId = (adminSignup.json() as { userId: string }).userId;
    await testApp.dataSource.query("UPDATE users SET role = $1 WHERE id = $2", [
      "admin",
      adminUserId,
    ]);

    const adminLogin = await testApp.app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "admin@example.com",
        password: "password123",
      },
    });

    adminAccessToken = (adminLogin.json() as { tokens: { accessToken: string } }).tokens
      .accessToken;

    const userSignup = await testApp.app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: "user@example.com",
        nickname: "user",
        password: "password123",
      },
    });

    const userBody = userSignup.json() as { userId: string; tokens: { accessToken: string } };
    userId = userBody.userId;
    userAccessToken = userBody.tokens.accessToken;
  });

  afterEach(async () => {
    await testApp.app.close();
    await testApp.dataSource.destroy();
  });

  async function createVenue(): Promise<string> {
    const res = await testApp.app.inject({
      method: "POST",
      url: "/venues",
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: {
        name: "Main Hall",
        capacity: 500,
        address: "123 Main St",
      },
    });

    return (res.json() as { id: string }).id;
  }

  async function createEvent(venueId: string): Promise<number> {
    const res = await testApp.app.inject({
      method: "POST",
      url: "/events",
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: {
        name: "Concert",
        organisator: "Org",
        description: "Desc",
        start_timestamp: new Date(Date.now() + 1000).toISOString(),
        end_timestamp: new Date(Date.now() + 2000).toISOString(),
        venue_id: venueId,
      },
    });

    return (res.json() as { event: { id: number } }).event.id;
  }

  async function createTicket(eventId: number): Promise<number> {
    const res = await testApp.app.inject({
      method: "POST",
      url: `/events/${eventId}/tickets`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: { type: "regular", limit: 10, price: 5 },
    });

    return (res.json() as { ticket: { id: number } }).ticket.id;
  }

  describe("POST /events/:eventId/registrations", () => {
    it("creates registration and returns 201", async () => {
      const venueId = await createVenue();
      const eventId = await createEvent(venueId);
      const ticketId = await createTicket(eventId);

      const res = await testApp.app.inject({
        method: "POST",
        url: "/events/1/registrations",
        payload: { ticketId: 10 },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("registration");
    });

    it("returns 400 when ticketId is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/events/1/registrations",
        headers: { authorization: `Bearer ${userAccessToken}` },
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when eventId is not a number", async () => {
      const res = await testApp.app.inject({
        method: "POST",
        url: "/events/invalid/registrations",
        payload: { ticketId: 10 },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /users/:userId/registrations", () => {
    it("returns user registrations", async () => {
      const venueId = await createVenue();
      const eventId = await createEvent(venueId);
      const ticketId = await createTicket(eventId);

      await testApp.app.inject({
        method: "POST",
        url: "/events/1/registrations",
        payload: { ticketId: 10 },
      });

      const res = await testApp.app.inject({
        method: "GET",
        url: `/users/${userId}/registrations`,
        headers: { authorization: `Bearer ${userAccessToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it("returns empty array when user has no registrations", async () => {
      const res = await testApp.app.inject({
        method: "GET",
        url: `/users/${userId}/registrations`,
        headers: { authorization: `Bearer ${userAccessToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(body.length).toBe(0);
    });
  });

  describe("DELETE /users/:userId/registrations/:registrationId", () => {
    it("cancels registration and returns 204", async () => {
      const venueId = await createVenue();
      const eventId = await createEvent(venueId);
      const ticketId = await createTicket(eventId);

      const createRes = await testApp.app.inject({
        method: "POST",
        url: "/events/1/registrations",
        payload: { ticketId: 10 },
      });

      const registrationId = (
        (createRes.json() as Record<string, any>).registration as Record<string, unknown>
      ).id;

      const deleteRes = await testApp.app.inject({
        method: "DELETE",
        url: `/users/${userId}/registrations/${registrationId}`,
        headers: { authorization: `Bearer ${userAccessToken}` },
      });

      expect(deleteRes.statusCode).toBe(204);
    });
  });

  describe("GET /events/:eventId/registrations (admin)", () => {
    it("returns registrations for event", async () => {
      const venueId = await createVenue();
      const eventId = await createEvent(venueId);
      await createTicket(eventId);

      const res = await testApp.app.inject({
        method: "GET",
        url: `/events/${eventId}/registrations`,
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });

      expect(res.statusCode).toBe(200);
    });
  });

  describe("GET /events/:eventId/tickets/:ticketId/registrations/count", () => {
    it("returns registration count for ticket", async () => {
      const venueId = await createVenue();
      const eventId = await createEvent(venueId);
      const ticketId = await createTicket(eventId);

      const res = await testApp.app.inject({
        method: "GET",
        url: `/events/${eventId}/tickets/${ticketId}/registrations/count`,
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("count");
    });
  });
});
