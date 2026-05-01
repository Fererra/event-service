import { randomUUID } from "crypto";
import { Registration } from "../entities/registration.entity";
import {
  DomainError,
  NotFoundError,
} from "../../../../shared/domain/errors/domain.error";
import { RegistrationRepository } from "../repositories/registration.repository";
import { ITicketRepository } from "../../../tickets/domain/repositories/ticket.repository.interface";
import { IEventRepository } from "../../../events/domain/repositories/event.repository.interface";

export class RegistrationFactory {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
    private readonly ticketRepository: ITicketRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async createNew(
    userId: string,
    eventId: number,
    ticketId: number,
  ): Promise<Registration> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found");
    }

    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket category not found");
    }

    if (ticket.eventId !== eventId) {
      throw new DomainError(
        "This ticket does not belong to the specified event",
      );
    }

    const currentRegistrationsCount =
      await this.registrationRepository.countByTicketId(ticketId);
    if (currentRegistrationsCount >= ticket.limit) {
      throw new DomainError(
        `Tickets sold out. Limit of ${ticket.limit} reached for this ticket type`,
      );
    }

    return Registration.create({
      id: randomUUID(),
      userId,
      ticketId,
    });
  }
}
