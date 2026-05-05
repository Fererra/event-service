import { Repository } from "typeorm";
import { EventReadModel } from "../../application/queries/event.read-model";
import { IEventReadRepository } from "../../application/queries/event-read.repository.interface";
import { EventOrmEntity } from "../orm/entities/event.orm-entity";
import { EventReadMapper } from "../orm/mappers/event-read.mapper";

export class PostgresEventReadRepository implements IEventReadRepository {
  constructor(private readonly ormRepo: Repository<EventOrmEntity>) {}

  async findAll(): Promise<EventReadModel[]> {
    const rows = await this.ormRepo.find({ order: { createdAt: "DESC" } });
    return rows.map(EventReadMapper.toReadModel);
  }

  async findById(id: number): Promise<EventReadModel | null> {
    const row = await this.ormRepo.findOneBy({ id });
    return row ? EventReadMapper.toReadModel(row) : null;
  }
}
