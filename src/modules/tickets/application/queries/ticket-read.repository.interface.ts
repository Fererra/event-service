import { TicketReadModel } from "./ticket.read-model";

export interface ITicketReadRepository {
  findByEventId(eventId: number): Promise<TicketReadModel[]>;
}
