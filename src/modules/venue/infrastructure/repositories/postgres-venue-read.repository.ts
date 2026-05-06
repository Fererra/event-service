import { Repository } from "typeorm";
import { VenueReadRepository } from "../../application/repositories/venue-read.repository";
import { VenueListItemModel } from "../../application/queries/get-all-venues/venue-list-item.model";
import { VenueDetailModel } from "../../application/queries/get-venue-by-id/venue-detail.model";
import { VenueOrmEntity } from "../orm/entities/venue.orm-entity";

export class PostgresVenueReadRepository implements VenueReadRepository {
  constructor(private readonly ormRepository: Repository<VenueOrmEntity>) {}

  async findAll(): Promise<VenueListItemModel[]> {
    const entities = await this.ormRepository.find({
      order: { createdAt: "DESC" },
    });

    return entities.map((e) => ({
      id: e.id,
      name: e.name,
      capacity: e.capacity,
      address: e.address,
    }));
  }

  async findDetailById(id: string): Promise<VenueDetailModel | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });

    if (!entity) {
      return null;
    }

    return {
      id: entity.id,
      name: entity.name,
      capacity: entity.capacity,
      address: entity.address,
      createdAt: entity.createdAt,
    };
  }
}
