import { TicketFactory } from "../../../../src/modules/tickets/domain/factories/ticket.factory";
import { InMemoryTicketRepository } from "../application/in-memory.repositories";
import { InMemoryVenueRepository } from "./in-memory.venue.repo";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("TicketFactory (domain unit)", () => {
  const TEST_VENUE_ID = "00000000-0000-0000-0000-000000000001";

  it("creates ticket when constraints ok", async () => {
    const ticketRepo = new InMemoryTicketRepository([]);
    const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
    const factory = new TicketFactory(ticketRepo as any, venueRepo as any);

    const ticket = await factory.create({
      eventId: 1,
      venueId: TEST_VENUE_ID,
      type: TicketType.REGULAR,
      limit: 10,
      price: 5,
    });

    expect(ticket.id).toBeNull();
    expect(ticket.type).toBe(TicketType.REGULAR);
  });

  it("throws when too many ticket types", async () => {
    const existing = [
      (function make(type: TicketType) {
        const t = InMemoryTicketRepository.createTicketForTest(1, type, 1, 1);
        return t;
      })(TicketType.REGULAR),
      InMemoryTicketRepository.createTicketForTest(1, TicketType.VIP, 1, 1),
      InMemoryTicketRepository.createTicketForTest(1, TicketType.EARLY_BIRD, 1, 1),
    ];
    const ticketRepo = new InMemoryTicketRepository(existing);
    const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
    const factory = new TicketFactory(ticketRepo as any, venueRepo as any);

    await expect(
      factory.create({
        eventId: 1,
        venueId: TEST_VENUE_ID,
        type: TicketType.REGULAR,
        limit: 1,
        price: 1,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("throws when duplicate type exists", async () => {
    const existing = [InMemoryTicketRepository.createTicketForTest(1, TicketType.REGULAR, 5, 5)];
    const ticketRepo = new InMemoryTicketRepository(existing);
    const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
    const factory = new TicketFactory(ticketRepo as any, venueRepo as any);

    await expect(
      factory.create({
        eventId: 1,
        venueId: TEST_VENUE_ID,
        type: TicketType.REGULAR,
        limit: 1,
        price: 1,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("throws when capacity overflow", async () => {
    const existing = [InMemoryTicketRepository.createTicketForTest(1, TicketType.REGULAR, 60, 5)];
    const ticketRepo = new InMemoryTicketRepository(existing);
    const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
    const factory = new TicketFactory(ticketRepo as any, venueRepo as any);

    await expect(
      factory.create({
        eventId: 1,
        venueId: TEST_VENUE_ID,
        type: TicketType.VIP,
        limit: 50,
        price: 10,
      }),
    ).rejects.toThrow(DomainError);
  });
});
