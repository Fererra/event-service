import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SignupCommandHandler } from "../../application/commands/signup.handler";
import { LoginCommandHandler } from "../../application/commands/login.handler";
import { LogoutCommandHandler } from "../../application/commands/logout.handler";
import { RefreshTokensCommandHandler } from "../../application/commands/refresh-tokens.handler";
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
    signupUseCase: SignupCommandHandler;
    loginUseCase: LoginCommandHandler;
    logoutUseCase: LogoutCommandHandler;
    refreshTokensUseCase: RefreshTokensCommandHandler;
  },
): void {
  app.post<{ Body: SignupRequestDto }>(
    "/auth/signup",
    { schema: signupSchema },
    async (request: FastifyRequest<{ Body: SignupRequestDto }>, reply: FastifyReply) => {
      const { email, nickname, password } = request.body;

      const result = await deps.signupUseCase.handle({
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
    async (request: FastifyRequest<{ Body: LoginRequestDto }>, reply: FastifyReply) => {
      const { email, password } = request.body;

      const result = await deps.loginUseCase.handle({ email, password });

      return reply.status(200).send({
        userId: result.userId,
        tokens: result.tokens,
      });
    },
  );

  app.post<{ Body: LogoutRequestDto }>(
    "/auth/logout",
    { schema: logoutSchema },
    async (request: FastifyRequest<{ Body: LogoutRequestDto }>, reply: FastifyReply) => {
      await deps.logoutUseCase.handle({
        refreshToken: request.body.refreshToken,
      });
      return reply.status(204).send();
    },
  );

  app.post<{ Body: RefreshRequestDto }>(
    "/auth/refresh",
    { schema: refreshSchema },
    async (request: FastifyRequest<{ Body: RefreshRequestDto }>, reply: FastifyReply) => {
      const tokens = await deps.refreshTokensUseCase.handle({
        refreshToken: request.body.refreshToken,
      });

      return reply.status(200).send({ tokens });
    },
  );
}
