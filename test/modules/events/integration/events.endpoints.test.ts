import { buildTestApp } from "./app.builder";
import { FastifyInstance } from "fastify";

describe("Events Endpoints (Integration, in-memory)", () => {
  let app: FastifyInstance;
  let ctx: Awaited<ReturnType<typeof buildTestApp>>;

  beforeEach(async () => {
    ctx = await buildTestApp();
    app = ctx.app;
  });

  afterEach(async () => {
    await app.close();
  });

  it("POST /events -> 201 and returns created event", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: "Concert",
        organisator: "Org",
        description: "Desc",
        start_timestamp: new Date(Date.now() + 1000).toISOString(),
        end_timestamp: new Date(Date.now() + 2000).toISOString(),
        venue_id: "00000000-0000-0000-0000-000000000001",
        tickets: [{ type: "regular", limit: 10, price: 5 }],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.event).toBeDefined();
    expect(body.event.id).toBeDefined();
  });

  it("GET /events returns list", async () => {
    await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: "Concert",
        organisator: "Org",
        description: "Desc",
        start_timestamp: new Date(Date.now() + 1000).toISOString(),
        end_timestamp: new Date(Date.now() + 2000).toISOString(),
        venue_id: "00000000-0000-0000-0000-000000000001",
      },
    });

    const res = await app.inject({ method: "GET", url: "/events" });
    expect(res.statusCode).toBe(200);
    const arr = res.json();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /events/:id/cancel -> 204", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: "ToCancel",
        organisator: "Org",
        description: "D",
        start_timestamp: new Date(Date.now() + 1000).toISOString(),
        end_timestamp: new Date(Date.now() + 2000).toISOString(),
        venue_id: "00000000-0000-0000-0000-000000000001",
      },
    });
    const id = create.json().event.id;
    const res = await app.inject({ method: "PATCH", url: `/events/${id}/cancel` });
    expect(res.statusCode).toBe(204);
  });

  it("PATCH /events/:id -> 204 update", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: "ToUpdate",
        organisator: "Org",
        description: "D",
        start_timestamp: new Date(Date.now() + 1000).toISOString(),
        end_timestamp: new Date(Date.now() + 2000).toISOString(),
        venue_id: "00000000-0000-0000-0000-000000000001",
      },
    });
    const id = create.json().event.id;
    const res = await app.inject({
      method: "PATCH",
      url: `/events/${id}`,
      payload: { name: "Updated" },
    });
    expect(res.statusCode).toBe(204);
  });

  it("DELETE /events/:id -> 204 when finished/cancelled", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        name: "ToDelete",
        organisator: "Org",
        description: "D",
        start_timestamp: new Date(Date.now() - 10_000).toISOString(),
        end_timestamp: new Date(Date.now() - 5_000).toISOString(),
        venue_id: "00000000-0000-0000-0000-000000000001",
      },
    });
    const id = create.json().event.id;

    const e = await ctx.eventRepo.findById(id);
    if (e) {
      e.finish();
      await ctx.eventRepo.save(e);
    }
    const res = await app.inject({ method: "DELETE", url: `/events/${id}` });
    expect(res.statusCode).toBe(204);
  });
});
