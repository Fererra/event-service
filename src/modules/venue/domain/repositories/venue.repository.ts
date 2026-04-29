import { Venue } from "../entities/venue.entity";

export interface VenueRepository {
  save(venue: Venue): Promise<void>;
  findByAddress(address: string): Promise<Venue | null>;
  findAll(): Promise<Venue[]>;
  findById(id: string): Promise<Venue | null>;
}
