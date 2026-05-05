import { Event } from "../entities/event.entity";
import { EventStatus } from "../value-objects/event-status.enum";
import { EventPeriod } from "../value-objects/event-period.vo";
import { IVenueRepository } from "../repositories/venue.repository.interface";
import { InlineTicketData } from "../repositories/ticket-creator.interface";
import { TicketType } from "../../../tickets/domain/value-objects/ticket-type.enum";
import { DomainError, NotFoundError } from "../../../../shared/domain/errors/domain.error";

export interface CreateEventData {
  ownerId: string;
  name: string;
  organisator: string;
  description: string;
  startTimestamp: Date;
  endTimestamp: Date;
  venueId: string;
  tickets?: InlineTicketData[];
}

export class EventFactory {
  constructor(private readonly venueRepository: IVenueRepository) {}

  async create(data: CreateEventData): Promise<Event> {
    const venue = await this.venueRepository.findById(data.venueId);
    if (!venue) {
      throw new NotFoundError(`Venue with id ${data.venueId} not found`);
    }

    if (data.tickets && data.tickets.length > 0) {
      for (const ticket of data.tickets) {
        if (!Object.values(TicketType).includes(ticket.type as TicketType)) {
          throw new DomainError(`Unknown ticket type: ${ticket.type}`);
        }
      }

      if (data.tickets.length > 3) {
        throw new DomainError("Cannot create more than 3 ticket types for an event");
      }

      const types = data.tickets.map((ticket) => ticket.type);
      if (new Set(types).size !== types.length) {
        throw new DomainError("Ticket types must be unique");
      }

      if (venue.capacity !== null) {
        const totalLimit = data.tickets.reduce((sum, ticket) => sum + ticket.limit, 0);
        if (totalLimit > venue.capacity) {
          throw new DomainError(
            `Total ticket limit (${totalLimit}) exceeds venue capacity (${venue.capacity})`,
          );
        }
      }
    }

    const period = new EventPeriod(data.startTimestamp, data.endTimestamp);
    return new Event({
      id: null,
      ownerId: data.ownerId,
      name: data.name,
      organisator: data.organisator,
      description: data.description,
      period,
      status: EventStatus.IN_PLANNING,
      venueId: data.venueId,
      createdAt: new Date(),
    });
  }
}
