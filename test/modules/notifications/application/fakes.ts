import {
  EventCancelledPayload,
  INotificationService,
  RegistrationConfirmedPayload,
} from "../../../../src/modules/notifications/application/ports/notification.service";

export class FakeNotificationService implements INotificationService {
  public registrationConfirmations: RegistrationConfirmedPayload[] = [];
  public eventCancelledNotifications: EventCancelledPayload[] = [];

  async sendRegistrationConfirmation(payload: RegistrationConfirmedPayload): Promise<void> {
    this.registrationConfirmations.push(payload);
  }

  async sendEventCancelledNotification(payload: EventCancelledPayload): Promise<void> {
    this.eventCancelledNotifications.push(payload);
  }
}
