import { FastifyInstance } from "fastify";
import { GetEventTicketsUseCase } from "../../application/queries/get-event-tickets.use-case";
import { CreateTicketUseCase } from "../../application/commands/create-ticket.use-case";
import { UpdateTicketUseCase } from "../../application/commands/update-ticket.use-case";
import { DeleteTicketUseCase } from "../../application/commands/delete-ticket.use-case";
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketResponseDto,
  createTicketSchema,
  updateTicketSchema,
} from "../dtos/ticket.dto";
import { Ticket } from "../../domain/entities/ticket.entity";
import { createJwtGuard } from "../../../auth/presentation/guards/jwt.guard";
import { createAdminGuard } from "../../../auth/presentation/guards/admin.guard";
import { TokenService } from "../../../auth/application/ports/token.service";

function toTicketResponse(ticket: Ticket): TicketResponseDto {
  return {
    id: ticket.id,
    event_id: ticket.eventId,
    type: ticket.type,
    limit: ticket.limit,
    price: ticket.price,
  };
}

export interface TicketUseCases {
  getEventTicketsUseCase: GetEventTicketsUseCase;
  createTicketUseCase: CreateTicketUseCase;
  updateTicketUseCase: UpdateTicketUseCase;
  deleteTicketUseCase: DeleteTicketUseCase;
}

export function registerTicketRoutes(
  app: FastifyInstance,
  useCases: TicketUseCases,
  tokenService: TokenService,
): void {
  const { getEventTicketsUseCase, createTicketUseCase, updateTicketUseCase, deleteTicketUseCase } =
    useCases;
  const jwtGuard = createJwtGuard(tokenService);
  const adminGuard = createAdminGuard();
  const adminOnly = [jwtGuard, adminGuard];

  app.get<{ Params: { eventId: string } }>("/events/:eventId/tickets", async (req, reply) => {
    const tickets = await getEventTicketsUseCase.execute(Number(req.params.eventId));
    reply.send(tickets.map(toTicketResponse));
  });

  app.post<{ Params: { eventId: string }; Body: CreateTicketDto }>(
    "/events/:eventId/tickets",
    {
      preHandler: adminOnly,
      schema: createTicketSchema,
    },
    async (req, reply) => {
      const ticket = await createTicketUseCase.execute({
        eventId: Number(req.params.eventId),
        type: req.body.type,
        limit: req.body.limit,
        price: req.body.price,
      });
      reply.status(201).send({ ticket });
    },
  );

  app.patch<{ Params: { eventId: string; ticketId: string }; Body: UpdateTicketDto }>(
    "/events/:eventId/tickets/:ticketId",
    {
      preHandler: adminOnly,
      schema: updateTicketSchema,
    },
    async (req, reply) => {
      await updateTicketUseCase.execute({
        eventId: Number(req.params.eventId),
        ticketId: Number(req.params.ticketId),
        limit: req.body.limit,
        price: req.body.price,
      });
      reply.status(204).send();
    },
  );

  app.delete<{ Params: { eventId: string; ticketId: string } }>(
    "/events/:eventId/tickets/:ticketId",
    {
      preHandler: adminOnly,
    },
    async (req, reply) => {
      await deleteTicketUseCase.execute({
        eventId: Number(req.params.eventId),
        ticketId: Number(req.params.ticketId),
      });
      reply.status(204).send();
    },
  );
}
