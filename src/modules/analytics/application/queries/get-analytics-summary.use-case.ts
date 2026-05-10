import { IAnalyticsRepository } from "../../domain/repositories/analytics-repository.interface";
import { AnalyticsSummaryReadModel } from "./event-analytics.read-model";

export class GetAnalyticsSummaryUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<AnalyticsSummaryReadModel> {
    const all = await this.analyticsRepository.findAll();
    return {
      total_events_tracked: all.length,
      total_registrations: all.reduce((sum, s) => sum + s.totalRegistrations, 0),
      cancelled_events_count: all.filter((s) => s.cancelledAt !== null).length,
    };
  }
}
