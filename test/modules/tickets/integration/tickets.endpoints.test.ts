import { buildTestApp } from "./app.builder";
import { FastifyInstance } from "fastify";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";

describe("Tickets Endpoints (Integration, in-memory)", () => {
  let ctx: Awaited<ReturnType<typeof buildTestApp>>;
  let app: FastifyInstance;

  beforeEach(async () => {
    ctx = await buildTestApp();
    app = ctx.app;
  });

  afterEach(async () => {
    await app.close();
  });

  it("POST /events/:eventId/tickets -> 201 and returns id", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/events/1/tickets",
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
      url: "/events/1/tickets",
      payload: { type: TicketType.REGULAR, limit: 5, price: 2 },
    });
    expect(create.statusCode).toBe(201);

    const res = await app.inject({ method: "GET", url: "/events/1/tickets" });
    expect(res.statusCode).toBe(200);
    const arr = res.json();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThanOrEqual(1);
    expect(arr[0].event_id).toBe(1);
    expect(arr[0].type).toBeDefined();
  });

  it("PATCH /events/:eventId/tickets/:ticketId -> 204 update", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/events/1/tickets",
      payload: { type: TicketType.VIP, limit: 3, price: 20 },
    });
    expect(create.statusCode).toBe(201);
    const id = create.json().id;

    const res = await app.inject({
      method: "PATCH",
      url: `/events/1/tickets/${id}`,
      payload: { limit: 6, price: 18 },
    });
    expect(res.statusCode).toBe(204);

    const list = await app.inject({ method: "GET", url: "/events/1/tickets" });
    const updated = list.json().find((t: any) => t.id === id);
    expect(updated.limit).toBe(6);
    expect(updated.price).toBe(18);
  });

  it("DELETE /events/:eventId/tickets/:ticketId -> 204 when no sold", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/events/1/tickets",
      payload: { type: TicketType.EARLY_BIRD, limit: 2, price: 1 },
    });
    expect(create.statusCode).toBe(201);
    const id = create.json().id;

    const res = await app.inject({ method: "DELETE", url: `/events/1/tickets/${id}` });
    expect(res.statusCode).toBe(204);

    const list = await app.inject({ method: "GET", url: "/events/1/tickets" });
    expect(list.statusCode).toBe(200);
    expect(list.json().some((t: any) => t.id === id)).toBe(false);
  });

  it("DELETE fails when sold > 0", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/events/1/tickets",
      payload: { type: TicketType.REGULAR, limit: 10, price: 5 },
    });
    expect(create.statusCode).toBe(201);
    const id = create.json().id;

    ctx.registrationRepo.setCount(1, id, 2);

    const res = await app.inject({ method: "DELETE", url: `/events/1/tickets/${id}` });
    expect(res.statusCode).toBe(400);
  });
});
