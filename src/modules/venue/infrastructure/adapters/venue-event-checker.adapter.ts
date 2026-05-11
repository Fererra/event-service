import { VenueEventChecker } from "../../application/ports/venue-event-checker.service";
import { EventsApi } from "../../../events/events.api";

export class VenueEventCheckerAdapter implements VenueEventChecker {
  constructor(private readonly eventsApi: EventsApi) {}

  async hasAnyEvents(venueId: string): Promise<boolean> {
    return await this.eventsApi.checkVenueHasEvents(venueId);
  }
}
