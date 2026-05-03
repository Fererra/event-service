import { FastifyRequest } from "fastify";

export type AuthenticatedRequest = FastifyRequest & {
  user: {
    id: string;
    email: string;
    role: string;
  };
};
