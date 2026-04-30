import { FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "../../domain/value-objects/user-role.vo";

export function createAdminGuard() {
  return async function adminGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (request as any).user;

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
