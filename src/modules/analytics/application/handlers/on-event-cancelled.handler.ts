import { EventCancelledEvent } from "../../../../shared/domain/events/event-cancelled.event";
import { IAnalyticsRepository } from "../../domain/repositories/analytics-repository.interface";
import { AnalyticsEventTranslator } from "../../infrastructure/acl/analytics-event.translator";
import { EventStat } from "../../domain/entities/event-stat.entity";

export class OnEventCancelledHandler {
  constructor(
    private readonly analyticsRepository: IAnalyticsRepository,
    private readonly translator: AnalyticsEventTranslator,
  ) {}

  async handle(event: EventCancelledEvent): Promise<void> {
    const record = this.translator.fromEventCancelledEvent(event);

    let stat = await this.analyticsRepository.findByEventId(record.eventId);
    if (!stat) {
      stat = EventStat.create(record.eventId, record.eventName);
    }

    stat.recordCancellation(record.cancelledAt);
    await this.analyticsRepository.save(stat);

    console.log(`[Analytics] Event cancelled recorded: eventId=${record.eventId}`);
  }
}
