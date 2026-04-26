import { EventFactory } from "../../domain/factories/event.factory";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import { IVenueRepository } from "../../domain/repositories/venue.repository.interface";
import {
  ITicketCreator,
  InlineTicketData,
} from "../../domain/repositories/ticket-creator.interface";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export interface CreateEventCommand {
  ownerId: string;
  name: string;
  organisator: string;
  description: string;
  startTimestamp: Date;
  endTimestamp: Date;
  venueId: number;
  tickets?: InlineTicketData[];
}

export class CreateEventUseCase {
  constructor(
    private readonly eventFactory: EventFactory,
    private readonly eventRepository: IEventRepository,
    private readonly venueRepository: IVenueRepository,
    private readonly ticketCreator: ITicketCreator,
  ) {}

  async execute(command: CreateEventCommand): Promise<number> {
    if (command.tickets && command.tickets.length > 0) {
      if (command.tickets.length > 3) {
        throw new DomainError("Cannot create more than 3 ticket types for an event");
      }
      const types = command.tickets.map((t) => t.type);
      if (new Set(types).size !== types.length) {
        throw new DomainError("Ticket types must be unique");
      }
    }

    const event = await this.eventFactory.create(command);
    const savedEvent = await this.eventRepository.save(event);

    if (command.tickets && command.tickets.length > 0) {
      const venue = await this.venueRepository.findById(command.venueId);
      if (venue && venue.capacity !== null) {
        const totalLimit = command.tickets.reduce((sum, t) => sum + t.limit, 0);
        if (totalLimit > venue.capacity) {
          throw new DomainError(
            `Total ticket limit (${totalLimit}) exceeds venue capacity (${venue.capacity})`,
          );
        }
      }
      await this.ticketCreator.createTicketsForEvent(savedEvent.id, command.tickets);
    }
    return savedEvent.id;
  }
}
