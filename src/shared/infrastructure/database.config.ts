import { DataSource } from "typeorm";
import { UserOrmEntity } from "../../modules/auth/infrastructure/orm/entities/user.orm-entity";
import { RefreshTokenOrmEntity } from "../../modules/auth/infrastructure/orm/entities/refresh-token.orm-entity";
import { EventOrmEntity } from "../../modules/events/infrastructure/orm/entities/event.orm-entity";
import { TicketOrmEntity } from "../../modules/tickets/infrastructure/orm/entities/ticket.orm-entity";
import { VenueOrmEntity } from "../../modules/venue/infrastructure/orm/entities/venue.orm-entity";

export function createDataSource(config: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}): DataSource {
  return new DataSource({
    type: "postgres",
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    entities: [
      UserOrmEntity,
      RefreshTokenOrmEntity,
      EventOrmEntity,
      TicketOrmEntity,
      VenueOrmEntity,
    ],
    synchronize: false,
  });
}
