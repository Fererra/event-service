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
import { SignupCommandHandler } from "./modules/auth/application/commands/signup.handler";
import { LoginCommandHandler } from "./modules/auth/application/commands/login.handler";
import { LogoutCommandHandler } from "./modules/auth/application/commands/logout.handler";
import { RefreshTokensCommandHandler } from "./modules/auth/application/commands/refresh-tokens.handler";
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
import { VenueEventCheckerAdapter } from "./modules/venue/infrastructure/adapters/venue-event-checker.adapter";
import { VenueOrmEntity } from "./modules/venue/infrastructure/orm/entities/venue.orm-entity";
import { VenueApi } from "./modules/venue/api/venue.api";

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
import { RegistrationModuleAdapter as TicketRegistrationModuleAdapter } from "./modules/tickets/infrastructure/adapters/registration-module.adapter";
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
import { PostgresRegistrationReadRepository } from "./modules/registrations/infrastructure/repositories/postgres-registration-read.repository";
import { RegistrationFactory } from "./modules/registrations/domain/factories/registration.factory";
import { CreateRegistrationCommandHandler } from "./modules/registrations/application/commands/create-registration/create-registration.handler";
import { CancelRegistrationCommandHandler } from "./modules/registrations/application/commands/cancel-registration/cancel-registration.handler";
import { GetUserRegistrationsQueryHandler } from "./modules/registrations/application/queries/get-user-registrations/get-user-registrations.handler";
import { GetUserRegistrationQueryHandler } from "./modules/registrations/application/queries/get-user-registration/get-user-registration.handler";
import { GetEventRegistrationsQueryHandler } from "./modules/registrations/application/queries/get-event-registrations/get-event-registrations.handler";
import { GetEventRegistrationQueryHandler } from "./modules/registrations/application/queries/get-event-registration/get-event-registration.handler";
import { GetRegistrationsCountQueryHandler } from "./modules/registrations/application/queries/get-registrations-count/get-registrations-count.handler";
import { registerRegistrationRoutes } from "./modules/registrations/presentation/controllers/registration.controller";
import { RegistrationOrmEntity } from "./modules/registrations/infrastructure/orm/entities/registration.orm-entity";
import { EventInfoRepositoryAdapter } from "./modules/registrations/infrastructure/adapters/event-info.repository.adapter";
import { TicketInfoRepositoryAdapter } from "./modules/registrations/infrastructure/adapters/ticket-info.repository.adapter";
import { PostgresUserReadRepository } from "./modules/auth/infrastructure/repositories/postgres-user-read.repository";
import { GetMeQueryHandler } from "./modules/auth/application/queries/get-me.query-handler";
import { GetUserQueryHandler } from "./modules/auth/application/queries/get-user.query-handler";
import { GetUsersQueryHandler } from "./modules/auth/application/queries/get-users.query-handler";
import { registerUserRoutes } from "./modules/auth/presentation/controllers/user.controller";

// Notifications
import { ConsoleNotificationService } from "./modules/notifications/infrastructure/console.notification.service";
import { InProcessEventBus } from "./shared/infrastructure/event-bus/in-process-event-bus";
import { RegistrationCreatedCommandHandler } from "./modules/notifications/application/handlers/registration-created.handler";
import { EventCancelledCommandHandler } from "./modules/notifications/application/handlers/event-cancelled.handler";
import { RegistrationCreatedEvent } from "./shared/domain/events/registration-created.event";
import { EventCancelledEvent } from "./shared/domain/events/event-cancelled.event";
import { CreateRegistrationAsyncCommandHandler } from "./modules/registrations/application/commands/create-registration/create-registration-async.handler";
import { CancelEventAsyncUseCase } from "./modules/events/application/commands/cancel-event-async.use-case";

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

  // Event Bus
  const eventBus = new InProcessEventBus();

  // Auth
  const userRepository = new PostgresUserRepository(dataSource.getRepository(UserOrmEntity));
  const userReadRepository = new PostgresUserReadRepository(
    dataSource.getRepository(UserOrmEntity),
  );
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

  const createVenueHandler = new CreateVenueCommandHandler(
    venueWriteRepository,
    venueFactory,
    eventBus,
  );
  const updateVenueHandler = new UpdateVenueCommandHandler(
    venueWriteRepository,
    venueFactory,
    eventBus,
  );

  const eventApiPlaceholder = { execute: async () => [] } as any;
  const venueEventChecker = new VenueEventCheckerAdapter(eventApiPlaceholder);

  const deleteVenueHandler = new DeleteVenueCommandHandler(
    venueWriteRepository,
    venueEventChecker,
    eventBus,
  );

  const getAllVenuesHandler = new GetAllVenuesQueryHandler(venueReadRepository);
  const getVenueByIdHandler = new GetVenueByIdQueryHandler(venueReadRepository);
  const venueApi = new VenueApi(getVenueByIdHandler);

  // Events
  const eventRepository = new PostgresEventRepository(dataSource.getRepository(EventOrmEntity));
  const eventReadRepository = new PostgresEventReadRepository(
    dataSource.getRepository(EventOrmEntity),
  );

  const eventVenueAdapter = new EventVenueModuleAdapter(venueApi as any);

  const eventFactory = new EventFactory(eventVenueAdapter);

  const getEventsUseCase = new GetEventsUseCase(eventReadRepository);
  const getEventUseCase = new GetEventUseCase(eventReadRepository);

  const updateEventUseCase = new UpdateEventUseCase(eventRepository, eventVenueAdapter);
  const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
  const syncEventStatusesUseCase = new SyncEventStatusesUseCase(eventRepository);

  // Tickets
  const ticketRepository = new PostgresTicketRepository(dataSource.getRepository(TicketOrmEntity));
  const ticketVenueAdapter = new TicketVenueModuleAdapter(venueApi as any);
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

  const eventInfoRepository = new EventInfoRepositoryAdapter(eventApiPlaceholder);
  const ticketInfoRepository = new TicketInfoRepositoryAdapter(ticketRepository);

  const notificationService = new ConsoleNotificationService();

  const registrationCreatedNotificationHandler = new RegistrationCreatedCommandHandler(
    notificationService,
  );
  const eventCancelledNotificationHandler = new EventCancelledCommandHandler(notificationService);

  eventBus.subscribe(RegistrationCreatedEvent, (e) =>
    registrationCreatedNotificationHandler.handle(e),
  );
  eventBus.subscribe(EventCancelledEvent, (e) => eventCancelledNotificationHandler.handle(e));

  const registrationFactory = new RegistrationFactory(
    registrationWriteRepository,
    ticketInfoRepository,
    eventInfoRepository,
  );

  // Sync варіанти
  const createRegistrationHandler = new CreateRegistrationCommandHandler(
    registrationWriteRepository,
    registrationFactory,
    eventInfoRepository,
    notificationService,
  );
  const cancelEventUseCase = new CancelEventUseCase(eventRepository, notificationService);

  // Async варіанти
  const createRegistrationAsyncHandler = new CreateRegistrationAsyncCommandHandler(
    registrationWriteRepository,
    registrationFactory,
    eventInfoRepository,
    eventBus,
  );
  const cancelEventAsyncUseCase = new CancelEventAsyncUseCase(eventRepository, eventBus);

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

  registerUserRoutes(app, { getMeHandler, getUserHandler, getUsersHandler }, guards);

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

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server running on port ${config.port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
