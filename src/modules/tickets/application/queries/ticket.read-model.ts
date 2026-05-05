import { TicketType } from "../../domain/value-objects/ticket-type.enum";

export interface TicketReadModel {
  id: number;
  event_id: number;
  type: TicketType;
  limit: number;
  price: number;
}
