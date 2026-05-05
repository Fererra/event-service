import { Repository } from "typeorm";
import { VenueReadRepository } from "../../application/repositories/venue-read.repository";
import { VenueListItemDto } from "../../application/queries/get-all-venues/venue-list-item.dto";
import { VenueDetailDto } from "../../application/queries/get-venue-by-id/venue-detail.dto";
import { VenueOrmEntity } from "../orm/entities/venue.orm-entity";

export class PostgresVenueReadRepository implements VenueReadRepository {
  constructor(private readonly ormRepository: Repository<VenueOrmEntity>) {}

  async findAll(): Promise<VenueListItemDto[]> {
    const entities = await this.ormRepository.find({
      order: { createdAt: "DESC" },
    });

    return entities.map((e) => new VenueListItemDto(e.id, e.name, e.capacity, e.address));
  }

  async findDetailById(id: string): Promise<VenueDetailDto | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });

    if (!entity) {
      return null;
    }

    return new VenueDetailDto(
      entity.id,
      entity.name,
      entity.capacity,
      entity.address,
      entity.createdAt,
    );
  }
}
