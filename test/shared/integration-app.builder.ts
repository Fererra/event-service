import "reflect-metadata";
import Fastify, { FastifyInstance } from "fastify";
import { createDataSource } from "../../src/shared/infrastructure/database.config";

// Auth imports
import { PostgresUserRepository } from "../../src/modules/auth/infrastructure/repositories/postgres-user.repository";
import { PostgresUserReadRepository } from "../../src/modules/auth/infrastructure/repositories/postgres-user-read.repository";
import { PostgresRefreshTokenRepository } from "../../src/modules/auth/infrastructure/repositories/postgres-refresh-token.repository";
import { Argon2PasswordService } from "../../src/modules/auth/infrastructure/services/argon-password.service";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/services/jwt-token.service";
import { createJwtGuard } from "../../src/modules/auth/presentation/guards/jwt.guard";
import { createAdminGuard } from "../../src/modules/auth/presentation/guards/admin.guard";
import { SignupCommandHandler } from "../../src/modules/auth/application/commands/signup.handler";
import { LoginCommandHandler } from "../../src/modules/auth/application/commands/login.handler";
import { LogoutCommandHandler } from "../../src/modules/auth/application/commands/logout.handler";
import { RefreshTokensCommandHandler } from "../../src/modules/auth/application/commands/refresh-tokens.handler";
import { registerAuthRoutes } from "../../src/modules/auth/presentation/controllers/auth.controller";
import { registerUserRoutes } from "../../src/modules/auth/presentation/controllers/user.controller";
import { registerExceptionHandlers } from "../../src/shared/presentation/exception.handler";
import { UserOrmEntity } from "../../src/modules/auth/infrastructure/orm/entities/user.orm-entity";
import { RefreshTokenOrmEntity } from "../../src/modules/auth/infrastructure/orm/entities/refresh-token.orm-entity";
import { GetMeQueryHandler } from "../../src/modules/auth/application/queries/get-me.query-handler";
import { GetUserQueryHandler } from "../../src/modules/auth/application/queries/get-user.query-handler";
import { GetUsersQueryHandler } from "../../src/modules/auth/application/queries/get-users.query-handler";

// Venues imports
import { venueRoutes } from "../../src/modules/venue/presentation/controllers/venue.controller";

import { CreateVenueCommandHandler } from "../../src/modules/venue/application/commands/create-venue/create-venue.handler";
import { UpdateVenueCommandHandler } from "../../src/modules/venue/application/commands/update-venue/update-venue.handler";
import { DeleteVenueCommandHandler } from "../../src/modules/venue/application/commands/delete-venue/delete-venue.handler";
import { GetAllVenuesQueryHandler } from "../../src/modules/venue/application/queries/get-all-venues/get-all-venues.handler";
import { GetVenueByIdQueryHandler } from "../../src/modules/venue/application/queries/get-venue-by-id/get-venue-by-id.handler";
import { VenueFactory } from "../../src/modules/venue/domain/factories/venue.factory";
import { PostgresVenueRepository } from "../../src/modules/venue/infrastructure/repositories/postgres-venue.repository";
import { PostgresVenueReadRepository } from "../../src/modules/venue/infrastructure/repositories/postgres-venue-read.repository";
import { TypeOrmVenueEventChecker } from "../../src/modules/venue/infrastructure/repositories/venue-event-checker";
import { VenueOrmEntity } from "../../src/modules/venue/infrastructure/orm/entities/venue.orm-entity";

// Events imports
import { EventOrmEntity } from "../../src/modules/events/infrastructure/orm/entities/event.orm-entity";
import { PostgresEventRepository } from "../../src/modules/events/infrastructure/repositories/postgres-event.repository";
import { PostgresEventReadRepository } from "../../src/modules/events/infrastructure/repositories/postgres-event-read.repository";
import { VenueModuleAdapter as EventVenueModuleAdapter } from "../../src/modules/events/infrastructure/adapters/venue-module.adapter";
import { TicketCreatorAdapter } from "../../src/modules/events/infrastructure/adapters/ticket-creator.adapter";
import { EventFactory } from "../../src/modules/events/domain/factories/event.factory";
import { GetEventUseCase } from "../../src/modules/events/application/queries/get-event.use-case";
import { GetEventsUseCase } from "../../src/modules/events/application/queries/get-events.use-case";
import { UpdateEventUseCase } from "../../src/modules/events/application/commands/update-event.use-case";
import { CancelEventUseCase } from "../../src/modules/events/application/commands/cancel-event.use-case";
import { CreateEventUseCase } from "../../src/modules/events/application/commands/create-event.use-case";
import { DeleteEventUseCase } from "../../src/modules/events/application/commands/delete-event.use-case";
import { registerEventRoutes } from "../../src/modules/events/presentation/controllers/event.controller";
import { SyncEventStatusesUseCase } from "../../src/modules/events/application/commands/sync-event-statuses.use-case";

// Tickets imports
import { TicketOrmEntity } from "../../src/modules/tickets/infrastructure/orm/entities/ticket.orm-entity";
import { RegistrationModuleAdapter as TicketRegistrationModuleAdapter } from "../../src/modules/tickets/infrastructure/adapters/registration-module.adapter";
import { PostgresTicketRepository } from "../../src/modules/tickets/infrastructure/repositories/postgres-ticket.repository";
import { PostgresTicketReadRepository } from "../../src/modules/tickets/infrastructure/repositories/postgres-ticket-read.repository";
import { VenueModuleAdapter as TicketVenueModuleAdapter } from "../../src/modules/tickets/infrastructure/adapters/venue-module.adapter";
import { EventLookupAdapter } from "../../src/modules/tickets/infrastructure/adapters/event-lookup.adapter";
import { TicketFactory } from "../../src/modules/tickets/domain/factories/ticket.factory";
import { GetEventTicketsUseCase } from "../../src/modules/tickets/application/queries/get-event-tickets.use-case";
import { CreateTicketUseCase } from "../../src/modules/tickets/application/commands/create-ticket.use-case";
import { UpdateTicketUseCase } from "../../src/modules/tickets/application/commands/update-ticket.use-case";
import { DeleteTicketUseCase } from "../../src/modules/tickets/application/commands/delete-ticket.use-case";
import { registerTicketRoutes } from "../../src/modules/tickets/presentation/controllers/ticket.controller";

// Registrations imports
import { PostgresRegistrationRepository } from "../../src/modules/registrations/infrastructure/repositories/postgres-registration.repository";
import { PostgresRegistrationReadRepository } from "../../src/modules/registrations/infrastructure/repositories/postgres-registration-read.repository";
import { RegistrationFactory } from "../../src/modules/registrations/domain/factories/registration.factory";
import { CreateRegistrationCommandHandler } from "../../src/modules/registrations/application/commands/create-registration/create-registration.handler";
import { CancelRegistrationCommandHandler } from "../../src/modules/registrations/application/commands/cancel-registration/cancel-registration.handler";
import { GetUserRegistrationsQueryHandler } from "../../src/modules/registrations/application/queries/get-user-registrations/get-user-registrations.handler";
import { GetUserRegistrationQueryHandler } from "../../src/modules/registrations/application/queries/get-user-registration/get-user-registration.handler";
import { GetEventRegistrationsQueryHandler } from "../../src/modules/registrations/application/queries/get-event-registrations/get-event-registrations.handler";
import { GetEventRegistrationQueryHandler } from "../../src/modules/registrations/application/queries/get-event-registration/get-event-registration.handler";
import { GetRegistrationsCountQueryHandler } from "../../src/modules/registrations/application/queries/get-registrations-count/get-registrations-count.handler";
import { registerRegistrationRoutes } from "../../src/modules/registrations/presentation/controllers/registration.controller";
import { RegistrationOrmEntity } from "../../src/modules/registrations/infrastructure/orm/entities/registration.orm-entity";
import { EventInfoRepositoryAdapter } from "../../src/modules/registrations/infrastructure/adapters/event-info.repository.adapter";
import { TicketInfoRepositoryAdapter } from "../../src/modules/registrations/infrastructure/adapters/ticket-info.repository.adapter";
import { DataSource } from "typeorm";

export interface IntegrationTestApp {
  app: FastifyInstance;
  dataSource: DataSource;
}

export async function buildIntegrationTestApp() {
  const config = {
    port: Number(process.env.PORT) || 3000,
    db: {
      host: process.env.TEST_DB_HOST || "localhost",
      port: Number(process.env.TEST_DB_PORT) || 5433,
      username: process.env.TEST_DB_USER || "postgres",
      password: process.env.TEST_DB_PASSWORD || "postgres",
      database: process.env.TEST_DB_NAME || "test_db",
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
  const userOrmRepo = dataSource.getRepository(UserOrmEntity);
  const userRepository = new PostgresUserRepository(userOrmRepo);
  const userReadRepository = new PostgresUserReadRepository(userOrmRepo);
  const refreshTokenRepository = new PostgresRefreshTokenRepository(
    dataSource.getRepository(RefreshTokenOrmEntity),
  );

  const passwordService = new Argon2PasswordService();
  const tokenService = new JwtTokenService(config.jwt);
  const jwtGuard = createJwtGuard(tokenService);
  const adminGuard = createAdminGuard();
  const guards = { jwtGuard, adminGuard };

  const signupUseCase = new SignupCommandHandler(
    userRepository,
    refreshTokenRepository,
    passwordService,
    tokenService,
  );
  const loginUseCase = new LoginCommandHandler(
    userRepository,
    refreshTokenRepository,
    passwordService,
    tokenService,
  );
  const logoutUseCase = new LogoutCommandHandler(refreshTokenRepository, tokenService);
  const refreshTokensUseCase = new RefreshTokensCommandHandler(
    userRepository,
    refreshTokenRepository,
    tokenService,
  );

  const getMeHandler = new GetMeQueryHandler(userReadRepository);
  const getUserHandler = new GetUserQueryHandler(userReadRepository);
  const getUsersHandler = new GetUsersQueryHandler(userReadRepository);

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

  const eventFactory = new EventFactory(eventVenueAdapter);

  const getEventsUseCase = new GetEventsUseCase(eventReadRepository);
  const getEventUseCase = new GetEventUseCase(eventReadRepository);

  const updateEventUseCase = new UpdateEventUseCase(eventRepository, eventVenueAdapter);
  const cancelEventUseCase = new CancelEventUseCase(eventRepository);
  const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
  const syncEventStatusesUseCase = new SyncEventStatusesUseCase(eventRepository);

  // Tickets
  const ticketRepository = new PostgresTicketRepository(dataSource.getRepository(TicketOrmEntity));
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

  const registrationWriteRepository = new PostgresRegistrationRepository(registrationOrmRepository);
  const registrationReadRepository = new PostgresRegistrationReadRepository(
    registrationOrmRepository,
  );

  const eventInfoRepository = new EventInfoRepositoryAdapter(eventRepository);
  const ticketInfoRepository = new TicketInfoRepositoryAdapter(ticketRepository);

  const registrationFactory = new RegistrationFactory(
    registrationWriteRepository,
    ticketInfoRepository,
    eventInfoRepository,
  );

  const createRegistrationHandler = new CreateRegistrationCommandHandler(
    registrationWriteRepository,
    registrationFactory,
  );
  const cancelRegistrationHandler = new CancelRegistrationCommandHandler(
    registrationWriteRepository,
  );

  const getUserRegistrationsHandler = new GetUserRegistrationsQueryHandler(
    registrationReadRepository,
  );
  const getUserRegistrationHandler = new GetUserRegistrationQueryHandler(
    registrationReadRepository,
  );
  const getEventRegistrationsHandler = new GetEventRegistrationsQueryHandler(
    registrationReadRepository,
    eventInfoRepository,
  );
  const getEventRegistrationHandler = new GetEventRegistrationQueryHandler(
    registrationReadRepository,
    eventInfoRepository,
  );

  const getRegistrationsCountHandler = new GetRegistrationsCountQueryHandler(
    registrationReadRepository,
    eventInfoRepository,
    ticketInfoRepository,
  );

  const ticketCreator = new TicketCreatorAdapter(createTicketUseCase);
  const createEventUseCase = new CreateEventUseCase(eventFactory, eventRepository, ticketCreator);

  // Tickets update and delete use cases depend on registration for ticketRegistrationAdapter
  const ticketRegistrationAdapter = new TicketRegistrationModuleAdapter(
    getRegistrationsCountHandler,
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

  // Fastify
  const app = Fastify({ logger: false });

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

  registerUserRoutes(
    app,
    {
      getMeHandler,
      getUserHandler,
      getUsersHandler,
    },
    guards,
  );

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
      createRegistrationHandler,
      cancelRegistrationHandler,
      getUserRegistrationsHandler,
      getUserRegistrationHandler,
      getEventRegistrationsHandler,
      getEventRegistrationHandler,
      getRegistrationsCountHandler,
    },
    guards,
  );

  await app.ready();
  return { app, dataSource };
}
