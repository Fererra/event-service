import { EventCancelledEvent } from "../../../../shared/domain/events/event-cancelled.event";
import { INotificationService } from "../ports/notification.service";

export class EventCancelledCommandHandler {
  constructor(private readonly notificationService: INotificationService) {}

  async handle(event: EventCancelledEvent): Promise<void> {
    await this.notificationService.sendEventCancelledNotification({
      eventId: event.eventId,
      eventName: event.eventName,
      ownerId: event.ownerId,
    });
  }
}
