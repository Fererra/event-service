import { VenueFactory } from "../../domain/factories/venue.factory";
import { VenueRepository } from "../../domain/repositories/venue.repository";

export type CreateVenueCommand = {
  name: string;
  capacity: number | null;
  address: string;
};

export class CreateVenueUseCase {
  constructor(private readonly venueRepository: VenueRepository) {}

  async execute(command: CreateVenueCommand): Promise<string> {
    const venue = await VenueFactory.create(
      command.name,
      command.capacity,
      command.address,
      this.venueRepository,
    );

    await this.venueRepository.save(venue);

    return venue.id;
  }
}
