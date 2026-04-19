import { FastifyRequest, FastifyReply } from "fastify";
import { TokenService } from "../../application/ports/token.service";
import { UnauthorizedError } from "../../../../shared/domain/errors/domain.error";

export function createJwtGuard(tokenService: TokenService) {
  return async function jwtGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const authHeader = request.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      reply
        .status(401)
        .send({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = tokenService.verifyAccessToken(token);

      if (payload.type !== "access") {
        throw new UnauthorizedError("Invalid token type");
      }

      (request as any).user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      reply.status(401).send({ error: "Invalid or expired access token" });
    }
  };
}
