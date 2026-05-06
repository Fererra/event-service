import { Repository } from "typeorm";
import { Registration } from "../../domain/entities/registration.entity";
import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { RegistrationOrmEntity } from "../orm/entities/registration.orm-entity";
import { RegistrationMapper } from "../orm/mappers/registration.mapper";

export class PostgresRegistrationRepository implements RegistrationRepository {
  constructor(private readonly ormRepository: Repository<RegistrationOrmEntity>) {}

  async save(registration: Registration): Promise<Registration> {
    const ormEntity = RegistrationMapper.toOrm(registration);
    const saved = await this.ormRepository.save(ormEntity);
    return RegistrationMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Registration | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return ormEntity ? RegistrationMapper.toDomain(ormEntity) : null;
  }

  async countByTicketId(ticketId: number): Promise<number> {
    return this.ormRepository.count({ where: { ticketId } });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
