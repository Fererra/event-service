export interface EventLookupData {
  id: number;
  venueId: string;
  isCancelledOrFinished: boolean;
}

export interface IEventLookupRepository {
  findById(eventId: number): Promise<EventLookupData | null>;
}
