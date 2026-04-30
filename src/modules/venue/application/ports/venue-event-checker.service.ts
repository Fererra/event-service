export interface VenueEventChecker {
  hasAnyEvents(venueId: string): Promise<boolean>;
}
