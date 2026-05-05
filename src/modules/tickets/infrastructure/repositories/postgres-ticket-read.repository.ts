import { Repository } from "typeorm";
import { TicketReadModel } from "../../application/queries/ticket.read-model";
import { ITicketReadRepository } from "../../application/queries/ticket-read.repository.interface";
import { TicketOrmEntity } from "../orm/entities/ticket.orm-entity";
import { TicketReadMapper } from "../orm/mappers/ticket-read.mapper";

export class PostgresTicketReadRepository implements ITicketReadRepository {
  constructor(private readonly ormRepo: Repository<TicketOrmEntity>) {}

  async findByEventId(eventId: number): Promise<TicketReadModel[]> {
    const rows = await this.ormRepo.findBy({ eventId });
    return rows.map(TicketReadMapper.toReadModel);
  }
}
