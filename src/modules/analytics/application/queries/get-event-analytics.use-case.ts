import { IAnalyticsRepository } from "../../domain/repositories/analytics-repository.interface";
import { EventAnalyticsReadModel } from "./event-analytics.read-model";
import { NotFoundError } from "../../../../shared/domain/errors/domain.error";

export class GetEventAnalyticsUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(eventId: number): Promise<EventAnalyticsReadModel> {
    const stat = await this.analyticsRepository.findByEventId(eventId);
    if (!stat) {
      throw new NotFoundError(`Analytics data for event ${eventId} not found`);
    }
    return {
      event_id: stat.eventId,
      event_name: stat.eventName,
      total_registrations: stat.totalRegistrations,
      cancelled_at: stat.cancelledAt ? stat.cancelledAt.toISOString() : null,
      last_activity_at: stat.lastActivityAt.toISOString(),
    };
  }
}
