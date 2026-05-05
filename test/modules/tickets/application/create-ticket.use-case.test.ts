import { CreateTicketUseCase } from "../../../../src/modules/tickets/application/commands/create-ticket.use-case";
import { TicketFactory } from "../../../../src/modules/tickets/domain/factories/ticket.factory";
import { InMemoryTicketRepository, FakeEventLookupRepository } from "./in-memory.repositories";
import { InMemoryVenueRepository } from "../domain/in-memory.venue.repo";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";

describe("CreateTicketUseCase (application unit)", () => {
  const TEST_VENUE_ID = "00000000-0000-0000-0000-000000000001";

  it("creates ticket when event exists and not finished", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
    const factory = new TicketFactory(ticketRepo as any, venueRepo as any);
    const eventLookup = new FakeEventLookupRepository([
      { id: 1, venueId: TEST_VENUE_ID, isCancelledOrFinished: false },
    ]);
    const uc = new CreateTicketUseCase(factory, ticketRepo, eventLookup);

    const ticketId = await uc.execute({
      eventId: 1,
      type: TicketType.REGULAR,
      limit: 10,
      price: 5,
    });

    expect(typeof ticketId).toBe("number");
    expect(ticketId).toBeDefined();

    const saved = await ticketRepo.findById(ticketId);
    expect(saved?.eventId).toBe(1);
  });

  it("throws when event not found", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const venueRepo = new InMemoryVenueRepository([]);
    const factory = new TicketFactory(ticketRepo as any, venueRepo as any);
    const eventLookup = new FakeEventLookupRepository([]);
    const uc = new CreateTicketUseCase(factory, ticketRepo, eventLookup);

    await expect(
      uc.execute({ eventId: 999, type: TicketType.REGULAR, limit: 1, price: 1 }),
    ).rejects.toThrow();
  });

  it("throws when event cancelled/finished", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
    const factory = new TicketFactory(ticketRepo as any, venueRepo as any);
    const eventLookup = new FakeEventLookupRepository([
      { id: 2, venueId: TEST_VENUE_ID, isCancelledOrFinished: true },
    ]);
    const uc = new CreateTicketUseCase(factory, ticketRepo, eventLookup);

    await expect(
      uc.execute({ eventId: 2, type: TicketType.REGULAR, limit: 1, price: 1 }),
    ).rejects.toThrow();
  });
});
