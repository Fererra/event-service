import { IntegrationEvent } from "./integration-event";

export class RegistrationCancelledEvent extends IntegrationEvent {
  constructor(
    readonly registrationId: string,
    readonly userId: string,
    readonly ticketId: number,
  ) {
    super();
  }
}
