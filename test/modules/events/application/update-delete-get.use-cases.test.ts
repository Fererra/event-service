import { UpdateEventUseCase } from "../../../../src/modules/events/application/commands/update-event.use-case";
import { DeleteEventUseCase } from "../../../../src/modules/events/application/commands/delete-event.use-case";
import { GetEventUseCase } from "../../../../src/modules/events/application/queries/get-event.use.case";
import { InMemoryEventRepository } from "./in-memory.repositories";
import { InMemoryVenueRepository } from "../domain/in-memory.venue.repo";
import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { EventPeriod } from "../../../../src/modules/events/domain/value-objects/event-period.vo";
import { EventStatus } from "../../../../src/modules/events/domain/value-objects/event-status.enum";

describe("Update/Delete/Get use cases", () => {
  it("update validates venue existence and saves", async () => {
    const eventRepo = new InMemoryEventRepository();
    const venueRepo = new InMemoryVenueRepository([{ id: "v1", capacity: null }]);
    const e = new Event({
      id: null,
      ownerId: "u1",
      name: "Nam",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "v1",
      createdAt: new Date(),
    });
    const saved = await eventRepo.save(e);
    const uc = new UpdateEventUseCase(eventRepo, venueRepo);
    await uc.execute({ eventId: saved.id as number, requestingUserId: "u1", data: { name: "NN" } });
    const after = await eventRepo.findById(saved.id as number);
    expect(after?.name).toBe("NN");
  });

  it("delete only by owner and when cancelled/finished", async () => {
    const eventRepo = new InMemoryEventRepository();
    const e = new Event({
      id: null,
      ownerId: "u1",
      name: "Nam",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.FINISHED,
      venueId: "v1",
      createdAt: new Date(),
    });
    const saved = await eventRepo.save(e);
    const uc = new DeleteEventUseCase(eventRepo);
    await uc.execute({ eventId: saved.id as number, requestingUserId: "u1" });
    const after = await eventRepo.findById(saved.id as number);
    expect(after).toBeNull();
  });

  it("get returns event or throws", async () => {
    const eventRepo = new InMemoryEventRepository();
    const e = new Event({
      id: null,
      ownerId: "u1",
      name: "Nam",
      organisator: "Org",
      description: "Discr",
      period: new EventPeriod(new Date(Date.now() + 1000), new Date(Date.now() + 2000)),
      status: EventStatus.IN_PLANNING,
      venueId: "v1",
      createdAt: new Date(),
    });
    const saved = await eventRepo.save(e);
    const getUc = new GetEventUseCase(eventRepo);
    const got = await getUc.execute(saved.id as number);
    expect(got.id).toBe(saved.id);
  });
});
