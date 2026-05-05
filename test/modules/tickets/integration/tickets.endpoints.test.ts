import {
  buildIntegrationTestApp,
  IntegrationTestApp,
} from "../../../shared/integration-app.builder";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";

describe("Tickets Endpoints (Integration, in-memory)", () => {
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

  it("POST /events/:eventId/tickets -> 201 and returns id", async () => {
    const res = await app.inject({
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

  it("POST /events/:eventId/tickets -> 201 and returns created ticket", async () => {
    const venueId = await createVenue();
    const eventId = await createEvent(venueId);

    const res = await testApp.app.inject({
      method: "POST",
      url: `/events/${eventId}/tickets`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: {
        type: TicketType.REGULAR,
        limit: 10,
        price: 5,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe("number");
  });

  it("GET /events/:eventId/tickets returns list with read model fields", async () => {
    const create = await app.inject({
      method: "POST",
      url: `/events/${eventId}/tickets`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: { type: TicketType.REGULAR, limit: 5, price: 2 },
    });
    expect(create.statusCode).toBe(201);

    const res = await testApp.app.inject({
      method: "GET",
      url: `/events/${eventId}/tickets`,
    });
    expect(res.statusCode).toBe(200);
    const arr = res.json();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThanOrEqual(1);
    expect(arr[0].event_id).toBe(1);
    expect(arr[0].type).toBeDefined();
  });

  it("PATCH /events/:eventId/tickets/:ticketId -> 204 update", async () => {
    const venueId = await createVenue();
    const eventId = await createEvent(venueId);

    const create = await testApp.app.inject({
      method: "POST",
      url: `/events/${eventId}/tickets`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: { type: TicketType.VIP, limit: 3, price: 20 },
    });
    expect(create.statusCode).toBe(201);
    const id = create.json().id;

    const res = await testApp.app.inject({
      method: "PATCH",
      url: `/events/${eventId}/tickets/${id}`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: { limit: 6, price: 18 },
    });
    expect(res.statusCode).toBe(204);

    const list = await testApp.app.inject({
      method: "GET",
      url: `/events/${eventId}/tickets`,
    });
    const updated = list.json().find((t: any) => t.id === id);
    expect(updated.limit).toBe(6);
    expect(updated.price).toBe(18);
  });

  it("DELETE /events/:eventId/tickets/:ticketId -> 204 when no sold", async () => {
    const venueId = await createVenue();
    const eventId = await createEvent(venueId);

    const create = await testApp.app.inject({
      method: "POST",
      url: `/events/${eventId}/tickets`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: { type: TicketType.EARLY_BIRD, limit: 2, price: 1 },
    });
    expect(create.statusCode).toBe(201);
    const id = create.json().id;

    const res = await testApp.app.inject({
      method: "DELETE",
      url: `/events/${eventId}/tickets/${id}`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
    });
    expect(res.statusCode).toBe(204);

    const list = await testApp.app.inject({
      method: "GET",
      url: `/events/${eventId}/tickets`,
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().some((t: any) => t.id === id)).toBe(false);
  });

  it("DELETE fails when sold > 0", async () => {
    const venueId = await createVenue();
    const eventId = await createEvent(venueId);

    const create = await testApp.app.inject({
      method: "POST",
      url: `/events/${eventId}/tickets`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
      payload: { type: TicketType.REGULAR, limit: 10, price: 5 },
    });
    expect(create.statusCode).toBe(201);
    const id = create.json().id;

    const userSignup = await testApp.app.inject({
      method: "POST",
      url: "/auth/signup",
      payload: {
        email: "user@example.com",
        nickname: "user",
        password: "password123",
      },
    });

    const userAccessToken = (userSignup.json() as { tokens: { accessToken: string } }).tokens
      .accessToken;

    await testApp.app.inject({
      method: "POST",
      url: `/events/${eventId}/registrations`,
      headers: { authorization: `Bearer ${userAccessToken}` },
      payload: { ticket_id: id },
    });

    const res = await testApp.app.inject({
      method: "DELETE",
      url: `/events/${eventId}/tickets/${id}`,
      headers: { authorization: `Bearer ${adminAccessToken}` },
    });
    expect(res.statusCode).toBe(400);
  });
});
