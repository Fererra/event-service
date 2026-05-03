import { Ticket } from "../../../../src/modules/tickets/domain/entities/ticket.entity";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";
import { DomainError } from "../../../../src/shared/domain/errors/domain.error";

describe("Ticket entity (domain unit)", () => {
  it("creates ticket with valid props", () => {
    const t = Ticket.create({ eventId: 1, type: TicketType.REGULAR, limit: 10, price: 5 });
    expect(t.id).toBeNull();
    expect(t.eventId).toBe(1);
    expect(t.type).toBe(TicketType.REGULAR);
    expect(t.limit).toBe(10);
    expect(t.price).toBe(5);
  });

  it("throws when creating with non-positive limit", () => {
    expect(() =>
      Ticket.create({ eventId: 1, type: TicketType.REGULAR, limit: 0, price: 5 }),
    ).toThrow(DomainError);
  });

  it("throws when creating with negative price", () => {
    expect(() =>
      Ticket.create({ eventId: 1, type: TicketType.REGULAR, limit: 5, price: -1 }),
    ).toThrow(DomainError);
  });

  it("updates limit and price with validation", () => {
    const t = Ticket.create({ eventId: 1, type: TicketType.VIP, limit: 5, price: 10 });
    t.updateLimit(7);
    expect(t.limit).toBe(7);
    t.updatePrice(12);
    expect(t.price).toBe(12);
    expect(() => t.updateLimit(0)).toThrow(DomainError);
    expect(() => t.updatePrice(-5)).toThrow(DomainError);
  });

  it("fromPersistence requires id", () => {
    expect(() =>
      Ticket.fromPersistence({
        id: null,
        eventId: 1,
        type: TicketType.REGULAR,
        limit: 1,
        price: 1,
      }),
    ).toThrow(DomainError);
  });
});
