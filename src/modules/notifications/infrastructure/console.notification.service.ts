import {
  EventCancelledPayload,
  INotificationService,
  RegistrationConfirmedPayload,
} from "../application/ports/notification.service";

export class ConsoleNotificationService implements INotificationService {
  async sendRegistrationConfirmation(payload: RegistrationConfirmedPayload): Promise<void> {
    console.log(
      `[NOTIFICATION] Registration confirmed: user=${payload.userId} registered for event="${payload.eventName}" (registrationId=${payload.registrationId})`,
    );
  }

  async sendEventCancelledNotification(payload: EventCancelledPayload): Promise<void> {
    console.log(
      `[NOTIFICATION] Event cancelled: event="${payload.eventName}" (eventId=${payload.eventId}) by owner=${payload.ownerId}`,
    );
  }
}
