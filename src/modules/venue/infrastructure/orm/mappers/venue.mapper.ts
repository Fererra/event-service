import { Venue } from "../../../domain/entities/venue.entity";
import { VenueOrmEntity } from "../entities/venue.orm-entity";

export class VenueMapper {
  static toDomain(ormEntity: VenueOrmEntity): Venue {
    return Venue.fromPersistence({
      id: ormEntity.id,
      name: ormEntity.name,
      capacity: ormEntity.capacity,
      address: ormEntity.address,
    });
  }

  static toOrm(domainEntity: Venue): VenueOrmEntity {
    const ormEntity = new VenueOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.name = domainEntity.name;
    ormEntity.capacity = domainEntity.capacity;
    ormEntity.address = domainEntity.address;
    return ormEntity;
  }
}
