export interface TicketInfo {
  id: number;
  eventId: number;
  limit: number;
}

export interface ITicketInfoRepository {
  findById(id: number): Promise<TicketInfo | null>;
}
