import { Repository } from "typeorm";
import { Event } from "../../domain/entities/event.entity";
import { IEventRepository } from "../../domain/repositories/event.repository.interface";
import { EventOrmEntity } from "../orm/entities/event.orm-entity";
import { EventMapper } from "../orm/mappers/event.mapper";

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

  async save(event: Event): Promise<Event> {
    const saved = await this.ormRepo.save(EventMapper.toOrm(event));
    return EventMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepo.delete({ id });
  }
}
