import { FastifyInstance } from "fastify";
import { CreateRegistrationUseCase } from "../../application/use-cases/create-registration.use-case";
import { GetUserRegistrationsUseCase } from "../../application/use-cases/get-user-registrations.use-case";
import { GetUserRegistrationUseCase } from "../../application/use-cases/get-user-registration.use-case";
import { GetEventRegistrationsUseCase } from "../../application/use-cases/get-event-registrations.use-case";
import { GetEventRegistrationUseCase } from "../../application/use-cases/get-event-registration.use-case";
import {
  CreateRegistrationDto,
  CreateRegistrationSchema,
  GetUserRegistrationsSchema,
  GetUserRegistrationsDto,
  GetUserRegistrationSchema,
  GetUserRegistrationDto,
  GetEventRegistrationsSchema,
  GetEventRegistrationsDto,
  GetEventRegistrationSchema,
  GetEventRegistrationDto,
} from "../../presentation/dto/registration.dto";
import { RegistrationDtoMapper } from "../mappers/registration-dto.mapper";
import { createAdminGuard } from "../../../auth/presentation/guards/admin.guard";
import { createJwtGuard } from "../../../auth/presentation/guards/jwt.guard";
import { JwtTokenService } from "../../../auth/infrastructure/services/jwt-token.service";

export function registerRegistrationRoutes(
  app: FastifyInstance,
  createRegistrationUseCase: CreateRegistrationUseCase,
  getUserRegistrationsUseCase: GetUserRegistrationsUseCase,
  getUserRegistrationUseCase: GetUserRegistrationUseCase,
  getEventRegistrationsUseCase: GetEventRegistrationsUseCase,
  getEventRegistrationUseCase: GetEventRegistrationUseCase,
  tokenService: JwtTokenService,
) {
  const adminGuard = createAdminGuard();
  const jwtGuard = createJwtGuard(tokenService);

  app.post<CreateRegistrationDto>(
    "/events/:eventId/registrations",
    { preHandler: jwtGuard, schema: CreateRegistrationSchema },
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

  app.get<GetUserRegistrationsDto>(
    "/users/:userId/registrations",
    { preHandler: [jwtGuard], schema: GetUserRegistrationsSchema },
    async (req, reply) => {
      const user = (req as any).user;

      if (user.role !== "admin" && user.id !== req.params.userId) {
        return reply
          .status(403)
          .send({ message: "Forbidden for another users" });
      }

      const registrations = await getUserRegistrationsUseCase.execute(
        req.params.userId,
      );

      return reply.send(RegistrationDtoMapper.toDtoList(registrations));
    },
  );

  app.get<GetUserRegistrationDto>(
    "/users/:userId/registrations/:registrationId",
    { preHandler: [jwtGuard], schema: GetUserRegistrationSchema },
    async (req, reply) => {
      const user = (req as any).user;

      if (user.role !== "admin" && user.id !== req.params.userId) {
        return reply
          .status(403)
          .send({ message: "Forbidden for another users" });
      }

      const registration = await getUserRegistrationUseCase.execute(
        req.params.registrationId,
        req.params.userId,
      );

      return reply.send(RegistrationDtoMapper.toDto(registration));
    },
  );

  app.get<GetEventRegistrationsDto>(
    "/events/:eventId/registrations",
    { preHandler: [jwtGuard, adminGuard], schema: GetEventRegistrationsSchema },
    async (req, reply) => {
      const registrations = await getEventRegistrationsUseCase.execute(
        Number(req.params.eventId),
      );

      return reply.send(RegistrationDtoMapper.toDtoList(registrations));
    },
  );

  app.get<GetEventRegistrationDto>(
    "/events/:eventId/registrations/:registrationId",
    { preHandler: [jwtGuard, adminGuard], schema: GetEventRegistrationSchema },
    async (req, reply) => {
      const registration = await getEventRegistrationUseCase.execute(
        req.params.registrationId,
        Number(req.params.eventId),
      );

      return reply.send(RegistrationDtoMapper.toDto(registration));
    },
  );
}
