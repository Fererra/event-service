import { FastifyInstance } from "fastify";
import { GetEventsUseCase } from "../../application/queries/get-events.use-case";
import { GetEventUseCase } from "../../application/queries/get-event.use.case";
import { CreateEventUseCase } from "../../application/commands/create-event.use-case";
import { UpdateEventUseCase } from "../../application/commands/update-event.use-case";
import { CancelEventUseCase } from "../../application/commands/cancel-event.use-case";
import { DeleteEventUseCase } from "../../application/commands/delete-event.use-case";
import { Event } from "../../domain/entities/event.entity";
import {
  CreateEventDto,
  UpdateEventDto,
  EventResponseDto,
  createEventSchema,
  updateEventSchema,
} from "../dtos/event.dto";
import { createJwtGuard } from "../../../auth/presentation/guards/jwt.guard";
import { createAdminGuard } from "../../../auth/presentation/guards/admin.guard";
import { TokenService } from "../../../auth/application/ports/token.service";

function toEventResponse(event: Event): EventResponseDto {
  return {
    id: event.id,
    owner_id: event.ownerId,
    name: event.name,
    organisator: event.organisator,
    description: event.description,
    start_timestamp: event.startTimestamp.toISOString(),
    end_timestamp: event.endTimestamp.toISOString(),
    status: event.status,
    venue_id: event.venueId,
    created_at: event.createdAt.toISOString(),
  };
}

export interface EventUseCases {
  getEventsUseCase: GetEventsUseCase;
  getEventUseCase: GetEventUseCase;
  createEventUseCase: CreateEventUseCase;
  updateEventUseCase: UpdateEventUseCase;
  cancelEventUseCase: CancelEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;
}

export function registerEventRoutes(
  app: FastifyInstance,
  useCases: EventUseCases,
  tokenService: TokenService,
): void {
  const {
    getEventsUseCase,
    getEventUseCase,
    createEventUseCase,
    updateEventUseCase,
    cancelEventUseCase,
    deleteEventUseCase,
  } = useCases;

  const jwtGuard = createJwtGuard(tokenService);
  const adminGuard = createAdminGuard();
  const adminOnly = [jwtGuard, adminGuard];

  app.get("/events", async (req, reply) => {
    const events = await getEventsUseCase.execute();
    reply.send(events.map(toEventResponse));
  });

  app.get<{ Params: { eventId: string } }>("/events/:eventId", async (req, reply) => {
    const event = await getEventUseCase.execute(Number(req.params.eventId));
    reply.send(toEventResponse);
  });

  app.post<{ Body: CreateEventDto }>(
    "/events",
    { preHandler: adminOnly, schema: createEventSchema },
    async (req, reply) => {
      const user = (req as any).user;
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
      const user = (req as any).user;
      await updateEventUseCase.execute({
        eventId: Number(req.params.eventId),
        requestingUserId: user.id,
        data: {
          name: req.body.name,
          organisator: req.body.organisator,
          description: req.body.description,
          startTimestamp: req.body.start_timestamp ? new Date(req.body.start_timestamp) : undefined,
          endTimestamp: req.body.end_timestamp ? new Date(req.body.end_timestamp) : undefined,
          status: req.body.status,
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
      const user = (req as any).user;
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
      const user = (req as any).user;
      await deleteEventUseCase.execute({
        eventId: Number(req.params.eventId),
        requestingUserId: user.id,
      });
      reply.status(204).send();
    },
  );
}
