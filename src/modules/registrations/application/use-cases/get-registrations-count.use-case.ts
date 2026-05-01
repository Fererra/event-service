import {
  NotFoundError,
  UnauthorizedError,
} from "../../../../shared/domain/errors/domain.error";
import { IEventRepository } from "../../../events/domain/repositories/event.repository.interface";
import { ITicketRepository } from "../../../tickets/domain/repositories/ticket.repository.interface";
import { RegistrationRepository } from "../../domain/repositories/registration.repository";

export class GetRegistrationsCountUseCase {
  constructor(
    private readonly registrationRepo: RegistrationRepository,
    private readonly ticketRepository: ITicketRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(
    eventId: number,
    ticketId: number,
    userRole: string,
  ): Promise<number> {
    const event = await this.eventRepository.findById(eventId);

    if (userRole !== "admin") {
      throw new UnauthorizedError("Forbidden: admin access required");
    }

    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError(`Ticket category with ID ${ticketId} not found`);
    }

    if (ticket.eventId !== eventId) {
      throw new NotFoundError(
        `Ticket ${ticketId} is not part of event ${eventId}`,
      );
    }

    return await this.registrationRepo.countByEventAndTicket(eventId, ticketId);
  }
}
