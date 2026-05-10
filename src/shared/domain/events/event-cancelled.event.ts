import { IntegrationEvent } from "./integration-event";

export class EventCancelledEvent extends IntegrationEvent {
  constructor(
    readonly eventId: number,
    readonly eventName: string,
    readonly ownerId: string,
  ) {
    super();
  }
}
