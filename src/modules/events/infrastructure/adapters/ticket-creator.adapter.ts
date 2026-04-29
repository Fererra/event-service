import {
  InlineTicketData,
  ITicketCreator,
} from "../../domain/repositories/ticket-creator.interface";
import { CreateTicketUseCase } from "../../../tickets/application/commands/create-ticket.use-case";
import { TicketType } from "../../../tickets/domain/value-objects/ticket-type.enum";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class TicketCreatorAdapter implements ITicketCreator {
  constructor(private readonly createTicketUseCase: CreateTicketUseCase) {}

  async createTicketsForEvent(eventId: number, tickets: InlineTicketData[]): Promise<void> {
    for (const ticketData of tickets) {
      if (!Object.values(TicketType).includes(ticketData.type as TicketType)) {
        throw new DomainError(`Unknown ticket type: ${ticketData.type}`);
      }
      await this.createTicketUseCase.execute({
        eventId,
        type: ticketData.type as TicketType,
        limit: ticketData.limit,
        price: ticketData.limit,
      });
    }
  }
}
