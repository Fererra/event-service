import { UpdateEventData } from "../../domain/entities/event.entity";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import { IVenueRepository } from "../../domain/repositories/venue.repository.interface";
import { NotFoundError, UnauthorizedError } from "../../../../shared/domain/errors/domain.error";

export interface UpdateEventCommand {
  eventId: number;
  requestingUserId: string;
  data: UpdateEventData;
}

export class UpdateEventUseCase {
  constructor(
    private readonly eventsRepository: IEventRepository,
    private readonly venueRepository: IVenueRepository,
  ) {}

  async execute(command: UpdateEventCommand): Promise<void> {
    const event = await this.eventsRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundError(`Event ${command.eventId} not found`);
    }
    if (!event.isOwnedBy(command.requestingUserId)) {
      throw new UnauthorizedError(`User is not the owner of the event ${command.eventId}`);
    }
    if (command.data.venueId !== undefined) {
      const venue = await this.venueRepository.findById(command.data.venueId);
      if (!venue) {
        throw new NotFoundError(`Venue ${command.data.venueId} not found`);
      }
    }
    event.update(command.data);
    await this.eventsRepository.save(event);
  }
}
