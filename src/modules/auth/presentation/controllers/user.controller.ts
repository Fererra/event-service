// presentation/controllers/user.controller.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { GetMeQueryHandler } from "../../application/queries/get-me.query-handler";
import { GetUserQueryHandler } from "../../application/queries/get-user.query-handler";
import { GetUsersQueryHandler } from "../../application/queries/get-users.query-handler";
import { getUserSchema } from "../dto/user.dto";

export interface UserQueryHandlers {
  getMeHandler: GetMeQueryHandler;
  getUserHandler: GetUserQueryHandler;
  getUsersHandler: GetUsersQueryHandler;
}

export function registerUserRoutes(
  app: FastifyInstance,
  handlers: UserQueryHandlers,
  guards: {
    jwtGuard: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    adminGuard: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  },
): void {
  const { getMeHandler, getUserHandler, getUsersHandler } = handlers;
  const { jwtGuard, adminGuard } = guards;

  app.get(
    "/auth/me",
    { preHandler: [jwtGuard] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const user = (req as any).user;

      const profile = await getMeHandler.handle({ userId: user.id });

      return reply.send(profile);
    },
  );

  app.get(
    "/users",
    { preHandler: [jwtGuard, adminGuard] },
    async (_req: FastifyRequest, reply: FastifyReply) => {
      const result = await getUsersHandler.handle();
      return reply.send(result);
    },
  );

  app.get<{ Params: { userId: string } }>(
    "/users/:userId",
    { preHandler: [jwtGuard, adminGuard], schema: getUserSchema },
    async (req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
      const profile = await getUserHandler.handle({ userId: req.params.userId });
      return reply.send(profile);
    },
  );
}
