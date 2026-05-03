import { DeleteTicketUseCase } from "../../../../src/modules/tickets/application/commands/delete-ticket.use-case";
import {
  InMemoryTicketRepository,
  FakeEventLookupRepository,
  FakeRegistrationCountRepository,
} from "./in-memory.repositories";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";
import { NotFoundError, DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("DeleteTicketUseCase (application unit)", () => {
  const TEST_VENUE_ID = "00000000-0000-0000-0000-000000000001";

  it("deletes ticket when exists and no sold", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const ticket = InMemoryTicketRepository.createTicketForTest(20, TicketType.REGULAR, 5, 5);
    await ticketRepo.save(ticket);

    const eventLookup = new FakeEventLookupRepository([
      { id: 20, venueId: TEST_VENUE_ID, isCancelledOrFinished: false },
    ]);
    const regRepo = new FakeRegistrationCountRepository();
    regRepo.setCount(20, ticket.id as number, 0);

    const uc = new DeleteTicketUseCase(ticketRepo, eventLookup, regRepo);
    await uc.execute({ eventId: 20, ticketId: ticket.id as number });

    const after = await ticketRepo.findById(ticket.id as number);
    expect(after).toBeNull();
  });

  it("throws NotFoundError when ticket missing", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const eventLookup = new FakeEventLookupRepository([
      { id: 30, venueId: TEST_VENUE_ID, isCancelledOrFinished: false },
    ]);
    const regRepo = new FakeRegistrationCountRepository();
    const uc = new DeleteTicketUseCase(ticketRepo, eventLookup, regRepo);
    await expect(uc.execute({ eventId: 30, ticketId: 9999 })).rejects.toThrow(NotFoundError);
  });

  it("throws DomainError when sold > 0", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const ticket = InMemoryTicketRepository.createTicketForTest(40, TicketType.VIP, 5, 10);
    await ticketRepo.save(ticket);

    const eventLookup = new FakeEventLookupRepository([
      { id: 40, venueId: TEST_VENUE_ID, isCancelledOrFinished: false },
    ]);
    const regRepo = new FakeRegistrationCountRepository();
    regRepo.setCount(40, ticket.id as number, 3);

    const uc = new DeleteTicketUseCase(ticketRepo, eventLookup, regRepo);
    await expect(uc.execute({ eventId: 40, ticketId: ticket.id as number })).rejects.toThrow(
      DomainError,
    );
  });

  it("throws NotFoundError when event missing", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const ticket = InMemoryTicketRepository.createTicketForTest(50, TicketType.REGULAR, 5, 5);
    await ticketRepo.save(ticket);

    const eventLookup = new FakeEventLookupRepository([]);
    const regRepo = new FakeRegistrationCountRepository();
    const uc = new DeleteTicketUseCase(ticketRepo, eventLookup, regRepo);
    await expect(uc.execute({ eventId: 50, ticketId: ticket.id as number })).rejects.toThrow(
      NotFoundError,
    );
  });
});
