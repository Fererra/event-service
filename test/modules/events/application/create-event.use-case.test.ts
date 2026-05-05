import { CreateEventUseCase } from "../../../../src/modules/events/application/commands/create-event.use-case";
import { EventFactory } from "../../../../src/modules/events/domain/factories/event.factory";
import { InMemoryEventRepository, FakeTicketCreator } from "./in-memory.repositories";
import { InMemoryVenueRepository } from "../domain/in-memory.venue.repo";

describe("CreateEventUseCase (application unit)", () => {
  it("creates event and delegates ticket creation, returns id", async () => {
    const venueRepo = new InMemoryVenueRepository([{ id: "v1", capacity: 100 }]);
    const factory = new EventFactory(venueRepo);
    const eventRepo = new InMemoryEventRepository();
    const ticketCreator = new FakeTicketCreator();
    const uc = new CreateEventUseCase(factory, eventRepo, ticketCreator);

    const eventId = await uc.execute({
      ownerId: "u1",
      name: "Elise",
      organisator: "Org",
      description: "Disc",
      startTimestamp: new Date(Date.now() + 1000),
      endTimestamp: new Date(Date.now() + 2000),
      venueId: "v1",
      tickets: [{ type: "regular", limit: 10, price: 5 }],
    });

    expect(typeof eventId).toBe("number");
    expect(eventId).toBeDefined();
    expect(ticketCreator.created.length).toBe(1);
    expect(ticketCreator.created[0].eventId).toBe(eventId);
  });
});
