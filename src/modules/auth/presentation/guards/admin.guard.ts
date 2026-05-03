import { FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "../../../../shared/domain/value-objects/user-role.enum";
import { AuthenticatedRequest } from "../../../../shared/presentation/authenicated-request.type";

export function createAdminGuard() {
  return async function adminGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as AuthenticatedRequest).user;

    if (!user) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      reply.status(403).send({ error: "Forbidden: admin access required" });
      return;
    }
  };
}
