export interface InlineTicketData {
  type: string;
  limit: number;
  price: number;
}

export interface ITicketCreator {
  createTicketsForEvent(eventId: number, ticketsData: InlineTicketData[]): Promise<void>;
}
