import { Ticket } from "../entities/ticket.entity";
import { TicketType } from "../enums/ticket-type.enum";

export interface ITicketRepository {
  findByEventId(eventId: number): Promise<Ticket[]>;
  findById(id: number): Promise<Ticket | null>;
  findByEventIdAndType(eventId: number, type: TicketType): Promise<Ticket | null>;
  save(ticket: Ticket): Promise<Ticket>;
  delete(id: number): Promise<void>;
}
