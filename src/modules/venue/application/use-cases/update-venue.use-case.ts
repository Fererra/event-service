import { VenueRepository } from "../../domain/repositories/venue.repository";
import {
  ConflictError,
  NotFoundError,
} from "../../../../shared/domain/errors/domain.error";

export type UpdateVenueCommand = {
  id: string;
  name?: string;
  capacity?: number | null;
  address?: string;
};

export class UpdateVenueUseCase {
  constructor(private readonly venueRepository: VenueRepository) {}

  async execute(command: UpdateVenueCommand): Promise<void> {
    const venue = await this.venueRepository.findById(command.id);

    if (!venue) {
      throw new NotFoundError("Venue not found");
    }

    if (command.name !== undefined) {
      venue.updateName(command.name);
    }

    if (command.address !== undefined && command.address !== venue.address) {
      const existingVenue = await this.venueRepository.findByAddress(
        command.address,
      );
      if (existingVenue && existingVenue.id !== venue.id) {
        throw new ConflictError("Venue with this address already exists");
      }
      venue.updateAddress(command.address);
    }

    if (command.capacity !== undefined) {
      venue.updateCapacity(command.capacity);
    }

    await this.venueRepository.save(venue);
  }
}
