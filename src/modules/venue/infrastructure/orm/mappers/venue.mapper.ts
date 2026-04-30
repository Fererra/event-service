import { Venue } from "../../../domain/entities/venue.entity";
import { VenueOrmEntity } from "../entities/venue.orm-entity";
import { VenueFactory } from "../../../domain/factories/venue.factory";

export class VenueMapper {
  static toDomain(ormEntity: VenueOrmEntity): Venue {
    return VenueFactory.reconstitute(
      ormEntity.id,
      ormEntity.name,
      ormEntity.capacity,
      ormEntity.address,
    );
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
