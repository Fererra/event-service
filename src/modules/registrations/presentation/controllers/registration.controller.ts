import { FastifyInstance, preHandlerHookHandler } from "fastify";
import { CreateRegistrationCommandHandler } from "../../application/commands/create-registration/create-registration.handler";
import { CreateRegistrationCommand } from "../../application/commands/create-registration/create-registration.command";
import { CancelRegistrationCommandHandler } from "../../application/commands/cancel-registration/cancel-registration.handler";
import { CancelRegistrationCommand } from "../../application/commands/cancel-registration/cancel-registration.command";
import { GetUserRegistrationsQueryHandler } from "../../application/queries/get-user-registrations/get-user-registrations.handler";
import { GetUserRegistrationsQuery } from "../../application/queries/get-user-registrations/get-user-registrations.query";
import { GetUserRegistrationQueryHandler } from "../../application/queries/get-user-registration/get-user-registration.handler";
import { GetUserRegistrationQuery } from "../../application/queries/get-user-registration/get-user-registration.query";
import { GetEventRegistrationsQueryHandler } from "../../application/queries/get-event-registrations/get-event-registrations.handler";
import { GetEventRegistrationsQuery } from "../../application/queries/get-event-registrations/get-event-registrations.query";
import { GetEventRegistrationQueryHandler } from "../../application/queries/get-event-registration/get-event-registration.handler";
import { GetEventRegistrationQuery } from "../../application/queries/get-event-registration/get-event-registration.query";
import { GetRegistrationsCountQueryHandler } from "../../application/queries/get-registrations-count/get-registrations-count.handler";
import { GetRegistrationsCountQuery } from "../../application/queries/get-registrations-count/get-registrations-count.query";
import { parseUserRole } from "../../../../shared/domain/value-objects/user-role.enum";
import { AuthenticatedRequest } from "../../../../shared/presentation/authenicated-request.type";

import {
  CreateRegistrationRequestDto,
  CreateRegistrationSchema,
} from "../dto/create-registration.request.dto";
import { GetUserRegistrationsSchema } from "../dto/get-user-registrations.request.dto";
import { GetUserRegistrationSchema } from "../dto/get-user-registration.request.dto";
import { GetEventRegistrationsSchema } from "../dto/get-event-registrations.request.dto";
import { GetEventRegistrationSchema } from "../dto/get-event-registration.request.dto";
import { GetRegistrationsCountSchema } from "../dto/get-registrations-count.request.dto";
import { CancelRegistrationSchema } from "../dto/cancel-registration.request.dto";

export interface RegistrationHandlers {
  createRegistrationHandler: CreateRegistrationCommandHandler;
  cancelRegistrationHandler: CancelRegistrationCommandHandler;
  getUserRegistrationsHandler: GetUserRegistrationsQueryHandler;
  getUserRegistrationHandler: GetUserRegistrationQueryHandler;
  getEventRegistrationsHandler: GetEventRegistrationsQueryHandler;
  getEventRegistrationHandler: GetEventRegistrationQueryHandler;
  getRegistrationsCountHandler: GetRegistrationsCountQueryHandler;
}

export interface RegistrationRouteGuards {
  jwtGuard: preHandlerHookHandler;
  adminGuard: preHandlerHookHandler;
}

export function registerRegistrationRoutes(
  app: FastifyInstance,
  handlers: RegistrationHandlers,
  guards: RegistrationRouteGuards,
): void {
  app.post<{ Params: { eventId: string }; Body: CreateRegistrationRequestDto }>(
    "/events/:eventId/registrations",
    { preHandler: guards.jwtGuard, schema: CreateRegistrationSchema },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;
      const command = new CreateRegistrationCommand(
        user.id,
        Number(req.params.eventId),
        req.body.ticketId,
      );

      const registrationId = await handlers.createRegistrationHandler.handle(command);

      reply.status(201).send({
        registration: { id: registrationId },
        event: { event_id: Number(req.params.eventId) },
      });
    },
  );

  app.get<{ Params: { userId: string } }>(
    "/users/:userId/registrations",
    { preHandler: guards.jwtGuard, schema: GetUserRegistrationsSchema },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;

      const query = new GetUserRegistrationsQuery(
        req.params.userId,
        user.id,
        parseUserRole(user.role),
      );

      const registrations = await handlers.getUserRegistrationsHandler.handle(query);
      reply.send(registrations);
    },
  );

  app.get<{ Params: { userId: string; registrationId: string } }>(
    "/users/:userId/registrations/:registrationId",
    { preHandler: guards.jwtGuard, schema: GetUserRegistrationSchema },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;

      const query = new GetUserRegistrationQuery(
        req.params.registrationId,
        req.params.userId,
        user.id,
        parseUserRole(user.role),
      );

      const registration = await handlers.getUserRegistrationHandler.handle(query);
      reply.send(registration);
    },
  );

  app.get<{ Params: { eventId: string } }>(
    "/events/:eventId/registrations",
    { preHandler: [guards.jwtGuard, guards.adminGuard], schema: GetEventRegistrationsSchema },
    async (req, reply) => {
      const query = new GetEventRegistrationsQuery(Number(req.params.eventId));
      const registrations = await handlers.getEventRegistrationsHandler.handle(query);

      reply.send(registrations);
    },
  );

  app.get<{ Params: { eventId: string; registrationId: string } }>(
    "/events/:eventId/registrations/:registrationId",
    { preHandler: [guards.jwtGuard, guards.adminGuard], schema: GetEventRegistrationSchema },
    async (req, reply) => {
      const query = new GetEventRegistrationQuery(
        req.params.registrationId,
        Number(req.params.eventId),
      );

      const registration = await handlers.getEventRegistrationHandler.handle(query);
      reply.send(registration);
    },
  );

  app.get<{ Params: { eventId: string; ticketId: string } }>(
    "/events/:eventId/tickets/:ticketId/registrations/count",
    { preHandler: [guards.jwtGuard, guards.adminGuard], schema: GetRegistrationsCountSchema },
    async (req, reply) => {
      const query = new GetRegistrationsCountQuery(
        Number(req.params.eventId),
        Number(req.params.ticketId),
      );

      const count = await handlers.getRegistrationsCountHandler.handle(query);

      reply.send({
        eventId: req.params.eventId,
        ticketId: req.params.ticketId,
        count,
      });
    },
  );

  app.delete<{ Params: { userId: string; registrationId: string } }>(
    "/users/:userId/registrations/:registrationId",
    { preHandler: guards.jwtGuard, schema: CancelRegistrationSchema },
    async (req, reply) => {
      const user = (req as AuthenticatedRequest).user;

      const command = new CancelRegistrationCommand(
        req.params.registrationId,
        user.id,
        parseUserRole(user.role),
      );

      await handlers.cancelRegistrationHandler.handle(command);
      reply.code(204).send();
    },
  );
}
