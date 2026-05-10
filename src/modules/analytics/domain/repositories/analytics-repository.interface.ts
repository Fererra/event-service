import { EventStat } from "../../domain/entities/event-stat.entity";

export interface IAnalyticsRepository {
  findByEventId(eventId: number): Promise<EventStat | null>;
  findAll(): Promise<EventStat[]>;
  save(stat: EventStat): Promise<EventStat>;
}
