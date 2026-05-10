import { EventStat } from "../../domain/entities/event-stat.entity";
import { EventStatOrmEntity } from "../orm/entities/event-stat.orm-entity";

export class EventStatMapper {
  static toDomain(orm: EventStatOrmEntity): EventStat {
    return new EventStat({
      id: orm.id,
      eventId: orm.eventId,
      eventName: orm.eventName,
      totalRegistrations: orm.totalRegistrations,
      cancelledAt: orm.cancelledAt,
      lastActivityAt: orm.lastActivityAt,
    });
  }
}
