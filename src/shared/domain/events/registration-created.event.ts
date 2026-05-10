import { IntegrationEvent } from "./integration-event";

export class RegistrationCreatedEvent extends IntegrationEvent {
  constructor(
    readonly registrationId: string,
    readonly userId: string,
    readonly eventId: number,
    readonly eventName: string,
    readonly ticketId: number,
  ) {
    super();
  }
}
