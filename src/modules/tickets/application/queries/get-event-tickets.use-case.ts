import { Ticket } from "../../domain/entities/ticket.entity";
import { ITicketRepository } from "../../domain/repositories/ticket.repository.interface";
import { IEventLookupRepository } from "../../domain/repositories/event-lookup.repository.interface";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetEventTicketsUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly eventLookupRepository: IEventLookupRepository,
  ) {}

  async execute(eventId: number): Promise<Ticket[]> {
    const event = await this.eventLookupRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${eventId} not found`);
    }
    return this.ticketRepository.findByEventId(eventId);
  }
}
