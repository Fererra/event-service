import { NotificationsApi } from "../../../notifications/notifications.api";
import { NotFoundError, UnauthorizedError } from "../../../../shared/domain/errors/domain.error";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";

export interface CancelEventCommand {
  eventId: number;
  requestingUserId: string;
}

export class CancelEventUseCase {
  constructor(
    private readonly eventsRepository: IEventRepository,
    private readonly notificationsApi: NotificationsApi,
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

    try {
      await this.notificationsApi.notifyEventCancelled({
        eventId: event.id!,
        eventName: event.name,
        ownerId: event.ownerId,
      });
    } catch (error) {
      console.error("[NOTIFICATION] Failed to send event cancelled notification:", error);
    }
  }
}
