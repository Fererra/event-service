import { Registration } from "../../../domain/entities/registration.entity";
import { RegistrationOrmEntity } from "../entities/registration.orm-entity";

export class RegistrationMapper {
  static toDomain(ormEntity: RegistrationOrmEntity): Registration {
    return Registration.fromProps({
      id: ormEntity.id,
      userId: ormEntity.userId,
      ticketId: ormEntity.ticketId,
      registrationTimestamp: ormEntity.registrationTimestamp,
    });
  }

  static toOrm(domainEntity: Registration): RegistrationOrmEntity {
    const ormEntity = new RegistrationOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.userId = domainEntity.userId;
    ormEntity.ticketId = domainEntity.ticketId;
    ormEntity.registrationTimestamp = domainEntity.registrationTimestamp;
    return ormEntity;
  }
}
