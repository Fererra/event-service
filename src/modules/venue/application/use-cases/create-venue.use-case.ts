import { VenueFactory } from "../../domain/factories/venue.factory";
import { VenueRepository } from "../../domain/repositories/venue.repository";

export type CreateVenueCommand = {
  name: string;
  capacity: number | null;
  address: string;
};

export class CreateVenueUseCase {
  constructor(
    private readonly venueRepository: VenueRepository,
    private readonly venueFactory: VenueFactory,
  ) {}

  async execute(command: CreateVenueCommand): Promise<string> {
    const venue = await this.venueFactory.create(command.name, command.capacity, command.address);

    await this.venueRepository.save(venue);

    return venue.id;
  }
}
