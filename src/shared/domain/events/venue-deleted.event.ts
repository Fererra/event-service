import { IntegrationEvent } from "./integration-event";

export class VenueDeletedEvent extends IntegrationEvent {
  constructor(public readonly venueId: string) {
    super();
  }
}
