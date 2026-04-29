import { VenueRepository } from "../../domain/repositories/venue.repository";
import { DomainError } from "../../../../shared/domain/errors/domain.error";

export class GetVenueByIdUseCase {
  constructor(private readonly venueRepository: VenueRepository) {}

  async execute(id: string) {
    const venue = await this.venueRepository.findById(id);

    if (!venue) {
      throw new DomainError("Venue not found");
    }

    return {
      id: venue.id,
      name: venue.name,
      capacity: venue.capacity,
      address: venue.address,
    };
  }
}
