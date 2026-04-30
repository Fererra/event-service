import { Ticket } from "../entities/ticket.entity";
import { TicketType } from "../value-objects/ticket-type.enum";
import { DomainError } from "../../../../shared/domain/errors/domain.error";
import { ITicketRepository } from "../repositories/ticket.repository.interface";
import { IVenueRepository } from "../repositories/venue.repository.interface";

const MAX_TICKET_TYPES = 3;

export interface CreateTicketData {
  eventId: number;
  venueId: string;
  type: TicketType;
  limit: number;
  price: number;
}

export class TicketFactory {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly venueRepository: IVenueRepository,
  ) {}

  async create(data: CreateTicketData): Promise<Ticket> {
    const existing = await this.ticketRepository.findByEventId(data.eventId);

    if (existing.length >= MAX_TICKET_TYPES) {
      throw new DomainError(
        `Cannot create more than ${MAX_TICKET_TYPES} ticket types for an event`,
      );
    }

    if (existing.some((t) => t.type === data.type)) {
      throw new DomainError(`Ticket type ${data.type} already exists for this event`);
    }

    const venue = await this.venueRepository.findById(data.venueId);
    if (venue && venue.capacity !== null) {
      const currentTotal = existing.reduce((sum, t) => sum + t.limit, 0);
      const newTotal = currentTotal + data.limit;
      if (newTotal > venue.capacity) {
        throw new DomainError(
          `Total ticket limit (${newTotal}) exceeds venue capacity (${venue.capacity})`,
        );
      }
    }

    return new Ticket({
      id: 0,
      eventId: data.eventId,
      type: data.type,
      limit: data.limit,
      price: data.price,
    });
  }
}
