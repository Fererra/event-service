export interface IRegistrationCountRepository {
  countByTicketId(eventId: number, ticketId: number): Promise<number>;
}
