import { Venue } from "../../../../src/modules/venue/domain/entities/venue.entity";
import { VenueRepository } from "../../../../src/modules/venue/domain/repositories/venue.repository";
import { VenueEventChecker } from "../../../../src/modules/venue/application/ports/venue-event-checker.service";

export class InMemoryVenueRepository implements VenueRepository {
  private readonly store = new Map<string, Venue>();

  async save(venue: Venue): Promise<void> {
    this.store.set(venue.id, venue);
  }

  async findByAddress(address: string): Promise<Venue | null> {
    for (const venue of this.store.values()) {
      if (venue.address === address) return venue;
    }
    return null;
  }

  async findById(id: string): Promise<Venue | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Venue[]> {
    return Array.from(this.store.values());
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}

export class FakeVenueEventChecker implements VenueEventChecker {
  private venues = new Set<string>();

  setHasEvents(venueId: string, hasEvents: boolean): void {
    if (hasEvents) {
      this.venues.add(venueId);
    } else {
      this.venues.delete(venueId);
    }
  }

  async hasAnyEvents(venueId: string): Promise<boolean> {
    return this.venues.has(venueId);
  }

  clear(): void {
    this.venues.clear();
  }
}
