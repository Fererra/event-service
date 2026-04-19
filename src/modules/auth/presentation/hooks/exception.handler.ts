import { FastifyInstance } from "fastify";
import {
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "../../../../shared/domain/errors/domain.error";

export function registerExceptionHandlers(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ error: error.message });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send({ error: error.message });
    }

    if (error instanceof ConflictError) {
      return reply.status(409).send({ error: error.message });
    }

    if (error instanceof DomainError) {
      return reply.status(400).send({ error: error.message });
    }

    const httpError = error as { statusCode?: number; message?: string };
    if (httpError.statusCode === 400) {
      return reply.status(400).send({
        error: "Validation failed",
        details: httpError.message,
      });
    }

    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  });
}
