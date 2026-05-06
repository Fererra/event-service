export class GetRegistrationsCountQuery {
  constructor(
    public readonly eventId: number,
    public readonly ticketId: number,
  ) {}
}
