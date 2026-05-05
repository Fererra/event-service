import Fastify, { FastifyInstance } from "fastify";
import { registerTicketRoutes } from "../../../../src/modules/tickets/presentation/controllers/ticket.controller";
import { registerExceptionHandlers } from "../../../../src/shared/presentation/exception.handler";
import {
  InMemoryTicketRepository,
  FakeEventLookupRepository,
  FakeRegistrationCountRepository,
} from "../application/in-memory.repositories";
import { InMemoryVenueRepository } from "../domain/in-memory.venue.repo";
import { TicketFactory } from "../../../../src/modules/tickets/domain/factories/ticket.factory";
import { CreateTicketUseCase } from "../../../../src/modules/tickets/application/commands/create-ticket.use-case";
import { GetEventTicketsUseCase } from "../../../../src/modules/tickets/application/queries/get-event-tickets.use-case";
import { UpdateTicketUseCase } from "../../../../src/modules/tickets/application/commands/update-ticket.use-case";
import { DeleteTicketUseCase } from "../../../../src/modules/tickets/application/commands/delete-ticket.use-case";

export const fakeJwtGuard = async (req: any, _reply: any) => {
  req.user = { id: "admin-1", email: "a@a", role: "admin" };
};
export const fakeAdminGuard = async (_req: any, _reply: any) => {};

export interface TestApp {
  app: FastifyInstance;
  ticketRepo: InMemoryTicketRepository;
  eventLookup: FakeEventLookupRepository;
  registrationRepo: FakeRegistrationCountRepository;
  venueRepo: InMemoryVenueRepository;
}

export async function buildTestApp(): Promise<TestApp> {
  const TEST_VENUE_ID = "00000000-0000-0000-0000-000000000001";
  const ticketRepo = new InMemoryTicketRepository();
  const eventLookup = new FakeEventLookupRepository([
    { id: 1, venueId: TEST_VENUE_ID, isCancelledOrFinished: false },
  ]);
  const registrationRepo = new FakeRegistrationCountRepository();
  const venueRepo = new InMemoryVenueRepository([{ id: TEST_VENUE_ID, capacity: 100 }]);
  const ticketFactory = new TicketFactory(ticketRepo as any, venueRepo as any);

  const createTicketUseCase = new CreateTicketUseCase(ticketFactory, ticketRepo, eventLookup);
  const getEventTicketsUseCase = new GetEventTicketsUseCase(ticketRepo, eventLookup);
  const updateTicketUseCase = new UpdateTicketUseCase(
    ticketRepo,
    eventLookup,
    venueRepo,
    registrationRepo,
  );
  const deleteTicketUseCase = new DeleteTicketUseCase(ticketRepo, eventLookup, registrationRepo);

  const app = Fastify({ logger: false });
  registerExceptionHandlers(app);

  registerTicketRoutes(
    app,
    {
      getEventTicketsUseCase,
      createTicketUseCase,
      updateTicketUseCase,
      deleteTicketUseCase,
    },
    { jwtGuard: fakeJwtGuard as any, adminGuard: fakeAdminGuard as any },
  );

  await app.ready();
  return { app, ticketRepo, eventLookup, registrationRepo, venueRepo };
}
