import {
  buildIntegrationTestApp,
  IntegrationTestApp,
} from "../../../shared/integration-app.builder";

describe("Venue Endpoints (Integration)", () => {
  let testApp: IntegrationTestApp;
  let adminAccessToken: string;

  beforeEach(async () => {
    testApp = await buildIntegrationTestApp();
    await testApp.dataSource.query(
      "TRUNCATE users, refresh_tokens, venues, events, tickets, registrations RESTART IDENTITY CASCADE",
    );

    const signupRes = await testApp.app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: "admin@example.com",
        nickname: "admin",
        password: "password123",
      },
    });

    const signupBody = signupRes.json() as { userId: string };
    await testApp.dataSource.query("UPDATE users SET role = $1 WHERE id = $2", [
      "admin",
      signupBody.userId,
    ]);

    const loginRes = await testApp.app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "admin@example.com",
        password: "password123",
      },
    });

    adminAccessToken = (loginRes.json() as { tokens: { accessToken: string } }).tokens.accessToken;
  });

  afterEach(async () => {
    await testApp.app.close();
    await testApp.dataSource.destroy();
  });

  describe("POST /venues", () => {
    it("creates venue and returns 201", async () => {
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

      expect(res.statusCode).toBe(201);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("id");
    });

    it("returns 400 when name is missing", async () => {
      const res = await testApp.app.inject({
        method: "POST",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
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
      await testApp.app.inject({
        method: "POST",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
        payload: {
          name: "Hall 1",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const res = await testApp.app.inject({
        method: "GET",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it("returns empty array when no venues", async () => {
      const res = await testApp.app.inject({
        method: "GET",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>[];
      expect(body).toEqual([]);
    });
  });

  describe("GET /venues/:venueId", () => {
    it("returns venue by id", async () => {
      const createRes = await testApp.app.inject({
        method: "POST",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id;

      const res = await testApp.app.inject({
        method: "GET",
        url: `/venues/${venueId}`,
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("name", "Main Hall");
    });
  });

  describe("PATCH /venues/:venueId", () => {
    it("updates venue and returns 204", async () => {
      const createRes = await testApp.app.inject({
        method: "POST",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id;

      const res = await testApp.app.inject({
        method: "PATCH",
        url: `/venues/${venueId}`,
        headers: { authorization: `Bearer ${adminAccessToken}` },
        payload: {
          name: "Updated Hall",
        },
      });

      expect(res.statusCode).toBe(204);
    });
  });

  describe("DELETE /venues/:venueId", () => {
    it("deletes venue and returns 204", async () => {
      const createRes = await testApp.app.inject({
        method: "POST",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id;

      const res = await testApp.app.inject({
        method: "DELETE",
        url: `/venues/${venueId}`,
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });

      expect(res.statusCode).toBe(204);
    });

    it("returns 409 when deleting venue with events", async () => {
      const createRes = await testApp.app.inject({
        method: "POST",
        url: "/venues",
        headers: { authorization: `Bearer ${adminAccessToken}` },
        payload: {
          name: "Main Hall",
          capacity: 500,
          address: "123 Main St",
        },
      });

      const venueId = (createRes.json() as Record<string, unknown>).id as string;

      await testApp.app.inject({
        method: "POST",
        url: "/events",
        headers: { authorization: `Bearer ${adminAccessToken}` },
        payload: {
          name: "Hall Event",
          organisator: "Org",
          description: "Desc",
          start_timestamp: new Date(Date.now() + 1000).toISOString(),
          end_timestamp: new Date(Date.now() + 2000).toISOString(),
          venue_id: venueId,
        },
      });

      const res = await testApp.app.inject({
        method: "DELETE",
        url: `/venues/${venueId}`,
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });

      expect(res.statusCode).toBe(409);
    });
  });
});
