import Fastify, { FastifyInstance } from "fastify";
import { CreateVenueUseCase } from "../../../../src/modules/venue/application/use-cases/create-venue.use-case";
import { GetAllVenuesUseCase } from "../../../../src/modules/venue/application/use-cases/get-venues.use-case";
import { GetVenueByIdUseCase } from "../../../../src/modules/venue/application/use-cases/get-venue-by-id.use-case";
import { UpdateVenueUseCase } from "../../../../src/modules/venue/application/use-cases/update-venue.use-case";
import { DeleteVenueUseCase } from "../../../../src/modules/venue/application/use-cases/delete-venue.use-case";
import { VenueFactory } from "../../../../src/modules/venue/domain/factories/venue.factory";
import { venueRoutes } from "../../../../src/modules/venue/presentation/controllers/venue.controller";
import { UserRole } from "../../../../src/shared/domain/value-objects/user-role.enum";
import { InMemoryVenueRepository, FakeVenueEventChecker } from "../application/fakes";
import { registerExceptionHandlers } from "../../../../src/shared/presentation/exception.handler";

const TEST_ADMIN_ID = "550e8400-e29b-41d4-a716-446655440000";

export interface TestVenueApp {
  app: FastifyInstance;
  venueRepo: InMemoryVenueRepository;
  eventChecker: FakeVenueEventChecker;
}

export async function buildTestVenueApp(): Promise<TestVenueApp> {
  const venueRepo = new InMemoryVenueRepository();
  const eventChecker = new FakeVenueEventChecker();

  const factory = new VenueFactory(venueRepo);
  const createVenueUseCase = new CreateVenueUseCase(venueRepo, factory);
  const getAllVenuesUseCase = new GetAllVenuesUseCase(venueRepo);
  const getVenueByIdUseCase = new GetVenueByIdUseCase(venueRepo);
  const updateVenueUseCase = new UpdateVenueUseCase(venueRepo, factory);
  const deleteVenueUseCase = new DeleteVenueUseCase(venueRepo, eventChecker);

  const app = Fastify({ logger: false });

  registerExceptionHandlers(app);

  app.addHook("preHandler", async (req) => {
    (req as any).user = { id: TEST_ADMIN_ID, role: UserRole.ADMIN };
  });

  venueRoutes(
    app,
    {
      createVenueUseCase,
      getAllVenuesUseCase,
      getVenueByIdUseCase,
      updateVenueUseCase,
      deleteVenueUseCase,
    },
    {
      jwtGuard: async () => {},
      adminGuard: async () => {},
    },
  );

  await app.ready();

  return { app, venueRepo, eventChecker };
}
