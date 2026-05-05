import { Event } from "../../../../src/modules/events/domain/entities/event.entity";
import { IEventRepository } from "../../../../src/modules/events/domain/repositories/event.repository.interface";
import {
  InlineTicketData,
  ITicketCreator,
} from "../../../../src/modules/events/domain/repositories/ticket-creator.interface";
import { IEventReadRepository } from "../../../../src/modules/events/application/queries/event-read.repository.interface";
import { EventReadModel } from "../../../../src/modules/events/application/queries/event.read-model";

function eventToReadModel(event: Event): EventReadModel {
  return {
    id: event.id as number,
    owner_id: event.ownerId,
    name: event.name,
    organisator: event.organisator,
    description: event.description,
    start_timestamp: event.startTimestamp.toISOString(),
    end_timestamp: event.endTimestamp.toISOString(),
    status: event.status,
    venue_id: event.venueId,
    created_at: event.createdAt.toISOString(),
  };
}

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

export class InMemoryEventReadRepository implements IEventReadRepository {
  constructor(private readonly writeRepo: InMemoryEventRepository) {}

  async findAll(): Promise<EventReadModel[]> {
    const events = await this.writeRepo.findAll();
    return events.map(eventToReadModel);
  }

  async findById(id: number): Promise<EventReadModel | null> {
    const event = await this.writeRepo.findById(id);
    return event ? eventToReadModel(event) : null;
  }
}

export class FakeTicketCreator implements ITicketCreator {
  public created: { eventId: number; tickets: InlineTicketData[] }[] = [];
  async createTicketsForEvent(eventId: number, ticketsData: InlineTicketData[]): Promise<void> {
    this.created.push({ eventId, tickets: ticketsData });
  }
}
