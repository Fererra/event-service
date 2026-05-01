import { Registration } from "../../domain/entities/registration.entity";

export class RegistrationDtoMapper {
  static toDto(entity: Registration) {
    return {
      id: entity.id,
      userId: entity.userId,
      ticketId: entity.ticketId,
      registrationTimestamp: entity.registrationTimestamp.toISOString(),
    };
  }

  static toDtoList(entities: Registration[]) {
    return entities.map((entity) => this.toDto(entity));
  }
}
