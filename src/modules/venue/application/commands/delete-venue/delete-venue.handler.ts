import { VenueRepository } from "../../../domain/repositories/venue.repository";
import { DeleteVenueCommand } from "./delete-venue.command";
import { NotFoundError, ConflictError } from "../../../../../shared/domain/errors/domain.error";
import { IEventBus } from "../../../../../shared/application/ports/event-bus.interface";
import { VenueDeletedEvent } from "../../../../../shared/domain/events/venue-deleted.event";

export interface VenueEventChecker {
  hasAnyEvents(venueId: string): Promise<boolean>;
}

export class DeleteVenueCommandHandler {
  constructor(
    private readonly repository: VenueRepository,
    private readonly eventChecker: VenueEventChecker,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(command: DeleteVenueCommand): Promise<void> {
    const venue = await this.repository.findById(command.id);

    if (!venue) {
      throw new NotFoundError(`Venue with id ${command.id} not found`);
    }

    const hasAnyEvents = await this.eventChecker.hasAnyEvents(command.id);
    if (hasAnyEvents) {
      throw new ConflictError("Cannot delete venue with existing events");
    }

    await this.repository.delete(command.id);

    await this.eventBus.publish(new VenueDeletedEvent(command.id));
  }
}
