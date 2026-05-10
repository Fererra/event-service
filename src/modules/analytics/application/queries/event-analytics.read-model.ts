export interface EventAnalyticsReadModel {
  event_id: number;
  event_name: string;
  total_registrations: number;
  cancelled_at: string | null;
  last_activity_at: string;
}

export interface AnalyticsSummaryReadModel {
  total_events_tracked: number;
  total_registrations: number;
  cancelled_events_count: number;
}
