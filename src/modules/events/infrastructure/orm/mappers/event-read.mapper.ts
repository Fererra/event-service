import { EventOrmEntity } from "../entities/event.orm-entity";
import { EventReadModel } from "../../../application/queries/event.read-model";

export class EventReadMapper {
  static toReadModel(orm: EventOrmEntity): EventReadModel {
    return {
      id: orm.id,
      owner_id: orm.ownerId,
      name: orm.name,
      organisator: orm.organisator,
      description: orm.description,
      start_timestamp: orm.startTimestamp.toISOString(),
      end_timestamp: orm.endTimestamp.toISOString(),
      status: orm.status,
      venue_id: orm.venueId,
      created_at: orm.createdAt.toISOString(),
    };
  }
}
