import Fastify, { FastifyInstance } from "fastify";
import { registerEventRoutes } from "../../../../src/modules/events/presentation/controllers/event.controller";
import { registerExceptionHandlers } from "../../../../src/shared/presentation/exception.handler";
import { InMemoryEventRepository } from "../application/in-memory.repositories";
import { InMemoryVenueRepository } from "../domain/in-memory.venue.repo";
import { EventFactory } from "../../../../src/modules/events/domain/factories/event.factory";
import { CreateEventUseCase } from "../../../../src/modules/events/application/commands/create-event.use-case";
import { GetEventsUseCase } from "../../../../src/modules/events/application/queries/get-events.use-case";
import { GetEventUseCase } from "../../../../src/modules/events/application/queries/get-event.use.case";
import { UpdateEventUseCase } from "../../../../src/modules/events/application/commands/update-event.use-case";
import { CancelEventUseCase } from "../../../../src/modules/events/application/commands/cancel-event.use-case";
import { DeleteEventUseCase } from "../../../../src/modules/events/application/commands/delete-event.use-case";
import { FakeTicketCreator } from "../application/in-memory.repositories";

export const fakeJwtGuard = async (req: any, reply: any) => {
  req.user = { id: "00000000-0000-0000-0000-000000000001", email: "a@a", role: "admin" };
};
export const fakeAdminGuard = async (_req: any, _reply: any) => {};

export interface TestApp {
  app: FastifyInstance;
  eventRepo: InMemoryEventRepository;
  venueRepo: InMemoryVenueRepository;
  ticketCreator: FakeTicketCreator;
}

export async function buildTestApp(): Promise<TestApp> {
  const eventRepo = new InMemoryEventRepository();
  const venueRepo = new InMemoryVenueRepository([
    { id: "00000000-0000-0000-0000-000000000001", capacity: 100 },
  ]);
  const ticketCreator = new FakeTicketCreator();
  const eventFactory = new EventFactory(venueRepo);

  const createEventUseCase = new CreateEventUseCase(eventFactory, eventRepo, ticketCreator);
  const getEventsUseCase = new GetEventsUseCase(eventRepo);
  const getEventUseCase = new GetEventUseCase(eventRepo);
  const updateEventUseCase = new UpdateEventUseCase(eventRepo, venueRepo);
  const cancelEventUseCase = new CancelEventUseCase(eventRepo);
  const deleteEventUseCase = new DeleteEventUseCase(eventRepo);

  const app = Fastify({ logger: false });
  registerExceptionHandlers(app);

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
    { jwtGuard: fakeJwtGuard as any, adminGuard: fakeAdminGuard as any },
  );

  await app.ready();
  return { app, eventRepo, venueRepo, ticketCreator };
}
