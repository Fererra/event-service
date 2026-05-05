import { VenueFactory } from "../../../domain/factories/venue.factory";
import { VenueRepository } from "../../../domain/repositories/venue.repository";
import { CreateVenueCommand } from "./create-venue.command";

export class CreateVenueCommandHandler {
  constructor(
    private readonly repository: VenueRepository,
    private readonly factory: VenueFactory,
  ) {}

  async handle(command: CreateVenueCommand): Promise<string> {
    const venue = await this.factory.create(command.name, command.capacity, command.address);

    await this.repository.save(venue);

    return venue.id;
  }
}
