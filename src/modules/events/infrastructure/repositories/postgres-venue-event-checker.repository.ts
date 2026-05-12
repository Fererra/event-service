import { Repository } from "typeorm";
import { EventOrmEntity } from "../orm/entities/event.orm-entity";
import { ICheckVenueEventsRepository } from "../../application/queries/check-venue-events.repository.interface";

export class PostgresVenueEventChecker implements ICheckVenueEventsRepository {
  constructor(private readonly eventOrmRepo: Repository<EventOrmEntity>) {}

  async hasAnyEvents(venueId: string): Promise<boolean> {
    const count = await this.eventOrmRepo.count({
      where: { venueId },
    });
    return count > 0;
  }
}
