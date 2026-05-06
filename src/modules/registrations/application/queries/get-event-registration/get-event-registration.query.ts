export class GetEventRegistrationQuery {
  constructor(
    public readonly registrationId: string,
    public readonly eventId: number,
  ) {}
}
