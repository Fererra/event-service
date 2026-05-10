import { EventCancelledEvent } from "../../../../shared/domain/events/event-cancelled.event";
import { RegistrationCreatedEvent } from "../../../../shared/domain/events/registration-created.event";

export interface CancellationRecord {
  eventId: number;
  eventName: string;
  cancelledAt: Date;
}

export interface RegistrationRecord {
  eventId: number;
  eventName: string;
  occurredAt: Date;
}

export class AnalyticsEventTranslator {
  fromEventCancelledEvent(event: EventCancelledEvent): CancellationRecord {
    return {
      eventId: event.eventId,
      eventName: event.eventName,
      cancelledAt: event.occurredAt,
    };
  }

  fromRegistrationCreatedEvent(event: RegistrationCreatedEvent): RegistrationRecord {
    return {
      eventId: event.eventId,
      eventName: event.eventName,
      occurredAt: event.occurredAt,
    };
  }
}
