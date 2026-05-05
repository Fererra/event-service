import { GetEventTicketsUseCase } from "../../../../src/modules/tickets/application/queries/get-event-tickets.use-case";
import {
  InMemoryTicketRepository,
  InMemoryTicketReadRepository,
  FakeEventReadRepository,
} from "./in-memory.repositories";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";
import { NotFoundError } from "../../../../src/shared/domain/errors/domain.error";

describe("GetEventTicketsUseCase (application unit)", () => {
  it("returns read models when event exists", async () => {
    const writeRepo = new InMemoryTicketRepository();
    const readRepo = new InMemoryTicketReadRepository(writeRepo);
    const t1 = InMemoryTicketRepository.createTicketForTest(10, TicketType.REGULAR, 5, 5);
    await writeRepo.save(t1);

    const eventReadRepo = new FakeEventReadRepository([10]);
    const uc = new GetEventTicketsUseCase(readRepo, eventReadRepo);

    const list = await uc.execute(10);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].event_id).toBe(10);
    expect(list[0].type).toBe(TicketType.REGULAR);
  });

  it("throws NotFoundError when event missing", async () => {
    const writeRepo = new InMemoryTicketRepository();
    const readRepo = new InMemoryTicketReadRepository(writeRepo);
    const eventReadRepo = new FakeEventReadRepository([]);
    const uc = new GetEventTicketsUseCase(readRepo, eventReadRepo);
    await expect(uc.execute(9999)).rejects.toThrow(NotFoundError);
  });
});
