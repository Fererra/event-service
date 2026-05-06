export class CreateRegistrationCommand {
  constructor(
    public readonly userId: string,
    public readonly eventId: number,
    public readonly ticketId: number,
  ) {}
}
