import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import { NotFoundError, UnauthorizedError } from "../../../../shared/domain/errors/domain.error";

export interface DeleteEventCommand {
  eventId: number;
  requestingUserId: string;
}

export class DeleteEventUseCase {
  constructor(private readonly eventsRepository: IEventRepository) {}

  async execute(command: DeleteEventCommand): Promise<void> {
    const event = await this.eventsRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundError(`Event ${command.eventId} not found`);
    }
    if (!event.isOwnedBy(command.requestingUserId)) {
      throw new UnauthorizedError(`User is not the owner of the event ${command.eventId}`);
    }
    if (!event.isCancelledOrFinished()) {
      throw new Error(`Event ${command.eventId} cannot be deleted in its current state`);
    }

    await this.eventsRepository.delete(event.id);
  }
}
