import { FastifyInstance, preHandlerHookHandler } from "fastify";
import { CreateRegistrationUseCase } from "../../application/use-cases/create-registration.use-case";
import { GetUserRegistrationsUseCase } from "../../application/use-cases/get-user-registrations.use-case";
import { GetUserRegistrationUseCase } from "../../application/use-cases/get-user-registration.use-case";
import { GetEventRegistrationsUseCase } from "../../application/use-cases/get-event-registrations.use-case";
import { GetEventRegistrationUseCase } from "../../application/use-cases/get-event-registration.use-case";
import { CancelRegistrationUseCase } from "../../application/use-cases/cancel-registration.use-case";

import {
  CancelRegistrationRoute,
  CancelRegistrationSchema,
  CreateRegistrationRoute,
  CreateRegistrationSchema,
  GetEventRegistrationRoute,
  GetEventRegistrationSchema,
  GetEventRegistrationsRoute,
  GetEventRegistrationsSchema,
  GetRegistrationsCountRoute,
  GetRegistrationsCountSchema,
  GetUserRegistrationRoute,
  GetUserRegistrationSchema,
  GetUserRegistrationsRoute,
  GetUserRegistrationsSchema,
} from "../../presentation/dto/registration.dto";
import { RegistrationDtoMapper } from "../mappers/registration-dto.mapper";
import { GetRegistrationsCountUseCase } from "../../application/use-cases/get-registrations-count.use-case";
import { parseUserRole } from "../../../../shared/domain/value-objects/user-role.enum";

export interface RegistrationUseCases {
  createRegistrationUseCase: CreateRegistrationUseCase;
  getUserRegistrationsUseCase: GetUserRegistrationsUseCase;
  getUserRegistrationUseCase: GetUserRegistrationUseCase;
  getEventRegistrationsUseCase: GetEventRegistrationsUseCase;
  getEventRegistrationUseCase: GetEventRegistrationUseCase;
  cancelRegistrationUseCase: CancelRegistrationUseCase;
  getRegistrationsCountUseCase: GetRegistrationsCountUseCase;
}

export interface RegistrationRouteGuards {
  jwtGuard: preHandlerHookHandler;
  adminGuard: preHandlerHookHandler;
}

export function registerRegistrationRoutes(
  app: FastifyInstance,
  useCases: RegistrationUseCases,
  guards: RegistrationRouteGuards,
) {
  const {
    createRegistrationUseCase,
    getUserRegistrationsUseCase,
    getUserRegistrationUseCase,
    getEventRegistrationsUseCase,
    getEventRegistrationUseCase,
    cancelRegistrationUseCase,
    getRegistrationsCountUseCase,
  } = useCases;
  const adminGuard = guards.adminGuard;
  const jwtGuard = guards.jwtGuard;

  app.post<CreateRegistrationRoute>(
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
          registration_timestamp: registration.registrationTimestamp.toISOString(),
        },
        event: {
          event_id: Number(req.params.eventId),
        },
      });
    },
  );

  app.get<GetUserRegistrationsRoute>(
    "/users/:userId/registrations",
    { preHandler: [jwtGuard], schema: GetUserRegistrationsSchema },
    async (req, reply) => {
      const user = (req as any).user;

      const registrations = await getUserRegistrationsUseCase.execute(
        req.params.userId,
        user.id,
        parseUserRole(user.role),
      );

      return reply.send(RegistrationDtoMapper.toDtoList(registrations));
    },
  );

  app.get<GetUserRegistrationRoute>(
    "/users/:userId/registrations/:registrationId",
    { preHandler: [jwtGuard], schema: GetUserRegistrationSchema },
    async (req, reply) => {
      const user = (req as any).user;

      const registration = await getUserRegistrationUseCase.execute(
        req.params.registrationId,
        req.params.userId,
        parseUserRole(user.role),
      );

      return reply.send(RegistrationDtoMapper.toDto(registration));
    },
  );

  app.get<GetEventRegistrationsRoute>(
    "/events/:eventId/registrations",
    { preHandler: [jwtGuard, adminGuard], schema: GetEventRegistrationsSchema },
    async (req, reply) => {
      const registrations = await getEventRegistrationsUseCase.execute(Number(req.params.eventId));

      return reply.send(RegistrationDtoMapper.toDtoList(registrations));
    },
  );

  app.get<GetEventRegistrationRoute>(
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

  app.get<GetRegistrationsCountRoute>(
    "/events/:eventId/tickets/:ticketId/registrations/count",
    { preHandler: [jwtGuard, adminGuard], schema: GetRegistrationsCountSchema },
    async (req, reply) => {
      const count = await getRegistrationsCountUseCase.execute(
        Number(req.params.eventId),
        Number(req.params.ticketId),
      );

      return reply.send({
        eventId: req.params.eventId,
        ticketId: req.params.ticketId,
        count,
      });
    },
  );

  app.delete<CancelRegistrationRoute>(
    "/users/:userId/registrations/:registrationId",
    { preHandler: [jwtGuard], schema: CancelRegistrationSchema },
    async (req, reply) => {
      const user = (req as any).user;

      await cancelRegistrationUseCase.execute(
        req.params.registrationId,
        user.id,
        parseUserRole(user.role),
      );

      return reply.status(204).send();
    },
  );
}
