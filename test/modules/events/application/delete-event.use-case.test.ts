import { DeleteEventUseCase } from "../../../../src/modules/events/application/commands/delete-event.use-case";
import { InMemoryEventRepository } from "./in-memory.repositories";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";
import {
  NotFoundError,
  UnauthorizedError,
  DomainError,
} from "../../../../src/shared/domain/errors/domain.error";

describe("DeleteEventUseCase (application unit)", () => {
  it("deletes event when owner and status allows (finished/cancelled)", async () => {
    const repo = new InMemoryEventRepository();
    const e = new Event({
      id: null,
      ownerId: "owner-1",
      name: "ToDelete",
      organisator: "Org",
      description: "D",
      period: new EventPeriod(new Date(Date.now() - 10_000), new Date(Date.now() - 5_000)),
      status: EventStatus.FINISHED,
      venueId: "00000000-0000-0000-0000-000000000001",
      createdAt: new Date(),
    });
    const saved = await repo.save(e);

    const uc = new DeleteEventUseCase(repo);
    await uc.execute({ eventId: saved.id as number, requestingUserId: "owner-1" });

    const after = await repo.findById(saved.id as number);
    expect(after).toBeNull();
  });

  it("throws NotFoundError when event missing", async () => {
    const repo = new InMemoryEventRepository();
    const uc = new DeleteEventUseCase(repo);
    await expect(uc.execute({ eventId: 9999, requestingUserId: "owner" })).rejects.toThrow(
      NotFoundError,
    );
  });

  it("throws UnauthorizedError when not owner", async () => {
    const repo = new InMemoryEventRepository();
    const e = new Event({
      id: null,
      ownerId: "owner-1",
      name: "X",
      organisator: "Org",
      description: "D",
      period: new EventPeriod(new Date(Date.now() - 10_000), new Date(Date.now() - 5_000)),
      status: EventStatus.FINISHED,
      venueId: "00000000-0000-0000-0000-000000000001",
      createdAt: new Date(),
    });
    const saved = await repo.save(e);
    const uc = new DeleteEventUseCase(repo);
    await expect(
      uc.execute({ eventId: saved.id as number, requestingUserId: "other" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws DomainError when event not in deletable state", async () => {
    const repo = new InMemoryEventRepository();
    const e = new Event({
      id: null,
      ownerId: "owner-1",
      name: "NotDeletable",
      organisator: "Org",
      description: "D",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "00000000-0000-0000-0000-000000000001",
      createdAt: new Date(),
    });
    const saved = await repo.save(e);
    const uc = new DeleteEventUseCase(repo);
    await expect(
      uc.execute({ eventId: saved.id as number, requestingUserId: "owner-1" }),
    ).rejects.toThrow(DomainError);
  });
});
