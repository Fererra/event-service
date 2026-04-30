import { ITicketRepository } from "../../domain/repositories/ticket.repository.interface";
import { IEventLookupRepository } from "../../domain/repositories/event-lookup.repository.interface";
import { IVenueRepository } from "../../domain/repositories/venue.repository.interface";
import { IRegistrationCountRepository } from "../../domain/repositories/registration-count.repository.interface";
import { NotFoundError, DomainError } from "../../../../shared/domain/errors/domain.error";

export interface UpdateTicketCommand {
  eventId: number;
  ticketId: number;
  limit?: number;
  price?: number;
}

export class UpdateTicketUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly eventLookupRepository: IEventLookupRepository,
    private readonly venueRepository: IVenueRepository,
    private readonly registrationCountRepository: IRegistrationCountRepository,
  ) {}

  async execute(command: UpdateTicketCommand): Promise<void> {
    const event = await this.eventLookupRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${command.eventId} not found`);
    }

    const ticket = await this.ticketRepository.findById(command.ticketId);
    if (!ticket || ticket.eventId !== command.eventId) {
      throw new NotFoundError(
        `Ticket with id ${command.ticketId} not found for event ${command.eventId}`,
      );
    }

    if (command.limit !== undefined) {
      const soldCount = await this.registrationCountRepository.countByTicketId(command.ticketId);
      if (command.limit < soldCount) {
        throw new DomainError(
          `Cannot set limit to ${command.limit} as there are already ${soldCount} ticket(s) sold`,
        );
      }
      const venue = await this.venueRepository.findById(event.venueId);
      if (venue && venue.capacity !== null) {
        const allTickets = await this.ticketRepository.findByEventId(command.eventId);
        const otherTotal = allTickets
          .filter((t) => t.id !== ticket.id)
          .reduce((sum, t) => sum + t.limit, 0);
        const newTotal = otherTotal + command.limit;
        if (newTotal > venue.capacity) {
          throw new DomainError(
            `Cannot set limit to ${command.limit} as total tickets limit (${newTotal}) would exceed venue capacity (${venue.capacity})`,
          );
        }
      }
      ticket.updateLimit(command.limit);
    }

    if (command.price !== undefined) {
      ticket.updatePrice(command.price);
    }

    await this.ticketRepository.save(ticket);
  }
}
