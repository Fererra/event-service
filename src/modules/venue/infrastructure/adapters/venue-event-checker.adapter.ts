import { Repository } from "typeorm";
import { VenueEventChecker } from "../../application/ports/venue-event-checker.service";
import { EventOrmEntity } from "../../../events/infrastructure/orm/entities/event.orm-entity";

export class VenueEventCheckerAdapter implements VenueEventChecker {
  constructor(private readonly eventOrmRepo: Repository<EventOrmEntity>) {}

  async hasAnyEvents(venueId: string): Promise<boolean> {
    const count = await this.eventOrmRepo.count({
      where: { venueId },
    });

    return count > 0;
  }
}
