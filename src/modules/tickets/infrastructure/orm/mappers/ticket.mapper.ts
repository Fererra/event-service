import { Ticket } from "../../../domain/entities/ticket.entity";
import { TicketOrmEntity } from "../entities/ticket.orm-entity";

export class TicketMapper {
  static toDomain(orm: TicketOrmEntity): Ticket {
    return Ticket.fromPersistence({
      id: orm.id,
      eventId: orm.eventId,
      type: orm.type,
      limit: orm.limit,
      price: Number(orm.price),
    });
  }

  static toOrm(domain: Ticket): TicketOrmEntity {
    const orm = new TicketOrmEntity();
    if (domain.id !== null) orm.id = domain.id;
    orm.eventId = domain.eventId;
    orm.type = domain.type;
    orm.limit = domain.limit;
    orm.price = domain.price;
    return orm;
  }
}
