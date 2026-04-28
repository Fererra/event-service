import { Repository } from "typeorm";
import { Ticket } from "../../domain/entities/ticket.entity";
import { TicketType } from "../../domain/enums/ticket-type.enum";
import { ITicketRepository } from "../../domain/repositories/ticket.repository.interface";
import { TicketOrmEntity } from "../orm/entities/ticket.orm-entity";
import { TicketMapper } from "../orm/mappers/ticket.mapper";

export class PostgresTicketRepository implements ITicketRepository {
  constructor(private readonly ormRepo: Repository<TicketOrmEntity>) {}

  async findByEventId(eventId: number): Promise<Ticket[]> {
    const rows = await this.ormRepo.findBy({ eventId });
    return rows.map(TicketMapper.toDomain);
  }

  async findById(id: number): Promise<Ticket | null> {
    const row = await this.ormRepo.findOneBy({ id });
    return row ? TicketMapper.toDomain(row) : null;
  }

  async findByEventIdAndType(eventId: number, type: TicketType): Promise<Ticket | null> {
    const row = await this.ormRepo.findOneBy({ eventId, type });
    return row ? TicketMapper.toDomain(row) : null;
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const saved = await this.ormRepo.save(TicketMapper.toOrm(ticket));
    return TicketMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepo.delete(id);
  }
}
