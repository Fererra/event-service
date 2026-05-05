import { CancelEventUseCase } from "../../../../src/modules/events/application/commands/cancel-event.use-case";
import { InMemoryEventRepository } from "./in-memory.repositories";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";

describe("CancelEventUseCase", () => {
  it("cancels owned event", async () => {
    const repo = new InMemoryEventRepository();
    const e = new Event({
      id: null,
      ownerId: "owner",
      name: "Lily",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "v",
      createdAt: new Date(),
    });
    const saved = await repo.save(e);
    const uc = new CancelEventUseCase(repo);
    await uc.execute({ eventId: saved.id as number, requestingUserId: "owner" });
    const after = await repo.findById(saved.id as number);
    expect(after?.status).toBe(EventStatus.CANCELLED);
  });

  it("throws when not owner", async () => {
    const repo = new InMemoryEventRepository();
    const e = new Event({
      id: null,
      ownerId: "owner",
      name: "Lily",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "v",
      createdAt: new Date(),
    });
    const saved = await repo.save(e);
    const uc = new CancelEventUseCase(repo);
    await expect(
      uc.execute({ eventId: saved.id as number, requestingUserId: "other" }),
    ).rejects.toThrow();
  });
});
