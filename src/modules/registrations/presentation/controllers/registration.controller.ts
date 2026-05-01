import { FastifyInstance } from "fastify";
import { CreateRegistrationUseCase } from "../../application/use-cases/create-registration.use-case";
import {
  CreateRegistrationDto,
  createRegistrationSchema,
} from "../../presentation/dto/registration.dto";
import { createJwtGuard } from "../../../auth/presentation/guards/jwt.guard";
import { TokenService } from "../../../auth/application/ports/token.service";

export function registerRegistrationRoutes(
  app: FastifyInstance,
  createRegistrationUseCase: CreateRegistrationUseCase,
  tokenService: TokenService,
) {
  const jwtGuard = createJwtGuard(tokenService);
  const authOnly = [jwtGuard];

  app.post<{ Params: { eventId: string }; Body: CreateRegistrationDto }>(
    "/events/:eventId/registrations",
    { preHandler: authOnly, schema: createRegistrationSchema },
    async (req, reply) => {
      const user = (req as any).user;

      const registration = await createRegistrationUseCase.execute({
        eventId: Number(req.params.eventId),
        userId: user.id,
        ticketId: req.body.ticket_id,
      });

      reply.status(201).send({
        registration: {
          id: registration.id,
          user_id: registration.userId,
          ticket_id: registration.ticketId,
          registration_timestamp:
            registration.registrationTimestamp.toISOString(),
        },
        event: {
          event_id: Number(req.params.eventId),
        },
      });
    },
  );
}
