import { VenueFactory } from "../../../domain/factories/venue.factory";
import { VenueRepository } from "../../../domain/repositories/venue.repository";
import { CreateVenueCommand } from "./create-venue.command";
import { IEventBus } from "../../../../../shared/application/ports/event-bus.interface";
import { VenueCreatedEvent } from "../../../../../shared/domain/events/venue-created.event";

export class CreateVenueCommandHandler {
  constructor(
    private readonly repository: VenueRepository,
    private readonly factory: VenueFactory,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(command: CreateVenueCommand): Promise<string> {
    const venue = await this.factory.create(command.name, command.capacity, command.address);

    await this.repository.save(venue);

    await this.eventBus.publish(
      new VenueCreatedEvent(venue.id, venue.name, venue.capacity, venue.address),
    );

    return venue.id;
  }
}
