import { TicketReadModel } from "./ticket.read-model";
import { ITicketReadRepository } from "./ticket-read.repository.interface";
import { IEventLookupRepository } from "../../domain/repositories/event-lookup.repository.interface";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetEventTicketsUseCase {
  constructor(
    private readonly ticketReadRepository: ITicketReadRepository,
    private readonly eventLookupRepository: IEventLookupRepository,
  ) {}

  async execute(eventId: number): Promise<TicketReadModel[]> {
    const event = await this.eventLookupRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${eventId} not found`);
    }
    return this.ticketReadRepository.findByEventId(eventId);
  }
}
