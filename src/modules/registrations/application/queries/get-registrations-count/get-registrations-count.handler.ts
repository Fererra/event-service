import { RegistrationReadRepository } from "../../repositories/registration-read.repository";
import { GetRegistrationsCountQuery } from "./get-registrations-count.query";
import { NotFoundError } from "../../../../../shared/domain/errors/domain.error";
import { TicketInfoRepositoryAdapter } from "../../../infrastructure/adapters/ticket-info.repository.adapter";
import { EventInfoRepositoryAdapter } from "../../../infrastructure/adapters/event-info.repository.adapter";

export class GetRegistrationsCountQueryHandler {
  constructor(
    private readonly readRepository: RegistrationReadRepository,
    private readonly eventInfoRepository: EventInfoRepositoryAdapter,
    private readonly ticketInfoRepository: TicketInfoRepositoryAdapter,
  ) {}

  async handle(query: GetRegistrationsCountQuery): Promise<number> {
    console.log("Checking event:", query.eventId);
    const event = await this.eventInfoRepository.findById(query.eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${query.eventId} not found`);
    }

    const ticket = await this.ticketInfoRepository.findById(query.ticketId);
    if (!ticket) {
      throw new NotFoundError(`Ticket with id ${query.ticketId} not found`);
    }

    if (ticket && ticket.eventId !== query.eventId) {
      throw new NotFoundError(`Ticket with id ${query.ticketId} not found for the specified event`);
    }

    const count = await this.readRepository.countByEventAndTicket(query.eventId, query.ticketId);

    return count;
  }
}
