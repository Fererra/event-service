import { VenueFactory } from "../../../domain/factories/venue.factory";
import { VenueRepository } from "../../../domain/repositories/venue.repository";
import { UpdateVenueCommand } from "./update-venue.command";
import { NotFoundError } from "../../../../../shared/domain/errors/domain.error";
import { IEventBus } from "../../../../../shared/application/ports/event-bus.interface";
import { VenueUpdatedEvent } from "../../../../../shared/domain/events/venue-updated.event";

export class UpdateVenueCommandHandler {
  constructor(
    private readonly repository: VenueRepository,
    private readonly factory: VenueFactory,
    private readonly eventBus: IEventBus,
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

    await this.eventBus.publish(
      new VenueUpdatedEvent(venue.id, venue.name, venue.capacity, venue.address),
    );
  }
}
