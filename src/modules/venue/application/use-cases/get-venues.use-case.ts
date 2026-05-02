import { VenueRepository } from "../../domain/repositories/venue.repository";

export class GetAllVenuesUseCase {
  constructor(private readonly venueRepository: VenueRepository) {}

  async execute(): Promise<
    {
      id: string;
      name: string;
      capacity: number | null;
      address: string;
    }[]
  > {
    const venues = await this.venueRepository.findAll();

    return venues.map((venue) => ({
      id: venue.id,
      name: venue.name,
      capacity: venue.capacity,
      address: venue.address,
    }));
  }
}
