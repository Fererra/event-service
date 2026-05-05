import { Repository } from "typeorm";
import { Registration } from "../../domain/entities/registration.entity";
import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { RegistrationOrmEntity } from "../orm/entities/registration.orm-entity";
import { RegistrationMapper } from "../orm/mappers/registration.mapper";

export class PostgresRegistrationRepository implements RegistrationRepository {
  constructor(private readonly ormRepository: Repository<RegistrationOrmEntity>) {}

  async countByTicketId(ticketId: number): Promise<number> {
    return this.ormRepository.count({ where: { ticketId } });
  }

  async save(registration: Registration): Promise<Registration> {
    const saved = await this.ormRepository.save(RegistrationMapper.toOrm(registration));
    return RegistrationMapper.toDomain(saved);
  }

  async countByEventAndTicket(eventId: number, ticketId: number): Promise<number> {
    return await this.ormRepository.count({
      where: {
        ticketId: ticketId,
        ticket: {
          eventId: eventId,
        },
      },
      relations: ["ticket"],
    });
  }

  async findById(id: string): Promise<Registration | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return ormEntity ? RegistrationMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<Registration[]> {
    const ormEntities = await this.ormRepository.find({ where: { userId } });
    return ormEntities.map((entity) => RegistrationMapper.toDomain(entity));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Registration | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id, userId },
    });
    return ormEntity ? RegistrationMapper.toDomain(ormEntity) : null;
  }

  async findByEventId(eventId: number): Promise<Registration[]> {
    const ormEntities = await this.ormRepository
      .createQueryBuilder("registration")
      .innerJoin("registration.ticket", "ticket")
      .where("ticket.event_id = :eventId", { eventId })
      .getMany();

    return ormEntities.map((orm) => RegistrationMapper.toDomain(orm));
  }

  async findByIdAndEventId(id: string, eventId: number): Promise<Registration | null> {
    const ormEntity = await this.ormRepository
      .createQueryBuilder("registration")
      .innerJoin("registration.ticket", "ticket")
      .where("registration.id = :id", { id })
      .andWhere("ticket.event_id = :eventId", { eventId })
      .getOne();

    return ormEntity ? RegistrationMapper.toDomain(ormEntity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
