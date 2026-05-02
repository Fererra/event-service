import { VenueRepository } from "../../domain/repositories/venue.repository";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";
import { VenueFactory } from "../../domain/factories/venue.factory";

export type UpdateVenueCommand = {
  id: string;
  name?: string;
  capacity?: number | null;
  address?: string;
};

export class UpdateVenueUseCase {
  constructor(
    private readonly venueRepository: VenueRepository,
    private readonly venueFactory: VenueFactory,
  ) {}

  async execute(command: UpdateVenueCommand): Promise<void> {
    const venue = await this.venueRepository.findById(command.id);

    if (!venue) {
      throw new NotFoundError("Venue not found");
    }

    if (command.name !== undefined) {
      venue.updateName(command.name);
    }

    if (command.address !== undefined && command.address !== venue.address) {
      await this.venueFactory.assertAddressAvailable(command.address, venue.id);
      venue.updateAddress(command.address);
    }

    if (command.capacity !== undefined) {
      venue.updateCapacity(command.capacity);
    }

    await this.venueRepository.save(venue);
  }
}
