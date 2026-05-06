import { Repository } from "typeorm";
import { RegistrationReadRepository } from "../../application/repositories/registration-read.repository";
import { RegistrationDetailModel } from "../../application/queries/registration-detail.model";
import { RegistrationOrmEntity } from "../orm/entities/registration.orm-entity";

export class PostgresRegistrationReadRepository implements RegistrationReadRepository {
  constructor(private readonly ormRepository: Repository<RegistrationOrmEntity>) {}

  async findByUserId(userId: string): Promise<RegistrationDetailModel[]> {
    const entities = await this.ormRepository.find({
      where: { userId },
      order: { registrationTimestamp: "DESC" },
    });

    return entities.map(this.toModel);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<RegistrationDetailModel | null> {
    const entity = await this.ormRepository.findOne({
      where: { id, userId },
    });

    return entity ? this.toModel(entity) : null;
  }

  async findByEventId(eventId: number): Promise<RegistrationDetailModel[]> {
    const entities = await this.ormRepository.find({
      where: { ticket: { eventId } },
      relations: ["ticket"],
      order: { registrationTimestamp: "DESC" },
    });

    return entities.map(this.toModel);
  }

  async findByIdAndEventId(id: string, eventId: number): Promise<RegistrationDetailModel | null> {
    const entity = await this.ormRepository.findOne({
      where: { id, ticket: { eventId } },
      relations: ["ticket"],
    });

    return entity ? this.toModel(entity) : null;
  }

  async countByEventAndTicket(eventId: number, ticketId: number): Promise<number> {
    return this.ormRepository.count({
      where: {
        ticketId,
        ticket: { eventId },
      },
      relations: ["ticket"],
    });
  }

  private toModel(entity: RegistrationOrmEntity): RegistrationDetailModel {
    return {
      id: entity.id,
      userId: entity.userId,
      ticketId: entity.ticketId,
      registrationTimestamp: entity.registrationTimestamp,
    };
  }
}
