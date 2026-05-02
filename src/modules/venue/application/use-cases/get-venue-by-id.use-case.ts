import { VenueRepository } from "../../domain/repositories/venue.repository";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetVenueByIdUseCase {
  constructor(private readonly venueRepository: VenueRepository) {}

  async execute(id: string): Promise<{
    id: string;
    name: string;
    capacity: number | null;
    address: string;
  }> {
    const venue = await this.venueRepository.findById(id);

    if (!venue) {
      throw new NotFoundError("Venue not found");
    }

    return {
      id: venue.id,
      name: venue.name,
      capacity: venue.capacity,
      address: venue.address,
    };
  }
}
