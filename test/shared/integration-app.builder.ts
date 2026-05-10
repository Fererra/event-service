import "reflect-metadata";
import Fastify, { FastifyInstance } from "fastify";
import { createDataSource } from "../../src/shared/infrastructure/database.config";

// Auth imports
import { PostgresUserRepository } from "../../src/modules/auth/infrastructure/repositories/postgres-user.repository";
import { PostgresRefreshTokenRepository } from "../../src/modules/auth/infrastructure/repositories/postgres-refresh-token.repository";
import { Argon2PasswordService } from "../../src/modules/auth/infrastructure/services/argon-password.service";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/services/jwt-token.service";
import { createJwtGuard } from "../../src/modules/auth/presentation/guards/jwt.guard";
import { createAdminGuard } from "../../src/modules/auth/presentation/guards/admin.guard";
import { SignupUseCase } from "../../src/modules/auth/application/commands/signup.use-case";
import { LoginUseCase } from "../../src/modules/auth/application/commands/login.use-case";
import { LogoutUseCase } from "../../src/modules/auth/application/commands/logout.use-case";
import { RefreshTokensUseCase } from "../../src/modules/auth/application/commands/refresh-tokens.use-case";
import { registerAuthRoutes } from "../../src/modules/auth/presentation/controllers/auth.controller";
import { registerExceptionHandlers } from "../../src/shared/presentation/exception.handler";
import { UserOrmEntity } from "../../src/modules/auth/infrastructure/orm/entities/user.orm-entity";
import { RefreshTokenOrmEntity } from "../../src/modules/auth/infrastructure/orm/entities/refresh-token.orm-entity";

// Venues imports
import { venueRoutes } from "../../src/modules/venue/presentation/controllers/venue.controller";
import { CreateVenueUseCase } from "../../src/modules/venue/application/use-cases/create-venue.use-case";
import { GetAllVenuesUseCase } from "../../src/modules/venue/application/use-cases/get-venues.use-case";
import { GetVenueByIdUseCase } from "../../src/modules/venue/application/use-cases/get-venue-by-id.use-case";
import { UpdateVenueUseCase } from "../../src/modules/venue/application/use-cases/update-venue.use-case";
import { DeleteVenueUseCase } from "../../src/modules/venue/application/use-cases/delete-venue.use-case";
import { VenueFactory } from "../../src/modules/venue/domain/factories/venue.factory";
import { PostgresVenueRepository } from "../../src/modules/venue/infrastructure/repositories/postgres-venue.repository";
import { TypeOrmVenueEventChecker } from "../../src/modules/venue/infrastructure/repositories/venue-event-checker";
import { VenueOrmEntity } from "../../src/modules/venue/infrastructure/orm/entities/venue.orm-entity";

// Events imports
import { EventOrmEntity } from "../../src/modules/events/infrastructure/orm/entities/event.orm-entity";
import { PostgresEventRepository } from "../../src/modules/events/infrastructure/repositories/postgres-event.repository";
import { VenueModuleAdapter as EventVenueModuleAdapter } from "../../src/modules/events/infrastructure/adapters/venue-module.adapter";
import { TicketCreatorAdapter } from "../../src/modules/events/infrastructure/adapters/ticket-creator.adapter";
import { EventFactory } from "../../src/modules/events/domain/factories/event.factory";
import { GetEventUseCase } from "../../src/modules/events/application/queries/get-event.use.case";
import { GetEventsUseCase } from "../../src/modules/events/application/queries/get-events.use-case";
import { UpdateEventUseCase } from "../../src/modules/events/application/commands/update-event.use-case";
import { CancelEventUseCase } from "../../src/modules/events/application/commands/cancel-event.use-case";
import { CreateEventUseCase } from "../../src/modules/events/application/commands/create-event.use-case";
import { DeleteEventUseCase } from "../../src/modules/events/application/commands/delete-event.use-case";
import { registerEventRoutes } from "../../src/modules/events/presentation/controllers/event.controller";
import { SyncEventStatusesUseCase } from "../../src/modules/events/application/commands/sync-event-statuses.use-case";

// Tickets imports
import { TicketOrmEntity } from "../../src/modules/tickets/infrastructure/orm/entities/ticket.orm-entity";
import { RegistrationModuleAdapter as TicketRegistrationModuleAdapter } from "../../src/modules/tickets/infrastructure/adapters/registartion-module.adapter";
import { PostgresTicketRepository } from "../../src/modules/tickets/infrastructure/repositories/postgres-ticket.repository";
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
import { RegistrationFactory } from "../../src/modules/registrations/domain/factories/registration.factory";
import { CreateRegistrationUseCase } from "../../src/modules/registrations/application/use-cases/create-registration.use-case";
import { GetUserRegistrationsUseCase } from "../../src/modules/registrations/application/use-cases/get-user-registrations.use-case";
import { GetUserRegistrationUseCase } from "../../src/modules/registrations/application/use-cases/get-user-registration.use-case";
import { GetEventRegistrationsUseCase } from "../../src/modules/registrations/application/use-cases/get-event-registrations.use-case";
import { GetEventRegistrationUseCase } from "../../src/modules/registrations/application/use-cases/get-event-registration.use-case";
import { registerRegistrationRoutes } from "../../src/modules/registrations/presentation/controllers/registration.controller";
import { RegistrationOrmEntity } from "../../src/modules/registrations/infrastructure/orm/entities/registration.orm-entity";
import { CancelRegistrationUseCase } from "../../src/modules/registrations/application/use-cases/cancel-registration.use-case";
import { GetRegistrationsCountUseCase } from "../../src/modules/registrations/application/use-cases/get-registrations-count.use-case";
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
  const venueRepository = new PostgresVenueRepository(dataSource.getRepository(VenueOrmEntity));
  const venueFactory = new VenueFactory(venueRepository);
  const createVenueUseCase = new CreateVenueUseCase(venueRepository, venueFactory);
  const getAllVenuesUseCase = new GetAllVenuesUseCase(venueRepository);
  const getVenueByIdUseCase = new GetVenueByIdUseCase(venueRepository);
  const updateVenueUseCase = new UpdateVenueUseCase(venueRepository, venueFactory);

  const eventOrmRepo = dataSource.getRepository(EventOrmEntity);
  const realEventChecker = new TypeOrmVenueEventChecker(eventOrmRepo);

  const deleteVenueUseCase = new DeleteVenueUseCase(venueRepository, realEventChecker);

  // Events
  const eventRepository = new PostgresEventRepository(dataSource.getRepository(EventOrmEntity));
  const eventVenueAdapter = new EventVenueModuleAdapter(getVenueByIdUseCase);

  const eventFactory = new EventFactory(eventVenueAdapter);

  const getEventsUseCase = new GetEventsUseCase(eventRepository);
  const getEventUseCase = new GetEventUseCase(eventRepository);
  const updateEventUseCase = new UpdateEventUseCase(eventRepository, eventVenueAdapter);
  const cancelEventUseCase = new CancelEventUseCase(eventRepository);
  const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
  const syncEventStatusesUseCase = new SyncEventStatusesUseCase(eventRepository);

  // Tickets
  const ticketRepository = new PostgresTicketRepository(dataSource.getRepository(TicketOrmEntity));
  const ticketVenueAdapter = new TicketVenueModuleAdapter(getVenueByIdUseCase);
  const eventLookupAdapter = new EventLookupAdapter(getEventUseCase);

  const ticketFactory = new TicketFactory(ticketRepository, ticketVenueAdapter);

  const getEventTicketsUseCase = new GetEventTicketsUseCase(ticketRepository, eventLookupAdapter);
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

  // Fastify
  const app = Fastify({ logger: false });

  registerExceptionHandlers(app);

  venueRoutes(
    app,
    {
      createVenueUseCase,
      getAllVenuesUseCase,
      getVenueByIdUseCase,
      updateVenueUseCase,
      deleteVenueUseCase,
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

  await app.ready();
  return { app, dataSource };
}
