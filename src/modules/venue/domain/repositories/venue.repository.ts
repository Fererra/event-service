import { Venue } from "../entities/venue.entity";

export interface VenueRepository {
  save(venue: Venue): Promise<void>;
  findById(id: string): Promise<Venue | null>;
  findByAddress(address: string): Promise<Venue | null>;
  delete(id: string): Promise<void>;
}
