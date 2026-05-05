import { GetEventsUseCase } from "../../../../src/modules/events/application/queries/get-events.use-case";
import { InMemoryEventRepository, InMemoryEventReadRepository } from "./in-memory.repositories";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";

describe("GetEventsUseCase (application unit)", () => {
  it("returns empty array when no events", async () => {
    const writeRepo = new InMemoryEventRepository();
    const readRepo = new InMemoryEventReadRepository(writeRepo);
    const uc = new GetEventsUseCase(readRepo);
    const list = await uc.execute();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it("returns read models list when events present", async () => {
    const writeRepo = new InMemoryEventRepository();
    const readRepo = new InMemoryEventReadRepository(writeRepo);

    const e1 = new Event({
      id: null,
      ownerId: "o1",
      name: "E1",
      organisator: "Org",
      description: "D",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "00000000-0000-0000-0000-000000000001",
      createdAt: new Date(),
    });
    const e2 = new Event({
      id: null,
      ownerId: "o2",
      name: "E2",
      organisator: "Org",
      description: "D",
      period: new EventPeriod(new Date(Date.now() + 2000), new Date(Date.now() + 3000)),
      status: EventStatus.IN_PLANNING,
      venueId: "00000000-0000-0000-0000-000000000001",
      createdAt: new Date(),
    });
    await writeRepo.save(e1);
    await writeRepo.save(e2);

    const uc = new GetEventsUseCase(readRepo);
    const list = await uc.execute();
    expect(list.length).toBeGreaterThanOrEqual(2);
    const names = list.map((x) => x.name);
    expect(names).toContain("E1");
    expect(names).toContain("E2");
  });
});
