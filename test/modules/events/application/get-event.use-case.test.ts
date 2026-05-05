import { GetEventUseCase } from "../../../../src/modules/events/application/queries/get-event.use-case";
import { InMemoryEventRepository, InMemoryEventReadRepository } from "./in-memory.repositories";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";
import { NotFoundError } from "../../../../src/shared/domain/errors/domain.error";

describe("GetEventUseCase (application unit)", () => {
  it("returns read model when event exists", async () => {
    const writeRepo = new InMemoryEventRepository();
    const readRepo = new InMemoryEventReadRepository(writeRepo);
    const e = new Event({
      id: null,
      ownerId: "owner-1",
      name: "Test Event",
      organisator: "Org",
      description: "D",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "00000000-0000-0000-0000-000000000001",
      createdAt: new Date(),
    });
    const saved = await writeRepo.save(e);

    const uc = new GetEventUseCase(readRepo);
    const got = await uc.execute(saved.id as number);

    expect(got).toBeDefined();
    expect(got.id).toBe(saved.id);
    expect(got.name).toBe("Test Event");
    expect(got.owner_id).toBe("owner-1");
  });

  it("throws NotFoundError when event missing", async () => {
    const writeRepo = new InMemoryEventRepository();
    const readRepo = new InMemoryEventReadRepository(writeRepo);
    const uc = new GetEventUseCase(readRepo);
    await expect(uc.execute(9999)).rejects.toThrow(NotFoundError);
  });
});
