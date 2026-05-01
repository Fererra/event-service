import { Repository } from "typeorm";
import { Registration } from "../../domain/entities/registration.entity";
import { RegistrationRepository } from "../../domain/repositories/registration.repository";
import { RegistrationOrmEntity } from "../orm/entities/registration.orm-entity";
import { RegistrationMapper } from "../orm/mappers/registration.mapper";

export class PostgresRegistrationRepository implements RegistrationRepository {
  constructor(private readonly ormRepo: Repository<RegistrationOrmEntity>) {}

  async countByTicketId(ticketId: number): Promise<number> {
    return this.ormRepo.count({ where: { ticketId } });
  }

  async save(registration: Registration): Promise<Registration> {
    const saved = await this.ormRepo.save(
      RegistrationMapper.toOrm(registration),
    );
    return RegistrationMapper.toDomain(saved);
  }
}
