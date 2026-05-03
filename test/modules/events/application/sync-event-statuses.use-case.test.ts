import { SyncEventStatusesUseCase } from "../../../../src/modules/events/application/commands/sync-event-statuses.use-case";
import { InMemoryEventRepository } from "./in-memory.repositories";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";

describe("SyncEventStatusesUseCase", () => {
  it("publishes and finishes events based on now", async () => {
    const repo = new InMemoryEventRepository();
    const now = new Date();
    // event to publish: in_planning and start <= now <= end
    const e1 = new Event({
      id: null,
      ownerId: "u",
      name: "A",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(now.getTime() - 1000), new Date(now.getTime() + 1000)),
      status: EventStatus.IN_PLANNING,
      venueId: "v",
      createdAt: new Date(),
    });
    // event to finish: active and end <= now
    const e2 = new Event({
      id: null,
      ownerId: "u",
      name: "B",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(now.getTime() - 2000), new Date(now.getTime() - 1000)),
      status: EventStatus.ACTIVE,
      venueId: "v",
      createdAt: new Date(),
    });
    await repo.save(e1);
    await repo.save(e2);

    const uc = new SyncEventStatusesUseCase(repo);
    await uc.execute();

    const all = await repo.findAll();
    expect(all.some((x) => x.status === EventStatus.ACTIVE)).toBeTruthy();
    expect(all.some((x) => x.status === EventStatus.FINISHED)).toBeTruthy();
  });
});
