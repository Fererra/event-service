import { LessThanOrEqual, Repository } from "typeorm";
import { Event } from "../../domain/entities/event.entity";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import { EventOrmEntity } from "../orm/entities/event.orm-entity";
import { EventMapper } from "../orm/mappers/event.mapper";
import { EventStatus } from "../../domain/value-objects/event-status.enum";

export class PostgresEventRepository implements IEventRepository {
  constructor(private readonly ormRepo: Repository<EventOrmEntity>) {}

  async findAll(): Promise<Event[]> {
    const rows = await this.ormRepo.find({ order: { createdAt: "DESC" } });
    return rows.map(EventMapper.toDomain);
  }

  async findById(id: number): Promise<Event | null> {
    const row = await this.ormRepo.findOneBy({ id });
    return row ? EventMapper.toDomain(row) : null;
  }

  async findEventsToPublish(date: Date): Promise<Event[]> {
    const rows = await this.ormRepo.find({
      where: {
        status: EventStatus.IN_PLANNING,
        startTimestamp: LessThanOrEqual(date),
      },
    });
    return rows.map(EventMapper.toDomain);
  }

  async findEventsToFinish(date: Date): Promise<Event[]> {
    const rows = await this.ormRepo.find({
      where: {
        status: EventStatus.ACTIVE,
        endTimestamp: LessThanOrEqual(date),
      },
    });
    return rows.map(EventMapper.toDomain);
  }

  async save(event: Event): Promise<Event> {
    const saved = await this.ormRepo.save(EventMapper.toOrm(event));
    return EventMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepo.delete({ id });
  }
}
