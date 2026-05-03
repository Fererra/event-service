import { ITicketRepository } from "../../domain/repositories/ticket.repository.interface";
import { IEventLookupRepository } from "../../domain/repositories/event-lookup.repository.interface";
import { IRegistrationCountRepository } from "../../domain/repositories/registration-count.repository.interface";
import { NotFoundError, DomainError } from "../../../../shared/domain/errors/domain.error";

export interface DeleteTicketCommand {
  eventId: number;
  ticketId: number;
}

export class DeleteTicketUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly eventLookupRepository: IEventLookupRepository,
    private readonly registrationCountRepository: IRegistrationCountRepository,
  ) {}

  async execute(command: DeleteTicketCommand): Promise<void> {
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

    const soldCount = await this.registrationCountRepository.countByTicketId(
      command.eventId,
      command.ticketId,
    );
    if (soldCount > 0) {
      throw new DomainError(
        `Cannot delete ticket with id ${command.ticketId} as there are already ${soldCount} ticket(s) sold`,
      );
    }

    await this.ticketRepository.delete(ticket.persistedId);
  }
}
