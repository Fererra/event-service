import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  CreateVenueUseCase,
  CreateVenueCommand,
} from "../../application/use-cases/create-venue.use-case";
import { GetAllVenuesUseCase } from "../../application/use-cases/get-venues.use-case";
import { GetVenueByIdUseCase } from "../../application/use-cases/get-venue-by-id.use-case";
import {
  UpdateVenueUseCase,
  UpdateVenueCommand,
} from "../../application/use-cases/update-venue.use-case";
import {
  CreateVenueSchema,
  CreateVenueDto,
  GetVenueByIdSchema,
  GetVenueByIdDto,
  UpdateVenueSchema,
  UpdateVenueDto,
} from "../dto/venue.dto";
import { createAdminGuard } from "../../../auth/presentation/guards/admin.guard";
import { createJwtGuard } from "../../../auth/presentation/guards/jwt.guard";

import { JwtTokenService } from "../../../auth/infrastructure/services/jwt-token.service";

export function venueRoutes(
  fastify: FastifyInstance,
  createVenueUseCase: CreateVenueUseCase,
  getAllVenuesUseCase: GetAllVenuesUseCase,
  getVenueByIdUseCase: GetVenueByIdUseCase,
  updateVenueUseCase: UpdateVenueUseCase,
  tokenService: JwtTokenService,
) {
  const adminGuard = createAdminGuard();
  const jwtGuard = createJwtGuard(tokenService);

  fastify.post<{ Body: CreateVenueDto }>(
    "/venues",
    {
      schema: CreateVenueSchema,
      preHandler: [jwtGuard, adminGuard],
    },
    async (request, reply) => {
      try {
        const command: CreateVenueCommand = {
          name: request.body.name,
          capacity: request.body.capacity ?? null,
          address: request.body.address,
        };

        const venueId = await createVenueUseCase.execute(command);
        return reply.code(201).send({ id: venueId });
      } catch (error: any) {
        if (error.name === "DomainError") {
          return reply.code(400).send({ error: error.message });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.get(
    "/venues",
    { preHandler: [jwtGuard, adminGuard] },
    async (request, reply) => {
      try {
        const venues = await getAllVenuesUseCase.execute();
        return reply.code(200).send(venues);
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    },
  );

  fastify.get<{ Params: GetVenueByIdDto["Params"] }>(
    "/venues/:venueId",
    {
      schema: GetVenueByIdSchema,
      preHandler: [jwtGuard, adminGuard],
    },
    async (request, reply) => {
      try {
        const venue = await getVenueByIdUseCase.execute(request.params.venueId);
        return reply.code(200).send(venue);
      } catch (error: any) {
        if (error.message === "Venue not found") {
          return reply.code(404).send({ error: error.message });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    },
  );
}
