import { Ticket } from "../../../../src/modules/tickets/domain/entities/ticket.entity";
import { TicketType } from "../../../../src/modules/tickets/domain/value-objects/ticket-type.enum";
import { ITicketRepository } from "../../../../src/modules/tickets/domain/repositories/ticket.repository.interface";
import {
  IEventLookupRepository,
  EventLookupData,
} from "../../../../src/modules/tickets/domain/repositories/event-lookup.repository.interface";
import { IRegistrationCountRepository } from "../../../../src/modules/tickets/domain/repositories/registration-count.repository.interface";

export class InMemoryTicketRepository implements ITicketRepository {
  private items: Ticket[] = [];
  private idSeq = 1;

  constructor(initial: Ticket[] = []) {
    this.items = [...initial];
    for (const t of this.items) {
      if (t.id === null) {
        Object.defineProperty(t as any, "_id", {
          value: this.idSeq++,
          writable: true,
          configurable: true,
        });
      } else {
        this.idSeq = Math.max(this.idSeq, (t.id as number) + 1);
      }
    }
  }

  async findByEventId(eventId: number): Promise<Ticket[]> {
    return this.items.filter((t) => t.eventId === eventId).map((t) => t);
  }

  async findById(id: number): Promise<Ticket | null> {
    return this.items.find((t) => t.id === id) ?? null;
  }

  async findByEventIdAndType(eventId: number, type: TicketType): Promise<Ticket | null> {
    return this.items.find((t) => t.eventId === eventId && t.type === type) ?? null;
  }

  async save(ticket: Ticket): Promise<Ticket> {
    if (ticket.id === null) {
      const newId = this.idSeq++;
      Object.defineProperty(ticket as any, "_id", {
        value: newId,
        writable: true,
        configurable: true,
      });
      this.items.push(ticket);
      return ticket;
    }
    const idx = this.items.findIndex((t) => t.id === ticket.id);
    if (idx >= 0) this.items[idx] = ticket;
    else this.items.push(ticket);
    return ticket;
  }

  async delete(id: number): Promise<void> {
    this.items = this.items.filter((t) => t.id !== id);
  }

  // helpers for tests
  static createTicketForTest(
    eventId: number,
    type: TicketType,
    limit: number,
    price: number,
  ): Ticket {
    const t = Ticket.create({ eventId, type, limit, price });
    Object.defineProperty(t as any, "_id", {
      value: Math.floor(Math.random() * 10000) + 1,
      writable: true,
      configurable: true,
    });
    return t;
  }
}

export class FakeEventLookupRepository implements IEventLookupRepository {
  private items: EventLookupData[] = [];

  constructor(initial: EventLookupData[] = []) {
    this.items = [...initial];
  }

  async findById(eventId: number) {
    return this.items.find((e) => e.id === eventId) ?? null;
  }

  add(e: EventLookupData) {
    this.items.push(e);
  }
}

export class FakeRegistrationCountRepository implements IRegistrationCountRepository {
  private counts = new Map<string, number>();
  setCount(eventId: number, ticketId: number, count: number) {
    this.counts.set(`${eventId}:${ticketId}`, count);
  }
  async countByTicketId(eventId: number, ticketId: number): Promise<number> {
    return this.counts.get(`${eventId}:${ticketId}`) ?? 0;
  }
}
