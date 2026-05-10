import { Repository } from "typeorm";
import { EventStat } from "../../domain/entities/event-stat.entity";
import { IAnalyticsRepository } from "../../domain/repositories/analytics-repository.interface";
import { EventStatOrmEntity } from "../orm/entities/event-stat.orm-entity";
import { EventStatMapper } from "../mappers/event-stat.mapper";

export class PostgresAnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly ormRepo: Repository<EventStatOrmEntity>) {}

  async findByEventId(eventId: number): Promise<EventStat | null> {
    const row = await this.ormRepo.findOneBy({ eventId });
    return row ? EventStatMapper.toDomain(row) : null;
  }

  async findAll(): Promise<EventStat[]> {
    const rows = await this.ormRepo.find({ order: { lastActivityAt: "DESC" } });
    return rows.map((r) => EventStatMapper.toDomain(r));
  }

  async save(stat: EventStat): Promise<EventStat> {
    const orm = new EventStatOrmEntity();
    if (stat.id !== null) orm.id = stat.id;
    orm.eventId = stat.eventId;
    orm.eventName = stat.eventName;
    orm.totalRegistrations = stat.totalRegistrations;
    orm.cancelledAt = stat.cancelledAt;
    orm.lastActivityAt = stat.lastActivityAt;

    const saved = await this.ormRepo.save(orm);
    return EventStatMapper.toDomain(saved);
  }
}
