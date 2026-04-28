import { Repository } from "typeorm";
import {
  EventLookupData,
  IEventLookupRepository,
} from "../../domain/repositories/event-lookup.repository.interface";
import { EventOrmEntity } from "../../../events/infrastructure/orm/entities/event.orm-entity";

export class PostgresEventLookupRepository implements IEventLookupRepository {
  constructor(private readonly ormRepo: Repository<EventOrmEntity>) {}

  async findById(eventId: number): Promise<EventLookupData | null> {
    const event = await this.ormRepo.findOneBy({ id: eventId });
    if (!event) return null;

    return {
      id: event.id,
      venueId: event.venueId,
      isCancelledOrFinished: event.status === "cancelled" || event.status === "finished",
    };
  }
}
