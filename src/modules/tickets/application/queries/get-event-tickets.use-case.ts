import { TicketReadModel } from "./ticket.read-model";
import { ITicketReadRepository } from "./ticket-read.repository.interface";
import { IEventReadRepository } from "../../../events/application/queries/event-read.repository.interface";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetEventTicketsUseCase {
  constructor(
    private readonly ticketReadRepository: ITicketReadRepository,
    private readonly eventLookupRepository: IEventReadRepository,
  ) {}

  async execute(eventId: number): Promise<TicketReadModel[]> {
    const event = await this.eventLookupRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${eventId} not found`);
    }
    return this.ticketReadRepository.findByEventId(eventId);
  }
}
