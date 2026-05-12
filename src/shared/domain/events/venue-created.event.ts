import { IntegrationEvent } from "./integration-event";

export class VenueCreatedEvent extends IntegrationEvent {
  constructor(
    public readonly venueId: string,
    public readonly name: string,
    public readonly capacity: number | null,
    public readonly address: string,
  ) {
    super();
  }
}
