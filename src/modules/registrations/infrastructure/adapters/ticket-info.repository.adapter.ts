import {
  ITicketInfoRepository,
  TicketInfo,
} from "../../domain/repositories/ticket-info.repository";
import { TicketsApi } from "../../../tickets/tickets.api";

export class TicketInfoRepositoryAdapter implements ITicketInfoRepository {
  constructor(private readonly ticketsApi: TicketsApi) {}

  async findById(id: number): Promise<TicketInfo | null> {
    const ticketDto = await this.ticketsApi.findById(id);

    if (!ticketDto) return null;

    return {
      id: ticketDto.id,
      eventId: ticketDto.eventId,
      limit: ticketDto.limit,
    };
  }
}
