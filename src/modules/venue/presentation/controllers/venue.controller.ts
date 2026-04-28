import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  CreateVenueUseCase,
  CreateVenueCommand,
} from "../../application/use-cases/create-venue.use-case";
import { CreateVenueSchema, CreateVenueDto } from "../dto/venue.dto";
import { createAdminGuard } from "../../../auth/presentation/guards/admin.guard";
import { JwtTokenService } from "../../../auth/infrastructure/services/jwt-token.service";

export function venueRoutes(
  fastify: FastifyInstance,
  createVenueUseCase: CreateVenueUseCase,
  tokenService: JwtTokenService,
) {
  const adminGuard = createAdminGuard();

  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ error: "Missing authorization header" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = tokenService.verifyAccessToken(token);
      (request as any).user = payload;
    } catch (err) {
      return reply.code(401).send({ error: "Invalid or expired token" });
    }
  };

  fastify.post<{ Body: CreateVenueDto }>(
    "/venues",
    {
      schema: CreateVenueSchema,
      preHandler: [authenticate, adminGuard],
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
}
