import { RegistrationCreatedEvent } from "../../../../shared/domain/events/registration-created.event";
import { IAnalyticsRepository } from "../../domain/repositories/analytics-repository.interface";
import { AnalyticsEventTranslator } from "../../infrastructure/acl/analytics-event.translator";
import { EventStat } from "../../domain/entities/event-stat.entity";

export class OnRegistrationCreatedHandler {
  constructor(
    private readonly analyticsRepository: IAnalyticsRepository,
    private readonly translator: AnalyticsEventTranslator,
  ) {}

  async handle(event: RegistrationCreatedEvent): Promise<void> {
    const record = this.translator.fromRegistrationCreatedEvent(event);

    let stat = await this.analyticsRepository.findByEventId(record.eventId);
    if (!stat) {
      stat = EventStat.create(record.eventId, record.eventName);
    }

    stat.recordRegistration(record.occurredAt);
    await this.analyticsRepository.save(stat);

    console.log(
      `[Analytics] Registration recorded: eventId=${record.eventId}, total=${stat.totalRegistrations}`,
    );
  }
}
