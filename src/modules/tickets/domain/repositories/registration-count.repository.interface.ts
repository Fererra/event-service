export interface IRegistrationCountRepository {
  countByTicketId(ticketId: number): Promise<number>;
}
