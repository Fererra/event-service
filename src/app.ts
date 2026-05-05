import "reflect-metadata";
import Fastify from "fastify";
import { createDataSource } from "./shared/infrastructure/database.config";

// Auth imports
import { PostgresUserRepository } from "./modules/auth/infrastructure/repositories/postgres-user.repository";
import { PostgresRefreshTokenRepository } from "./modules/auth/infrastructure/repositories/postgres-refresh-token.repository";
import { Argon2PasswordService } from "./modules/auth/infrastructure/services/argon-password.service";
import { JwtTokenService } from "./modules/auth/infrastructure/services/jwt-token.service";
import { createJwtGuard } from "./modules/auth/presentation/guards/jwt.guard";
import { createAdminGuard } from "./modules/auth/presentation/guards/admin.guard";
import { SignupUseCase } from "./modules/auth/application/commands/signup.use-case";
import { LoginUseCase } from "./modules/auth/application/commands/login.use-case";
import { LogoutUseCase } from "./modules/auth/application/commands/logout.use-case";
import { RefreshTokensUseCase } from "./modules/auth/application/commands/refresh-tokens.use-case";
import { registerAuthRoutes } from "./modules/auth/presentation/controllers/auth.controller";
import { registerExceptionHandlers } from "./shared/presentation/exception.handler";
import { UserOrmEntity } from "./modules/auth/infrastructure/orm/entities/user.orm-entity";
import { RefreshTokenOrmEntity } from "./modules/auth/infrastructure/orm/entities/refresh-token.orm-entity";

// Venues imports
import { venueRoutes } from "./modules/venue/presentation/controllers/venue.controller";

import { CreateVenueCommandHandler } from "./modules/venue/application/commands/create-venue/create-venue.handler";
import { UpdateVenueCommandHandler } from "./modules/venue/application/commands/update-venue/update-venue.handler";
import { DeleteVenueCommandHandler } from "./modules/venue/application/commands/delete-venue/delete-venue.handler";
import { GetAllVenuesQueryHandler } from "./modules/venue/application/queries/get-all-venues/get-all-venues.handler";
import { GetVenueByIdQueryHandler } from "./modules/venue/application/queries/get-venue-by-id/get-venue-by-id.handler";
import { VenueFactory } from "./modules/venue/domain/factories/venue.factory";
import { PostgresVenueRepository } from "./modules/venue/infrastructure/repositories/postgres-venue.repository";
import { PostgresVenueReadRepository } from "./modules/venue/infrastructure/repositories/postgres-venue-read.repository";
import { TypeOrmVenueEventChecker } from "./modules/venue/infrastructure/repositories/venue-event-checker";
import { VenueOrmEntity } from "./modules/venue/infrastructure/orm/entities/venue.orm-entity";

// Events imports
import { EventOrmEntity } from "./modules/events/infrastructure/orm/entities/event.orm-entity";
import { PostgresEventRepository } from "./modules/events/infrastructure/repositories/postgres-event.repository";
import { PostgresEventReadRepository } from "./modules/events/infrastructure/repositories/postgres-event-read.repository";
import { VenueModuleAdapter as EventVenueModuleAdapter } from "./modules/events/infrastructure/adapters/venue-module.adapter";
import { TicketCreatorAdapter } from "./modules/events/infrastructure/adapters/ticket-creator.adapter";
import { EventFactory } from "./modules/events/domain/factories/event.factory";
import { GetEventUseCase } from "./modules/events/application/queries/get-event.use-case";
import { GetEventsUseCase } from "./modules/events/application/queries/get-events.use-case";
import { UpdateEventUseCase } from "./modules/events/application/commands/update-event.use-case";
import { CancelEventUseCase } from "./modules/events/application/commands/cancel-event.use-case";
import { CreateEventUseCase } from "./modules/events/application/commands/create-event.use-case";
import { DeleteEventUseCase } from "./modules/events/application/commands/delete-event.use-case";
import { registerEventRoutes } from "./modules/events/presentation/controllers/event.controller";
import { SyncEventStatusesUseCase } from "./modules/events/application/commands/sync-event-statuses.use-case";
import { EventCronJobs } from "./modules/events/presentation/cron/event.cron";

// Tickets imports
import { TicketOrmEntity } from "./modules/tickets/infrastructure/orm/entities/ticket.orm-entity";
import { RegistrationModuleAdapter as TicketRegistrationModuleAdapter } from "./modules/tickets/infrastructure/adapters/registartion-module.adapter";
import { PostgresTicketRepository } from "./modules/tickets/infrastructure/repositories/postgres-ticket.repository";
import { PostgresTicketReadRepository } from "./modules/tickets/infrastructure/repositories/postgres-ticket-read.repository";
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
import { GetUserRegistrationsUseCase } from "./modules/registrations/application/use-cases/get-user-registrations.use-case";
import { GetUserRegistrationUseCase } from "./modules/registrations/application/use-cases/get-user-registration.use-case";
import { GetEventRegistrationsUseCase } from "./modules/registrations/application/use-cases/get-event-registrations.use-case";
import { GetEventRegistrationUseCase } from "./modules/registrations/application/use-cases/get-event-registration.use-case";
import { registerRegistrationRoutes } from "./modules/registrations/presentation/controllers/registration.controller";
import { RegistrationOrmEntity } from "./modules/registrations/infrastructure/orm/entities/registration.orm-entity";
import { CancelRegistrationUseCase } from "./modules/registrations/application/use-cases/cancel-registration.use-case";
import { GetRegistrationsCountUseCase } from "./modules/registrations/application/use-cases/get-registrations-count.use-case";
import { EventInfoRepositoryAdapter } from "./modules/registrations/infrastructure/adapters/event-info.repository.adapter";
import { TicketInfoRepositoryAdapter } from "./modules/registrations/infrastructure/adapters/ticket-info.repository.adapter";

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
  const jwtGuard = createJwtGuard(tokenService);
  const adminGuard = createAdminGuard();
  const guards = { jwtGuard, adminGuard };

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
  const venueOrmRepo = dataSource.getRepository(VenueOrmEntity);

  const venueWriteRepository = new PostgresVenueRepository(venueOrmRepo);
  const venueReadRepository = new PostgresVenueReadRepository(venueOrmRepo);

  const venueFactory = new VenueFactory(venueWriteRepository);

  const createVenueHandler = new CreateVenueCommandHandler(venueWriteRepository, venueFactory);
  const updateVenueHandler = new UpdateVenueCommandHandler(venueWriteRepository, venueFactory);

  const eventOrmRepo = dataSource.getRepository(EventOrmEntity);
  const realEventChecker = new TypeOrmVenueEventChecker(eventOrmRepo);
  const deleteVenueHandler = new DeleteVenueCommandHandler(venueWriteRepository, realEventChecker);

  const getAllVenuesHandler = new GetAllVenuesQueryHandler(venueReadRepository);
  const getVenueByIdHandler = new GetVenueByIdQueryHandler(venueReadRepository);

  // Events
  const eventRepository = new PostgresEventRepository(dataSource.getRepository(EventOrmEntity));
  const eventReadRepository = new PostgresEventReadRepository(
    dataSource.getRepository(EventOrmEntity),
  );

  const eventVenueAdapter = new EventVenueModuleAdapter(getVenueByIdHandler);
  const eventReadRepository = new PostgresEventReadRepository(
    dataSource.getRepository(EventOrmEntity),
  );

  const eventFactory = new EventFactory(eventVenueAdapter);

  const getEventsUseCase = new GetEventsUseCase(eventReadRepository);
  const getEventUseCase = new GetEventUseCase(eventReadRepository);

  const updateEventUseCase = new UpdateEventUseCase(eventRepository, eventVenueAdapter);
  const cancelEventUseCase = new CancelEventUseCase(eventRepository);
  const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
  const syncEventStatusesUseCase = new SyncEventStatusesUseCase(eventRepository);

  // Tickets;
  const ticketRepository = new PostgresTicketRepository(dataSource.getRepository(TicketOrmEntity));
  const ticketReadRepository = new PostgresTicketReadRepository(
    dataSource.getRepository(TicketOrmEntity),
  );
  const ticketVenueAdapter = new TicketVenueModuleAdapter(getVenueByIdHandler);
  const ticketReadRepository = new PostgresTicketReadRepository(
    dataSource.getRepository(TicketOrmEntity),
  );

  const eventLookupAdapter = new EventLookupAdapter(getEventUseCase);

  const ticketFactory = new TicketFactory(ticketRepository, ticketVenueAdapter);

  const getEventTicketsUseCase = new GetEventTicketsUseCase(
    ticketReadRepository,
    eventReadRepository,
  );
  const createTicketUseCase = new CreateTicketUseCase(
    ticketFactory,
    ticketRepository,
    eventLookupAdapter,
  );

  // Registrations
  const registrationOrmRepository = dataSource.getRepository(RegistrationOrmEntity);
  const registrationRepository = new PostgresRegistrationRepository(registrationOrmRepository);

  const eventInfoRepository = new EventInfoRepositoryAdapter(eventRepository);
  const ticketInfoRepository = new TicketInfoRepositoryAdapter(ticketRepository);
  const registrationFactory = new RegistrationFactory(
    registrationRepository,
    ticketInfoRepository,
    eventInfoRepository,
  );

  const createRegistrationUseCase = new CreateRegistrationUseCase(
    registrationRepository,
    registrationFactory,
  );
  const getUserRegistrationsUseCase = new GetUserRegistrationsUseCase(registrationRepository);
  const getUserRegistrationUseCase = new GetUserRegistrationUseCase(registrationRepository);
  const getEventRegistrationsUseCase = new GetEventRegistrationsUseCase(registrationRepository);
  const getEventRegistrationUseCase = new GetEventRegistrationUseCase(registrationRepository);
  const cancelRegistrationUseCase = new CancelRegistrationUseCase(registrationRepository);
  const getRegistrationsCountUseCase = new GetRegistrationsCountUseCase(
    registrationRepository,
    ticketInfoRepository,
    eventInfoRepository,
  );

  // Events create use case depends on tickets for TicketCreatorAdapter
  const ticketCreator = new TicketCreatorAdapter(createTicketUseCase);
  const createEventUseCase = new CreateEventUseCase(eventFactory, eventRepository, ticketCreator);

  // Tickets update and delete use cases depend on registration for ticketRegistrationAdapter
  const ticketRegistrationAdapter = new TicketRegistrationModuleAdapter(
    getRegistrationsCountUseCase,
  );
  const updateTicketUseCase = new UpdateTicketUseCase(
    ticketRepository,
    eventLookupAdapter,
    ticketVenueAdapter,
    ticketRegistrationAdapter,
  );
  const deleteTicketUseCase = new DeleteTicketUseCase(
    ticketRepository,
    eventLookupAdapter,
    ticketRegistrationAdapter,
  );

  // Cron Job
  const eventCronJobs = new EventCronJobs(syncEventStatusesUseCase);
  eventCronJobs.start();

  // Fastify
  const app = Fastify({ logger: true });

  registerExceptionHandlers(app);

  venueRoutes(
    app,
    {
      createVenueHandler,
      getAllVenuesHandler,
      getVenueByIdHandler,
      updateVenueHandler,
      deleteVenueHandler,
    },
    guards,
  );

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
    guards,
  );

  registerTicketRoutes(
    app,
    {
      getEventTicketsUseCase,
      createTicketUseCase,
      updateTicketUseCase,
      deleteTicketUseCase,
    },
    guards,
  );

  registerRegistrationRoutes(
    app,
    {
      createRegistrationUseCase,
      getUserRegistrationsUseCase,
      getUserRegistrationUseCase,
      getEventRegistrationsUseCase,
      getEventRegistrationUseCase,
      cancelRegistrationUseCase,
      getRegistrationsCountUseCase,
    },
    guards,
  );

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server running on port ${config.port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
