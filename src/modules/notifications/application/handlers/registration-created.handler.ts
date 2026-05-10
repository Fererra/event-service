import { RegistrationCreatedEvent } from "../../../../shared/domain/events/registration-created.event";
import { INotificationService } from "../ports/notification.service";

export class RegistrationCreatedCommandHandler {
  constructor(private readonly notificationService: INotificationService) {}

  async handle(event: RegistrationCreatedEvent): Promise<void> {
    await this.notificationService.sendRegistrationConfirmation({
      registrationId: event.registrationId,
      userId: event.userId,
      eventId: event.eventId,
      eventName: event.eventName,
      ticketId: event.ticketId,
    });
  }
}
