import { Registration } from "../../../../src/modules/registrations/domain/entities/registration.entity";
import { RegistrationRepository } from "../../../../src/modules/registrations/domain/repositories/registration.repository";
import {
  EventInfo,
  IEventInfoRepository,
} from "../../../../src/modules/registrations/domain/repositories/event-info.repository";
import {
  ITicketInfoRepository,
  TicketInfo,
} from "../../../../src/modules/registrations/domain/repositories/ticket-info.repository";

export class InMemoryRegistrationRepository implements RegistrationRepository {
  private readonly store = new Map<string, Registration>();

  async countByTicketId(ticketId: number): Promise<number> {
    return Array.from(this.store.values()).filter((r) => r.ticketId === ticketId).length;
  }

  async save(registration: Registration): Promise<Registration> {
    this.store.set(registration.id, registration);
    return registration;
  }

  async countByEventAndTicket(): Promise<number> {
    return this.store.size;
  }

  async findById(id: string): Promise<Registration | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Registration[]> {
    return Array.from(this.store.values()).filter((r) => r.userId === userId);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Registration | null> {
    const reg = this.store.get(id);
    return reg && reg.userId === userId ? reg : null;
  }

  async findByEventId(): Promise<Registration[]> {
    return Array.from(this.store.values());
  }

  async findByIdAndEventId(id: string): Promise<Registration | null> {
    return this.store.get(id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  getAll(): Registration[] {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}

export class FakeEventInfoRepository implements IEventInfoRepository {
  private readonly events = new Map<number, EventInfo>();

  setEvent(id: number): void {
    this.events.set(id, { id });
  }

  async findById(id: number): Promise<EventInfo | null> {
    return this.events.get(id) ?? null;
  }

  clear(): void {
    this.events.clear();
  }
}

export class FakeTicketInfoRepository implements ITicketInfoRepository {
  private readonly tickets = new Map<number, TicketInfo>();

  setTicket(id: number, eventId: number, limit: number = 100): void {
    this.tickets.set(id, { id, eventId, limit });
  }

  async findById(id: number): Promise<TicketInfo | null> {
    return this.tickets.get(id) ?? null;
  }

  clear(): void {
    this.tickets.clear();
  }
}
