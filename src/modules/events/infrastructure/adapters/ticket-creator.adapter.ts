import {
  InlineTicketData,
  ITicketCreator,
} from "../../domain/repositories/ticket-creator.interface";
import { TicketsApi } from "../../../tickets/tickets.api";

export class TicketCreatorAdapter implements ITicketCreator {
  constructor(private readonly ticketsModule: TicketsApi) {}

  async createTicketsForEvent(eventId: number, tickets: InlineTicketData[]): Promise<void> {
    await this.ticketsModule.createTicketsForEvent(
      eventId,
      tickets.map((t) => ({ type: t.type, limit: t.limit, price: t.price })),
    );
  }
}
