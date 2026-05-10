export interface RegistrationConfirmedPayload {
  registrationId: string;
  userId: string;
  eventId: number;
  eventName: string;
  ticketId: number;
}

export interface EventCancelledPayload {
  eventId: number;
  eventName: string;
  ownerId: string;
}

export interface INotificationService {
  sendRegistrationConfirmation(payload: RegistrationConfirmedPayload): Promise<void>;
  sendEventCancelledNotification(payload: EventCancelledPayload): Promise<void>;
}
