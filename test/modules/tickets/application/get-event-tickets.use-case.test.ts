import { GetEventTicketsUseCase } from "../../../../src/modules/tickets/application/queries/get-event-tickets.use-case";
import { InMemoryTicketRepository, FakeEventLookupRepository } from "./in-memory.repositories";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";

describe("GetEventTicketsUseCase (application unit)", () => {
  it("returns tickets list when event exists", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const t1 = InMemoryTicketRepository.createTicketForTest(10, TicketType.REGULAR, 5, 5);
    await ticketRepo.save(t1);

    const eventLookup = new FakeEventLookupRepository([
      { id: 10, venueId: "00000000-0000-0000-0000-000000000001", isCancelledOrFinished: false },
    ]);
    const uc = new GetEventTicketsUseCase(ticketRepo, eventLookup);

    const list = await uc.execute(10);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].eventId).toBe(10);
  });

  it("throws NotFoundError when event missing", async () => {
    const ticketRepo = new InMemoryTicketRepository();
    const eventLookup = new FakeEventLookupRepository([]);
    const uc = new GetEventTicketsUseCase(ticketRepo, eventLookup);
    await expect(uc.execute(9999)).rejects.toThrow();
  });
});
