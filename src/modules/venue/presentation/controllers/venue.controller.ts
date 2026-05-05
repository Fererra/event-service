import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CreateVenueCommandHandler } from "../../application/commands/create-venue/create-venue.handler";
import { CreateVenueCommand } from "../../application/commands/create-venue/create-venue.command";
import { UpdateVenueCommandHandler } from "../../application/commands/update-venue/update-venue.handler";
import { UpdateVenueCommand } from "../../application/commands/update-venue/update-venue.command";
import { DeleteVenueCommandHandler } from "../../application/commands/delete-venue/delete-venue.handler";
import { DeleteVenueCommand } from "../../application/commands/delete-venue/delete-venue.command";
import { GetAllVenuesQueryHandler } from "../../application/queries/get-all-venues/get-all-venues.handler";
import { GetAllVenuesQuery } from "../../application/queries/get-all-venues/get-all-venues.query";
import { GetVenueByIdQueryHandler } from "../../application/queries/get-venue-by-id/get-venue-by-id.handler";
import { GetVenueByIdQuery } from "../../application/queries/get-venue-by-id/get-venue-by-id.query";

import { CreateVenueRequestDto, CreateVenueSchema } from "../dto/create-venue.request.dto";
import { UpdateVenueRequestDto, UpdateVenueSchema } from "../dto/update-venue.request.dto";
import { VenueResponseSchema } from "../dto/venue.response.dto";

export interface VenueHandlers {
  createVenueHandler: CreateVenueCommandHandler;
  updateVenueHandler: UpdateVenueCommandHandler;
  deleteVenueHandler: DeleteVenueCommandHandler;
  getAllVenuesHandler: GetAllVenuesQueryHandler;
  getVenueByIdHandler: GetVenueByIdQueryHandler;
}

export interface Guards {
  jwtGuard: any;
  adminGuard: any;
}

export function venueRoutes(app: FastifyInstance, handlers: VenueHandlers, guards: Guards): void {
  app.get(
    "/venues",
    {
      preHandler: [guards.jwtGuard, guards.adminGuard],
      schema: {
        response: { 200: { type: "array", items: VenueResponseSchema } },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = new GetAllVenuesQuery();
      const venues = await handlers.getAllVenuesHandler.handle(query);
      reply.send(venues);
    },
  );

  app.get<{ Params: { id: string } }>(
    "/venues/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 200: VenueResponseSchema },
      },
      preHandler: [guards.jwtGuard, guards.adminGuard],
    },
    async (request, reply) => {
      const query = new GetVenueByIdQuery(request.params.id);
      const venue = await handlers.getVenueByIdHandler.handle(query);

      reply.send(venue);
    },
  );

  app.post<CreateVenueRequestDto>(
    "/venues",
    {
      schema: CreateVenueSchema,
      preHandler: [guards.jwtGuard, guards.adminGuard],
    },
    async (request, reply) => {
      const command = new CreateVenueCommand(
        request.body.name,
        request.body.capacity ?? null,
        request.body.address,
      );

      const venueId = await handlers.createVenueHandler.handle(command);
      reply.code(201).send({ id: venueId });
    },
  );

  app.patch<UpdateVenueRequestDto>(
    "/venues/:id",
    {
      schema: UpdateVenueSchema,
      preHandler: [guards.jwtGuard, guards.adminGuard],
    },
    async (request, reply) => {
      const command = new UpdateVenueCommand(
        request.params.id,
        request.body.name,
        request.body.capacity ?? null,
        request.body.address,
      );

      await handlers.updateVenueHandler.handle(command);
      reply.code(204).send();
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/venues/:id",
    {
      preHandler: [guards.jwtGuard, guards.adminGuard],
    },
    async (request, reply) => {
      const command = new DeleteVenueCommand(request.params.id);
      await handlers.deleteVenueHandler.handle(command);
      reply.code(204).send();
    },
  );
}
