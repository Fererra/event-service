import { ITicketRepository } from "../../../tickets/domain/repositories/ticket.repository.interface";
import {
  ITicketInfoRepository,
  TicketInfo,
} from "../../domain/repositories/ticket-info.repository";

export class TicketInfoRepositoryAdapter implements ITicketInfoRepository {
  constructor(private readonly ticketRepository: ITicketRepository) {}

  async findById(id: number): Promise<TicketInfo | null> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) return null;
    return {
      id: ticket.id,
      eventId: ticket.eventId,
      limit: ticket.limit,
    };
  }
}
