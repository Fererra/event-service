import { FastifyInstance, preHandlerHookHandler } from "fastify";
import {
  CreateVenueUseCase,
  CreateVenueCommand,
} from "../../application/use-cases/create-venue.use-case";
import { GetAllVenuesUseCase } from "../../application/use-cases/get-venues.use-case";
import { GetVenueByIdUseCase } from "../../application/use-cases/get-venue-by-id.use-case";
import { DeleteVenueUseCase } from "../../application/use-cases/delete-venue.use-case";
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
  DeleteVenueSchema,
  DeleteVenueDto,
} from "../dto/venue.dto";

export interface VenueUseCases {
  createVenueUseCase: CreateVenueUseCase;
  getAllVenuesUseCase: GetAllVenuesUseCase;
  getVenueByIdUseCase: GetVenueByIdUseCase;
  updateVenueUseCase: UpdateVenueUseCase;
  deleteVenueUseCase: DeleteVenueUseCase;
}

export interface VenueRouteGuards {
  jwtGuard: preHandlerHookHandler;
  adminGuard: preHandlerHookHandler;
}

export function venueRoutes(
  app: FastifyInstance,
  useCases: VenueUseCases,
  guards: VenueRouteGuards,
) {
  const {
    createVenueUseCase,
    getAllVenuesUseCase,
    getVenueByIdUseCase,
    updateVenueUseCase,
    deleteVenueUseCase,
  } = useCases;
  const adminGuard = guards.adminGuard;
  const jwtGuard = guards.jwtGuard;

  app.post<{ Body: CreateVenueDto }>(
    "/venues",
    {
      schema: CreateVenueSchema,
      preHandler: [jwtGuard, adminGuard],
    },
    async (request, reply) => {
      const command: CreateVenueCommand = {
        name: request.body.name,
        capacity: request.body.capacity ?? null,
        address: request.body.address,
      };

      const venueId = await createVenueUseCase.execute(command);
      return reply.code(201).send({ id: venueId });
    },
  );

  app.get(
    "/venues",
    { preHandler: [jwtGuard, adminGuard] },
    async (request, reply) => {
      const venues = await getAllVenuesUseCase.execute();
      return reply.code(200).send(venues);
    },
  );

  app.get<{ Params: GetVenueByIdDto["Params"] }>(
    "/venues/:venueId",
    {
      schema: GetVenueByIdSchema,
      preHandler: [jwtGuard, adminGuard],
    },
    async (request, reply) => {
      const venue = await getVenueByIdUseCase.execute(request.params.venueId);
      return reply.code(200).send(venue);
    },
  );

  app.patch<{
    Params: UpdateVenueDto["Params"];
    Body: UpdateVenueDto["Body"];
  }>(
    "/venues/:venueId",
    {
      schema: UpdateVenueSchema,
      preHandler: [jwtGuard, adminGuard],
    },
    async (request, reply) => {
      const command: UpdateVenueCommand = {
        id: request.params.venueId,
        name: request.body.name,
        capacity: request.body.capacity,
        address: request.body.address,
      };

      await updateVenueUseCase.execute(command);

      return reply.code(204).send();
    },
  );

  app.delete<{ Params: DeleteVenueDto["Params"] }>(
    "/venues/:venueId",
    {
      schema: DeleteVenueSchema,
      preHandler: [jwtGuard, adminGuard],
    },
    async (request, reply) => {
      await deleteVenueUseCase.execute(request.params.venueId);
      return reply.code(204).send();
    },
  );
}
