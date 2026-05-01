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

// Venues imports
import { venueRoutes } from "./modules/venue/presentation/controllers/venue.controller";
import { CreateVenueUseCase } from "./modules/venue/application/use-cases/create-venue.use-case";
import { GetAllVenuesUseCase } from "./modules/venue/application/use-cases/get-venues.use-case";
import { GetVenueByIdUseCase } from "./modules/venue/application/use-cases/get-venue-by-id.use-case";
import { UpdateVenueUseCase } from "./modules/venue/application/use-cases/update-venue.use-case";
import { DeleteVenueUseCase } from "./modules/venue/application/use-cases/delete-venue.use-case";
import { VenueEventChecker } from "./modules/venue/application/ports/venue-event-checker.service";
import { PostgresVenueRepository } from "./modules/venue/infrastructure/repositories/postgres-venue.repository";
import { TypeOrmVenueEventChecker } from "./modules/venue/infrastructure/repositories/venue-event-checker";
import { VenueOrmEntity } from "./modules/venue/infrastructure/orm/entities/venue.orm-entity";

// Events imports
import { EventOrmEntity } from "./modules/events/infrastructure/orm/entities/event.orm-entity";
import { PostgresEventRepository } from "./modules/events/infrastructure/repositories/postgres-event.repository";
import { VenueModuleAdapter as EventVenueModuleAdapter } from "./modules/events/infrastructure/adapters/venue-module.adapter";
import { TicketCreatorAdapter } from "./modules/events/infrastructure/adapters/ticket-creator.adapter";
import { EventFactory } from "./modules/events/domain/factories/event.factory";
import { GetEventUseCase } from "./modules/events/application/queries/get-event.use.case";
import { GetEventsUseCase } from "./modules/events/application/queries/get-events.use-case";
import { UpdateEventUseCase } from "./modules/events/application/commands/update-event.use-case";
import { CancelEventUseCase } from "./modules/events/application/commands/cancel-event.use-case";
import { CreateEventUseCase } from "./modules/events/application/commands/create-event.use-case";
import { DeleteEventUseCase } from "./modules/events/application/commands/delete-event.use-case";
import { registerEventRoutes } from "./modules/events/presentation/controllers/event.controller";
import { SyncEventStatusesUSeCase } from "./modules/events/application/commands/sync-event-statuses.use-case";
import { EventCronJobs } from "./modules/events/presentation/cron/event.cron";

// Tickets imports
import { TicketOrmEntity } from "./modules/tickets/infrastructure/orm/entities/ticket.orm-entity";
import { PostgresRegistrationCountRepository } from "./modules/tickets/infrastructure/repositories/postgres-registration-count.repository";
import { PostgresTicketRepository } from "./modules/tickets/infrastructure/repositories/postgres-ticket.repository";
import { VenueModuleAdapter as TicketVenueModuleAdapter } from "./modules/tickets/infrastructure/adapters/venue-module.adapter";
import { EventLookupAdapter } from "./modules/tickets/infrastructure/adapters/event-lookup.adapter";
import { TicketFactory } from "./modules/tickets/domain/factories/ticket.factory";
import { GetEventTicketsUseCase } from "./modules/tickets/application/queries/get-event-tickets.use-case";
import { CreateTicketUseCase } from "./modules/tickets/application/commands/create-ticket.use-case";
import { UpdateTicketUseCase } from "./modules/tickets/application/commands/update-ticket.use-case";
import { DeleteTicketUseCase } from "./modules/tickets/application/commands/delete-ticket.use-case";
import { registerTicketRoutes } from "./modules/tickets/presentation/controllers/ticket.controller";

// Registrations imports
import { PostgresRegistrationRepository } from "./modules/registrations/infrastructure/repositories/postgres-registration.repository";
import { RegistrationFactory } from "./modules/registrations/domain/factories/registration.factory";
import { CreateRegistrationUseCase } from "./modules/registrations/application/use-cases/create-registration.use-case";
import { registerRegistrationRoutes } from "./modules/registrations/presentation/controllers/registration.controller";
import { RegistrationOrmEntity } from "./modules/registrations/infrastructure/orm/entities/registration.orm-entity";

async function bootstrap() {
  const config = {
    port: Number(process.env.PORT) || 3000,
    db: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "auth_db",
    },
    jwt: {
      accessSecret:
        process.env.JWT_ACCESS_SECRET || "access-secret-change-in-prod",
      refreshSecret:
        process.env.JWT_REFRESH_SECRET || "refresh-secret-change-in-prod",
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  };

  const dataSource = createDataSource(config.db);
  await dataSource.initialize();

  // Auth
  const userRepository = new PostgresUserRepository(
    dataSource.getRepository(UserOrmEntity),
  );
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

  // Venues
  const venueRepository = new PostgresVenueRepository(
    dataSource.getRepository(VenueOrmEntity),
  );
  const createVenueUseCase = new CreateVenueUseCase(venueRepository);
  const getAllVenuesUseCase = new GetAllVenuesUseCase(venueRepository);
  const getVenueByIdUseCase = new GetVenueByIdUseCase(venueRepository);
  const updateVenueUseCase = new UpdateVenueUseCase(venueRepository);

  const eventOrmRepo = dataSource.getRepository(EventOrmEntity);
  const realEventChecker = new TypeOrmVenueEventChecker(eventOrmRepo);

  const deleteVenueUseCase = new DeleteVenueUseCase(
    venueRepository,
    realEventChecker,
  );

  // Events
  const eventRepository = new PostgresEventRepository(
    dataSource.getRepository(EventOrmEntity),
  );
  const eventVenueAdapter = new EventVenueModuleAdapter(getVenueByIdUseCase);

  const eventFactory = new EventFactory(eventVenueAdapter);

  const getEventsUseCase = new GetEventsUseCase(eventRepository);
  const getEventUseCase = new GetEventUseCase(eventRepository);
  const updateEventUseCase = new UpdateEventUseCase(
    eventRepository,
    eventVenueAdapter,
  );
  const cancelEventUseCase = new CancelEventUseCase(eventRepository);
  const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
  const syncEventStatusesUSeCase = new SyncEventStatusesUSeCase(
    eventRepository,
  );

  // Tickets
  const ticketRepository = new PostgresTicketRepository(
    dataSource.getRepository(TicketOrmEntity),
  );
  const ticketVenueAdapter = new TicketVenueModuleAdapter(getVenueByIdUseCase);
  const registrationCountRepository = new PostgresRegistrationCountRepository(
    dataSource,
  );
  const eventLookupAdapter = new EventLookupAdapter(getEventUseCase);

  const ticketFactory = new TicketFactory(ticketRepository, ticketVenueAdapter);

  const getEventTicketsUseCase = new GetEventTicketsUseCase(
    ticketRepository,
    eventLookupAdapter,
  );
  const createTicketUseCase = new CreateTicketUseCase(
    ticketFactory,
    ticketRepository,
    eventLookupAdapter,
  );
  const updateTicketUseCase = new UpdateTicketUseCase(
    ticketRepository,
    eventLookupAdapter,
    ticketVenueAdapter,
    registrationCountRepository,
  );
  const deleteTicketUseCase = new DeleteTicketUseCase(
    ticketRepository,
    eventLookupAdapter,
    registrationCountRepository,
  );

  // Registrations
  const registrationOrmRepository = dataSource.getRepository(
    RegistrationOrmEntity,
  );
  const registrationRepo = new PostgresRegistrationRepository(
    registrationOrmRepository,
  );

  const registrationFactory = new RegistrationFactory(
    registrationRepo,
    ticketRepository,
    eventRepository,
  );

  const createRegistrationUseCase = new CreateRegistrationUseCase(
    registrationRepo,
    registrationFactory,
  );

  // Events create use case
  const ticketCreator = new TicketCreatorAdapter(createTicketUseCase);
  const createEventUseCase = new CreateEventUseCase(
    eventFactory,
    eventRepository,
    eventVenueAdapter,
    ticketCreator,
  );

  // Cron Job
  const eventCronJobs = new EventCronJobs(syncEventStatusesUSeCase);
  eventCronJobs.start();

  // Fastify
  const app = Fastify({ logger: true });

  venueRoutes(
    app,
    createVenueUseCase,
    getAllVenuesUseCase,
    getVenueByIdUseCase,
    updateVenueUseCase,
    deleteVenueUseCase,
    tokenService,
  );

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

  registerRegistrationRoutes(app, createRegistrationUseCase, tokenService);

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server running on port ${config.port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
