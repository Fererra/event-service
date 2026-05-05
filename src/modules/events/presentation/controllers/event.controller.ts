import { FastifyInstance, preHandlerHookHandler } from "fastify";
import { GetEventsUseCase } from "../../application/queries/get-events.use-case";
import { GetEventUseCase } from "../../application/queries/get-event.use-case";
import { CreateEventUseCase } from "../../application/commands/create-event.use-case";
import { UpdateEventUseCase } from "../../application/commands/update-event.use-case";
import { CancelEventUseCase } from "../../application/commands/cancel-event.use-case";
import { DeleteEventUseCase } from "../../application/commands/delete-event.use-case";
import {
  CreateEventDto,
  UpdateEventDto,
  createEventSchema,
  updateEventSchema,
} from "../dtos/event.dto";
import { AuthenticatedRequest } from "../../../../shared/presentation/authenicated-request.type";

export interface EventUseCases {
  getEventsUseCase: GetEventsUseCase;
  getEventUseCase: GetEventUseCase;
  createEventUseCase: CreateEventUseCase;
  updateEventUseCase: UpdateEventUseCase;
  cancelEventUseCase: CancelEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;
}

export interface EventRouteGuards {
  jwtGuard: preHandlerHookHandler;
  adminGuard: preHandlerHookHandler;
}

export function registerEventRoutes(
  app: FastifyInstance,
  useCases: EventUseCases,
  guards: EventRouteGuards,
): void {
  const {
    getEventsUseCase,
    getEventUseCase,
    createEventUseCase,
    updateEventUseCase,
    cancelEventUseCase,
    deleteEventUseCase,
  } = useCases;
  const adminOnly = [guards.jwtGuard, guards.adminGuard];

  app.get("/events", async (req, reply) => {
    const events = await getEventsUseCase.execute();
    reply.send(events);
  });

  app.get<{ Params: { eventId: string } }>("/events/:eventId", async (req, reply) => {
    const event = await getEventUseCase.execute(Number(req.params.eventId));
    reply.send(event);
  });

  app.post<{ Body: CreateEventDto }>(
    "/events",
    { preHandler: adminOnly, schema: createEventSchema },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;
      const eventId = await createEventUseCase.execute({
        ownerId: user.id,
        name: req.body.name,
        organisator: req.body.organisator,
        description: req.body.description,
        startTimestamp: new Date(req.body.start_timestamp),
        endTimestamp: new Date(req.body.end_timestamp),
        venueId: req.body.venue_id,
        tickets: req.body.tickets,
      });
      reply.status(201).send({ id: eventId });
    },
  );

  app.patch<{ Params: { eventId: string }; Body: UpdateEventDto }>(
    "/events/:eventId",
    { preHandler: adminOnly, schema: updateEventSchema },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;
      await updateEventUseCase.execute({
        eventId: Number(req.params.eventId),
        requestingUserId: user.id,
        data: {
          name: req.body.name,
          organisator: req.body.organisator,
          description: req.body.description,
          startTimestamp: req.body.start_timestamp ? new Date(req.body.start_timestamp) : undefined,
          endTimestamp: req.body.end_timestamp ? new Date(req.body.end_timestamp) : undefined,
          venueId: req.body.venue_id,
        },
      });
      reply.status(204).send();
    },
  );

  app.patch<{ Params: { eventId: string } }>(
    "/events/:eventId/cancel",
    { preHandler: adminOnly },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;
      await cancelEventUseCase.execute({
        eventId: Number(req.params.eventId),
        requestingUserId: user.id,
      });
      reply.status(204).send();
    },
  );

  app.delete<{ Params: { eventId: string } }>(
    "/events/:eventId",
    { preHandler: adminOnly },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;
      await deleteEventUseCase.execute({
        eventId: Number(req.params.eventId),
        requestingUserId: user.id,
      });
      reply.status(204).send();
    },
  );
}
