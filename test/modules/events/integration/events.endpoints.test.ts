import {
  buildIntegrationTestApp,
  IntegrationTestApp,
} from "../../../shared/integration-app.builder";

describe("Events Endpoints (Integration)", () => {
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

    const adminUserId = (signupRes.json() as { userId: string }).userId;
    await testApp.dataSource.query("UPDATE users SET role = $1 WHERE id = $2", [
      "admin",
      adminUserId,
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

  it("POST /events -> 201 and returns id", async () => {
    const venueId = await createVenue();

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
        tickets: [{ type: "regular", limit: 10, price: 5 }],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe("number");
  });

  it("GET /events returns list with read model fields", async () => {
    const venueId = await createVenue();

    await testApp.app.inject({
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

    const res = await testApp.app.inject({ method: "GET", url: "/events" });
    expect(res.statusCode).toBe(200);
    const arr = res.json();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThanOrEqual(1);
    expect(arr[0].owner_id).toBeDefined();
    expect(arr[0].start_timestamp).toBeDefined();
  });

  it("PATCH /events/:id/cancel -> 204", async () => {
    const venueId = await createVenue();

    const create = await testApp.app.inject({
      method: "POST",
      url: "/events",
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: {
        name: "ToCancel",
        organisator: "Org",
        description: "D",
        start_timestamp: new Date(Date.now() + 1000).toISOString(),
        end_timestamp: new Date(Date.now() + 2000).toISOString(),
        venue_id: venueId,
      },
    });
    const id = create.json().id;
    const res = await testApp.app.inject({
      method: "PATCH",
      url: `/events/${id}/cancel`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
    });
    expect(res.statusCode).toBe(204);
  });

  it("PATCH /events/:id -> 204 update", async () => {
    const venueId = await createVenue();

    const create = await testApp.app.inject({
      method: "POST",
      url: "/events",
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: {
        name: "ToUpdate",
        organisator: "Org",
        description: "D",
        start_timestamp: new Date(Date.now() + 1000).toISOString(),
        end_timestamp: new Date(Date.now() + 2000).toISOString(),
        venue_id: venueId,
      },
    });
    const id = create.json().id;
    const res = await testApp.app.inject({
      method: "PATCH",
      url: `/events/${id}`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: { name: "Updated" },
    });
    expect(res.statusCode).toBe(204);
  });

  it("DELETE /events/:id -> 204 when finished/cancelled", async () => {
    const venueId = await createVenue();

    const create = await testApp.app.inject({
      method: "POST",
      url: "/events",
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: {
        name: "ToDelete",
        organisator: "Org",
        description: "D",
        start_timestamp: new Date(Date.now() - 10_000).toISOString(),
        end_timestamp: new Date(Date.now() - 5_000).toISOString(),
        venue_id: venueId,
      },
    });
    const id = create.json().id;

    await testApp.app.inject({
      method: "PATCH",
      url: `/events/${id}/cancel`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
    });

    const res = await testApp.app.inject({
      method: "DELETE",
      url: `/events/${id}`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
    });
    expect(res.statusCode).toBe(204);
  });
});
