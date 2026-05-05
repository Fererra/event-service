import { UpdateTicketUseCase } from "../../../../src/modules/tickets/application/commands/update-ticket.use-case";
import { DeleteTicketUseCase } from "../../../../src/modules/tickets/application/commands/delete-ticket.use-case";
import { GetEventTicketsUseCase } from "../../../../src/modules/tickets/application/queries/get-event-tickets.use-case";
import {
  InMemoryTicketRepository,
  InMemoryTicketReadRepository,
  FakeEventLookupRepository,
  FakeEventReadRepository,
  FakeRegistrationCountRepository,
} from "./in-memory.repositories";
import { InMemoryVenueRepository } from "../domain/in-memory.venue.repo";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";

describe("Ticket use cases (application unit)", () => {
  const TEST_VENUE_ID = "00000000-0000-0000-0000-000000000001";

  it("update limit and price with validations", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const ticket = InMemoryTicketRepository.createTicketForTest(1, TicketType.REGULAR, 5, 5);
    await ticketRepo.save(ticket);
    const eventLookup = new FakeEventLookupRepository([
      { id: 1, venueId: TEST_VENUE_ID, isCancelledOrFinished: false },
    ]);
    const registrationRepo = new FakeRegistrationCountRepository();
    registrationRepo.setCount(1, ticket.id as number, 2);
    const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
    const uc = new UpdateTicketUseCase(ticketRepo, eventLookup, venueRepo, registrationRepo);

    await expect(
      uc.execute({ eventId: 1, ticketId: ticket.id as number, limit: 1 }),
    ).rejects.toThrow();

    await uc.execute({ eventId: 1, ticketId: ticket.id as number, limit: 10, price: 8 });
    const after = await ticketRepo.findById(ticket.id as number);
    expect(after?.limit).toBe(10);
    expect(after?.price).toBe(8);
  });

  it("delete ticket when no sold", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const ticket = InMemoryTicketRepository.createTicketForTest(2, TicketType.VIP, 5, 10);
    await ticketRepo.save(ticket);
    const eventLookup = new FakeEventLookupRepository([
      { id: 2, venueId: TEST_VENUE_ID, isCancelledOrFinished: false },
    ]);
    const registrationRepo = new FakeRegistrationCountRepository();
    registrationRepo.setCount(2, ticket.id as number, 0);
    const uc = new DeleteTicketUseCase(ticketRepo, eventLookup, registrationRepo);

    await uc.execute({ eventId: 2, ticketId: ticket.id as number });
    const after = await ticketRepo.findById(ticket.id as number);
    expect(after).toBeNull();
  });

  it("get event tickets returns read models or throws", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const readRepo = new InMemoryTicketReadRepository(ticketRepo);
    const t1 = InMemoryTicketRepository.createTicketForTest(3, TicketType.REGULAR, 5, 5);
    await ticketRepo.save(t1);

    const eventReadRepo = new FakeEventReadRepository([3]);
    const uc = new GetEventTicketsUseCase(readRepo, eventReadRepo);

    const list = await uc.execute(3);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].event_id).toBe(3);

    const emptyEventReadRepo = new FakeEventReadRepository([]);
    const ucMissing = new GetEventTicketsUseCase(readRepo, emptyEventReadRepo);
    await expect(ucMissing.execute(999)).rejects.toThrow();
  });
});
