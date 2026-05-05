import { VenueFactory } from "../../../domain/factories/venue.factory";
import { VenueRepository } from "../../../domain/repositories/venue.repository";
import { UpdateVenueCommand } from "./update-venue.command";
import { NotFoundError } from "../../../../../shared/domain/errors/domain.error";

export class UpdateVenueCommandHandler {
  constructor(
    private readonly repository: VenueRepository,
    private readonly factory: VenueFactory,
  ) {}

  async handle(command: UpdateVenueCommand): Promise<void> {
    const venue = await this.repository.findById(command.id);
    if (!venue) {
      throw new NotFoundError(`Venue with id ${command.id} not found`);
    }

    if (command.name !== undefined) {
      venue.updateName(command.name);
    }

    if (command.address !== undefined && venue.address !== command.address) {
      await this.factory.assertAddressAvailable(command.address, venue.id);
      venue.updateAddress(command.address);
    }

    if (command.capacity !== undefined) {
      venue.updateCapacity(command.capacity);
    }

    await this.repository.save(venue);
  }
}
