import {
  EventLookupData,
  IEventLookupRepository,
} from "../../domain/repositories/event-lookup.repository.interface";
import { EventsApi } from "../../../events/events.api";

export class EventLookupAdapter implements IEventLookupRepository {
  constructor(private readonly eventsModule: EventsApi) {}

  async findById(eventId: number): Promise<EventLookupData | null> {
    const event = await this.eventsModule.findById(eventId);
    if (!event) return null;
    return {
      id: event.id,
      venueId: event.venueId,
      isCancelledOrFinished: event.status === "cancelled" || event.status === "finished",
    };
  }
}
