import { v4 as uuidv4 } from "uuid";
import { Venue } from "../entities/venue.entity";
import { VenueCapacity } from "../value-objects/venue-capacity.vo";
import { DomainError } from "../../../../shared/domain/errors/domain.error";
import { VenueRepository } from "../repositories/venue.repository";

export class VenueFactory {
  static async create(
    name: string,
    capacity: number | null,
    address: string,
    venueRepository: VenueRepository,
  ): Promise<Venue> {
    if (!name || name.trim() === "") {
      throw new DomainError("Venue name cannot be empty");
    }
    if (!address || address.trim() === "") {
      throw new DomainError("Venue address cannot be empty");
    }

    const existingVenue = await venueRepository.findByAddress(address);
    if (existingVenue) {
      throw new DomainError("Venue with this address already exists");
    }

    const id = uuidv4();
    const venueCapacity = VenueCapacity.create(capacity);
    return new Venue(id, name, venueCapacity, address);
  }

  static reconstitute(
    id: string,
    name: string,
    capacity: number | null,
    address: string,
  ): Venue {
    const venueCapacity = VenueCapacity.create(capacity);
    return new Venue(id, name, venueCapacity, address);
  }
}
