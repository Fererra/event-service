import Fastify, { FastifyInstance } from "fastify";
import { CreateRegistrationUseCase } from "../../../../src/modules/registrations/application/use-cases/create-registration.use-case";
import { GetUserRegistrationsUseCase } from "../../../../src/modules/registrations/application/use-cases/get-user-registrations.use-case";
import { GetUserRegistrationUseCase } from "../../../../src/modules/registrations/application/use-cases/get-user-registration.use-case";
import { GetEventRegistrationsUseCase } from "../../../../src/modules/registrations/application/use-cases/get-event-registrations.use-case";
import { GetEventRegistrationUseCase } from "../../../../src/modules/registrations/application/use-cases/get-event-registration.use-case";
import { CancelRegistrationUseCase } from "../../../../src/modules/registrations/application/use-cases/cancel-registration.use-case";
import { GetRegistrationsCountUseCase } from "../../../../src/modules/registrations/application/use-cases/get-registrations-count.use-case";
import { RegistrationFactory } from "../../../../src/modules/registrations/domain/factories/registration.factory";
import { registerRegistrationRoutes } from "../../../../src/modules/registrations/presentation/controllers/registration.controller";
import { UserRole } from "../../../../src/shared/domain/value-objects/user-role.enum";
import {
  InMemoryRegistrationRepository,
  FakeEventInfoRepository,
  FakeTicketInfoRepository,
} from "../application/fakes";
import { registerExceptionHandlers } from "../../../../src/shared/presentation/exception.handler";

const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export interface TestRegistrationsApp {
  app: FastifyInstance;
  registrationRepo: InMemoryRegistrationRepository;
  eventRepo: FakeEventInfoRepository;
  ticketRepo: FakeTicketInfoRepository;
  currentUserId: string;
  currentRole: UserRole;
}

export async function buildTestRegistrationsApp(
  role: UserRole = UserRole.USER,
): Promise<TestRegistrationsApp> {
  const registrationRepo = new InMemoryRegistrationRepository();
  const eventRepo = new FakeEventInfoRepository();
  const ticketRepo = new FakeTicketInfoRepository();

  const factory = new RegistrationFactory(registrationRepo, ticketRepo, eventRepo);

  const createRegistrationUseCase = new CreateRegistrationUseCase(registrationRepo, factory);
  const getUserRegistrationsUseCase = new GetUserRegistrationsUseCase(registrationRepo);
  const getUserRegistrationUseCase = new GetUserRegistrationUseCase(registrationRepo);
  const getEventRegistrationsUseCase = new GetEventRegistrationsUseCase(registrationRepo);
  const getEventRegistrationUseCase = new GetEventRegistrationUseCase(registrationRepo);
  const cancelRegistrationUseCase = new CancelRegistrationUseCase(registrationRepo);
  const getRegistrationsCountUseCase = new GetRegistrationsCountUseCase(
    registrationRepo,
    ticketRepo,
    eventRepo,
  );

  const app = Fastify({ logger: false });

  registerExceptionHandlers(app);

  app.addHook("preHandler", async (req) => {
    (req as any).user = { id: TEST_USER_ID, role };
  });

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
    {
      jwtGuard: async () => {},
      adminGuard: async (req, reply) => {
        if ((req as any).user?.role !== UserRole.ADMIN) {
          void reply.status(403).send({ error: "Forbidden" });
        }
      },
    },
  );

  await app.ready();

  return {
    app,
    registrationRepo,
    eventRepo,
    ticketRepo,
    currentUserId: TEST_USER_ID,
    currentRole: role,
  };
}
