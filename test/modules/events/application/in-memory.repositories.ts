import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { IEventRepository } from "../../../../src/modules/events/domain/repositories/event.repository.interface";
import {
  InlineTicketData,
  ITicketCreator,
} from "../../../../src/modules/events/domain/repositories/ticket-creator.interface";

export class InMemoryEventRepository implements IEventRepository {
  private items: Event[] = [];
  private idSeq = 1;

  async findAll(): Promise<Event[]> {
    return [...this.items];
  }
  async findById(id: number): Promise<Event | null> {
    return this.items.find((e) => e.id === id) ?? null;
  }
  async findEventsToPublish(date: Date): Promise<Event[]> {
    return this.items.filter(
      (e) => e.status === "in_planning" && e.startTimestamp <= date && e.endTimestamp >= date,
    );
  }
  async findEventsToFinish(date: Date): Promise<Event[]> {
    return this.items.filter(
      (e) => (e.status === "active" || e.status === "in_planning") && e.endTimestamp <= date,
    );
  }
  async save(event: Event): Promise<Event> {
    if (event.id === null) {
      (event as any)._id = this.idSeq++;
      this.items.push(event);
      return event;
    }
    const idx = this.items.findIndex((e) => e.id === event.id);
    if (idx >= 0) this.items[idx] = event;
    else this.items.push(event);
    return event;
  }
  async delete(id: number): Promise<void> {
    this.items = this.items.filter((e) => e.id !== id);
  }
}

export class FakeTicketCreator implements ITicketCreator {
  public created: { eventId: number; tickets: InlineTicketData[] }[] = [];
  async createTicketsForEvent(eventId: number, ticketsData: InlineTicketData[]): Promise<void> {
    this.created.push({ eventId, tickets: ticketsData });
  }
}
