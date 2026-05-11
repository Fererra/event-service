import { CreateTicketUseCase } from "./application/commands/create-ticket.use-case";
import { ITicketRepository } from "./domain/repositories/ticket.repository.interface";
import { TicketType } from "./domain/value-objects/ticket-type.enum";
import { DomainError } from "../../shared/domain/errors/domain.error";

export interface CreateTicketParams {
  type: string;
  limit: number;
  price: number;
}

export interface TicketSummaryDto {
  id: number;
  eventId: number;
  limit: number;
}

export class TicketsModule {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async findById(id: number): Promise<TicketSummaryDto | null> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) return null;
    return {
      id: ticket.persistedId,
      eventId: ticket.eventId,
      limit: ticket.limit,
    };
  }

  async createTicket(eventId: number, params: CreateTicketParams): Promise<number> {
    if (!Object.values(TicketType).includes(params.type as TicketType)) {
      throw new DomainError(`Invalid ticket type: ${params.type}`);
    }
    return this.createTicketUseCase.execute({
      eventId,
      type: params.type as TicketType,
      limit: params.limit,
      price: params.price,
    });
  }

  async createTicketsForEvent(eventId: number, tickets: CreateTicketParams[]): Promise<void> {
    for (const ticket of tickets) {
      await this.createTicket(eventId, ticket);
    }
  }
}
