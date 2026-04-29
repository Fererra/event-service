import "reflect-metadata";
import Fastify from "fastify";
import { createDataSource } from "./shared/infrastructure/database.config";

// Auth imports
import { PostgresUserRepository } from "./modules/auth/infrastructure/repositories/postgres-user.repository";
import { PostgresRefreshTokenRepository } from "./modules/auth/infrastructure/repositories/postgres-refresh-token.repository";
import { Argon2PasswordService } from "./modules/auth/infrastructure/services/argon-password.service";
import { JwtTokenService } from "./modules/auth/infrastructure/services/jwt-token.service";
import { SignupUseCase } from "./modules/auth/application/commands/signup.use-case";
import { LoginUseCase } from "./modules/auth/application/commands/login.use-case";
import { LogoutUseCase } from "./modules/auth/application/commands/logout.use-case";
import { RefreshTokensUseCase } from "./modules/auth/application/commands/refresh-tokens.use-case";
import { registerAuthRoutes } from "./modules/auth/presentation/controllers/auth.controller";
import { registerExceptionHandlers } from "./modules/auth/presentation/hooks/exception.handler";
import { UserOrmEntity } from "./modules/auth/infrastructure/orm/entities/user.orm-entity";
import { RefreshTokenOrmEntity } from "./modules/auth/infrastructure/orm/entities/refresh-token.orm-entity";

// Events imports
import { EventOrmEntity } from "./modules/events/infrastructure/orm/entities/event.orm-entity";
import { PostgresEventRepository } from "./modules/events/infrastructure/repositories/postgres-event.repository";
import { PostgresVenueRepository as EventsVenueRepository } from "./modules/events/infrastructure/repositories/postgres-venue.repository";
import { TicketCreatorAdapter } from "./modules/events/infrastructure/adapters/ticket-creator.adapter";
import { EventFactory } from "./modules/events/domain/factories/event.factory";
import { GetEventUseCase } from "./modules/events/application/queries/get-event.use.case";
import { GetEventsUseCase } from "./modules/events/application/queries/get-events.use-case";
import { UpdateEventUseCase } from "./modules/events/application/commands/update-event.use-case";
import { CancelEventUseCase } from "./modules/events/application/commands/cancel-event.use-case";
import { CreateEventUseCase } from "./modules/events/application/commands/create-event.use-case";
import { DeleteEventUseCase } from "./modules/events/application/commands/delete-event.use-case";
import { registerEventRoutes } from "./modules/events/presentation/controllers/event.controller";

// Tickets imports
import { TicketOrmEntity } from "./modules/tickets/infrastructure/orm/entities/ticket.orm-entity";
import { PostgresRegistrationCountRepository } from "./modules/tickets/infrastructure/repositories/postgres-registration-count.repository";
import { PostgresTicketRepository } from "./modules/tickets/infrastructure/repositories/postgres-ticket.repository";
import { PostgresVenueRepository as TicketsVenueRepository } from "./modules/events/infrastructure/repositories/postgres-venue.repository";
import { EventLookupAdapter } from "./modules/tickets/infrastructure/adapters/event-lookup.adapter";
import { TicketFactory } from "./modules/tickets/domain/factories/ticket.factory";
import { GetEventTicketsUseCase } from "./modules/tickets/application/queries/get-event-tickets.use-case";
import { CreateTicketUseCase } from "./modules/tickets/application/commands/create-ticket.use-case";
import { UpdateTicketUseCase } from "./modules/tickets/application/commands/update-ticket.use-case";
import { DeleteTicketUseCase } from "./modules/tickets/application/commands/delete-ticket.use-case";
import { registerTicketRoutes } from "./modules/tickets/presentation/controllers/ticket.controller";

async function bootstrap() {
  const config = {
    port: Number(process.env.PORT) || 3000,
    db: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "auth_db",
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-change-in-prod",
      refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-change-in-prod",
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  };

  const dataSource = createDataSource(config.db);
  await dataSource.initialize();

  // Auth
  const userRepository = new PostgresUserRepository(dataSource.getRepository(UserOrmEntity));
  const refreshTokenRepository = new PostgresRefreshTokenRepository(
    dataSource.getRepository(RefreshTokenOrmEntity),
  );

  const passwordService = new Argon2PasswordService();
  const tokenService = new JwtTokenService(config.jwt);

  const signupUseCase = new SignupUseCase(
    userRepository,
    refreshTokenRepository,
    passwordService,
    tokenService,
  );
  const loginUseCase = new LoginUseCase(
    userRepository,
    refreshTokenRepository,
    passwordService,
    tokenService,
  );
  const logoutUseCase = new LogoutUseCase(refreshTokenRepository, tokenService);
  const refreshTokensUseCase = new RefreshTokensUseCase(
    userRepository,
    refreshTokenRepository,
    tokenService,
  );

  // Events
  const eventRepository = new PostgresEventRepository(dataSource.getRepository(EventOrmEntity));
  const eventsVenueRepository = new EventsVenueRepository(dataSource);

  const eventFactory = new EventFactory(eventsVenueRepository);

  const getEventsUseCase = new GetEventsUseCase(eventRepository);
  const getEventUseCase = new GetEventUseCase(eventRepository);
  const updateEventUseCase = new UpdateEventUseCase(eventRepository, eventsVenueRepository);
  const cancelEventUseCase = new CancelEventUseCase(eventRepository);
  const deleteEventUseCase = new DeleteEventUseCase(eventRepository);

  // Tickets
  const ticketRepository = new PostgresTicketRepository(dataSource.getRepository(TicketOrmEntity));
  const ticketsVenueRepository = new TicketsVenueRepository(dataSource);
  const registrationCountRepository = new PostgresRegistrationCountRepository(dataSource);
  const eventLookupAdapter = new EventLookupAdapter(getEventUseCase);

  const ticketFactory = new TicketFactory(ticketRepository, ticketsVenueRepository);

  const getEventTicketsUseCase = new GetEventTicketsUseCase(ticketRepository, eventLookupAdapter);
  const createTicketUseCase = new CreateTicketUseCase(
    ticketFactory,
    ticketRepository,
    eventLookupAdapter,
  );
  const updateTicketUseCase = new UpdateTicketUseCase(
    ticketRepository,
    eventLookupAdapter,
    ticketsVenueRepository,
    registrationCountRepository,
  );
  const deleteTicketUseCase = new DeleteTicketUseCase(
    ticketRepository,
    eventLookupAdapter,
    registrationCountRepository,
  );

  // Events create use case
  const ticketCreator = new TicketCreatorAdapter(createTicketUseCase);
  const createEventUseCase = new CreateEventUseCase(
    eventFactory,
    eventRepository,
    eventsVenueRepository,
    ticketCreator,
  );

  // Fastify
  const app = Fastify({ logger: true });

  registerExceptionHandlers(app);

  registerAuthRoutes(app, {
    signupUseCase,
    loginUseCase,
    logoutUseCase,
    refreshTokensUseCase,
  });

  registerEventRoutes(
    app,
    {
      getEventsUseCase,
      getEventUseCase,
      createEventUseCase,
      updateEventUseCase,
      cancelEventUseCase,
      deleteEventUseCase,
    },
    tokenService,
  );

  registerTicketRoutes(
    app,
    {
      getEventTicketsUseCase,
      createTicketUseCase,
      updateTicketUseCase,
      deleteTicketUseCase,
    },
    tokenService,
  );

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server running on port ${config.port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
