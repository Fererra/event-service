import {
  InlineTicketData,
  ITicketCreator,
} from "../../domain/repositories/ticket-creator.interface";
import { CreateTicketUseCase } from "../../../tickets/application/commands/create-ticket.use-case";
import { TicketType } from "../../../tickets/domain/value-objects/ticket-type.enum";

export class TicketCreatorAdapter implements ITicketCreator {
  constructor(private readonly createTicketUseCase: CreateTicketUseCase) {}

  async createTicketsForEvent(eventId: number, tickets: InlineTicketData[]): Promise<void> {
    for (const ticketData of tickets) {
      await this.createTicketUseCase.execute({
        eventId,
        type: ticketData.type as TicketType,
        limit: ticketData.limit,
        price: ticketData.price,
      });
    }
  }
}
