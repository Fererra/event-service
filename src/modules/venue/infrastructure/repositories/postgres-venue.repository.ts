import { Repository } from "typeorm";
import { Venue } from "../../domain/entities/venue.entity";
import { VenueRepository } from "../../domain/repositories/venue.repository";
import { VenueOrmEntity } from "../orm/entities/venue.orm-entity";
import { VenueMapper } from "../orm/mappers/venue.mapper";

export class PostgresVenueRepository implements VenueRepository {
  constructor(private readonly ormRepository: Repository<VenueOrmEntity>) {}

  async save(venue: Venue): Promise<void> {
    const ormEntity = VenueMapper.toOrm(venue);
    await this.ormRepository.save(ormEntity);
  }

  async findByAddress(address: string): Promise<Venue | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { address } });
    return ormEntity ? VenueMapper.toDomain(ormEntity) : null;
  }
}
