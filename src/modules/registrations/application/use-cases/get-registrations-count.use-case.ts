import { NotFoundError } from "../../../../shared/domain/errors/domain.error";
import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { IEventInfoRepository } from "../../domain/repositories/event-info.repository";
import { ITicketInfoRepository } from "../../domain/repositories/ticket-info.repository";

export class GetRegistrationsCountUseCase {
  constructor(
    private readonly registrationRepo: RegistrationRepository,
    private readonly ticketRepository: ITicketInfoRepository,
    private readonly eventRepository: IEventInfoRepository,
  ) {}

  async execute(eventId: number, ticketId: number): Promise<number> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError(`Ticket category with ID ${ticketId} not found`);
    }

    if (ticket.eventId !== eventId) {
      throw new NotFoundError(`Ticket ${ticketId} is not part of event ${eventId}`);
    }

    return this.registrationRepo.countByEventAndTicket(eventId, ticketId);
  }
}
