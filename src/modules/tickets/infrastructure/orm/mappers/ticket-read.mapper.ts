import { TicketOrmEntity } from "../entities/ticket.orm-entity";
import { TicketReadModel } from "../../../application/queries/ticket.read-model";

export class TicketReadMapper {
  static toReadModel(orm: TicketOrmEntity): TicketReadModel {
    return {
      id: orm.id,
      event_id: orm.eventId,
      type: orm.type,
      limit: orm.limit,
      price: Number(orm.price),
    };
  }
}
