import { TicketFactory } from "../../domain/factories/ticket.factory";
import { TicketType } from "../../domain/value-objects/ticket-type.enum";
import { ITicketRepository } from "../../domain/repositories/ticket.repository.interface";
import { IEventLookupRepository } from "../../domain/repositories/event-lookup.repository.interface";
import { NotFoundError, DomainError } from "../../../../shared/domain/errors/domain.error";
import { Ticket } from "../../domain/entities/ticket.entity";

export interface CreateTicketCommand {
  eventId: number;
  type: TicketType;
  limit: number;
  price: number;
}

export class CreateTicketUseCase {
  constructor(
    private readonly ticketFactory: TicketFactory,
    private readonly ticketRepository: ITicketRepository,
    private readonly eventLookupRepository: IEventLookupRepository,
  ) {}

  async execute(command: CreateTicketCommand): Promise<Ticket> {
    const event = await this.eventLookupRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${command.eventId} not found`);
    }
    if (event.isCancelledOrFinished) {
      throw new DomainError(
        `Cannot create ticket for cancelled or finished event (${command.eventId})`,
      );
    }
    const ticket = await this.ticketFactory.create({
      eventId: command.eventId,
      venueId: event.venueId,
      type: command.type,
      limit: command.limit,
      price: command.price,
    });
    const saved = await this.ticketRepository.save(ticket);
    return saved;
  }
}
