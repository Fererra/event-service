export interface ICheckVenueEventsRepository {
  hasAnyEvents(venueId: string): Promise<boolean>;
}
