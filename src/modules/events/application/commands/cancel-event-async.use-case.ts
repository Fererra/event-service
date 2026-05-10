import { IEventBus } from "../../../../shared/application/ports/event-bus.interface";
import { EventCancelledEvent } from "../../../../shared/domain/events/event-cancelled.event";
import { NotFoundError, UnauthorizedError } from "../../../../shared/domain/errors/domain.error";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import { CancelEventCommand } from "./cancel-event.use-case";

export class CancelEventAsyncUseCase {
  constructor(
    private readonly eventsRepository: IEventRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: CancelEventCommand): Promise<void> {
    const event = await this.eventsRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundError(`Event ${command.eventId} not found`);
    }
    if (!event.isOwnedBy(command.requestingUserId)) {
      throw new UnauthorizedError(`User is not the owner of the event ${command.eventId}`);
    }

    event.cancel();
    await this.eventsRepository.save(event);

    await this.eventBus.publish(new EventCancelledEvent(event.id!, event.name, event.ownerId));
  }
}
