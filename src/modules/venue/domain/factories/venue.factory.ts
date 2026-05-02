import { v4 as uuidv4 } from "uuid";
import { Venue } from "../entities/venue.entity";
import { ConflictError } from "../../../../shared/domain/errors/domain.error";
import { VenueRepository } from "../repositories/venue.repository";

export class VenueFactory {
  constructor(private readonly venueRepository: VenueRepository) {}

  async create(name: string, capacity: number | null, address: string): Promise<Venue> {
    await this.assertAddressAvailable(address);

    const id = uuidv4();
    return Venue.create({
      id,
      name,
      capacity,
      address,
    });
  }

  async assertAddressAvailable(address: string, excludeId?: string): Promise<void> {
    const existingVenue = await this.venueRepository.findByAddress(address);
    if (existingVenue && existingVenue.id !== excludeId) {
      throw new ConflictError("Venue with this address already exists");
    }
  }
}
