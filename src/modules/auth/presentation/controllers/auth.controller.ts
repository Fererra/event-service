import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SignupUseCase } from "../../application/commands/signup.use-case";
import { LoginUseCase } from "../../application/commands/login.use-case";
import { LogoutUseCase } from "../../application/commands/logout.use-case";
import { RefreshTokensUseCase } from "../../application/commands/refresh-tokens.use-case";
import {
  SignupRequestDto,
  LoginRequestDto,
  LogoutRequestDto,
  RefreshRequestDto,
  signupSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
} from "../dto/auth.dto";

export function registerAuthRoutes(
  app: FastifyInstance,
  deps: {
    signupUseCase: SignupUseCase;
    loginUseCase: LoginUseCase;
    logoutUseCase: LogoutUseCase;
    refreshTokensUseCase: RefreshTokensUseCase;
  },
): void {
  app.post<{ Body: SignupRequestDto }>(
    "/auth/signup",
    { schema: signupSchema },
    async (
      request: FastifyRequest<{ Body: SignupRequestDto }>,
      reply: FastifyReply,
    ) => {
      const { email, nickname, password } = request.body;

      const result = await deps.signupUseCase.execute({
        email,
        nickname,
        password,
      });

      return reply.status(201).send({
        userId: result.userId,
        tokens: result.tokens,
      });
    },
  );

  app.post<{ Body: LoginRequestDto }>(
    "/auth/login",
    { schema: loginSchema },
    async (
      request: FastifyRequest<{ Body: LoginRequestDto }>,
      reply: FastifyReply,
    ) => {
      const { email, password } = request.body;

      const result = await deps.loginUseCase.execute({ email, password });

      return reply.status(200).send({
        userId: result.userId,
        tokens: result.tokens,
      });
    },
  );

  app.post<{ Body: LogoutRequestDto }>(
    "/auth/logout",
    { schema: logoutSchema },
    async (
      request: FastifyRequest<{ Body: LogoutRequestDto }>,
      reply: FastifyReply,
    ) => {
      await deps.logoutUseCase.execute({
        refreshToken: request.body.refreshToken,
      });
      return reply.status(204).send();
    },
  );

  app.post<{ Body: RefreshRequestDto }>(
    "/auth/refresh",
    { schema: refreshSchema },
    async (
      request: FastifyRequest<{ Body: RefreshRequestDto }>,
      reply: FastifyReply,
    ) => {
      const tokens = await deps.refreshTokensUseCase.execute({
        refreshToken: request.body.refreshToken,
      });

      return reply.status(200).send({ tokens });
    },
  );
}
