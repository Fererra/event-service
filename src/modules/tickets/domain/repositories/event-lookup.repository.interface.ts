export interface EventLookupData {
  id: number;
  venueId: number;
  isCancelledOrFinished: boolean;
}

export interface IEventLookupRepository {
  findById(eventId: number): Promise<EventLookupData | null>;
}
