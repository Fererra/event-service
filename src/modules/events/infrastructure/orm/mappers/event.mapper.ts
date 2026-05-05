import { Event } from "../../../domain/entities/event.entity";
import { EventPeriod } from "../../../domain/value-objects/event-period.vo";
import { EventOrmEntity } from "../entities/event.orm-entity";

export class EventMapper {
  static toDomain(orm: EventOrmEntity): Event {
    return new Event({
      id: orm.id,
      ownerId: orm.ownerId,
      name: orm.name,
      organisator: orm.organisator,
      description: orm.description,
      period: new EventPeriod(orm.startTimestamp, orm.endTimestamp),
      status: orm.status,
      venueId: orm.venueId,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Event): EventOrmEntity {
    const orm = new EventOrmEntity();
    if (domain.id !== null) orm.id = domain.id;
    orm.ownerId = domain.ownerId;
    orm.name = domain.name;
    orm.organisator = domain.organisator;
    orm.description = domain.description;
    orm.startTimestamp = domain.period.startDate;
    orm.endTimestamp = domain.period.endDate;
    orm.status = domain.status;
    orm.venueId = domain.venueId;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
