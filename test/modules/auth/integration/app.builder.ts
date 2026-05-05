import Fastify, { FastifyInstance } from "fastify";
import { SignupUseCase } from "../../../../src/modules/auth/application/commands/signup.use-case";
import { LoginUseCase } from "../../../../src/modules/auth/application/commands/login.use-case";
import { LogoutUseCase } from "../../../../src/modules/auth/application/commands/logout.use-case";
import { RefreshTokensUseCase } from "../../../../src/modules/auth/application/commands/refresh-tokens.use-case";
import { registerAuthRoutes } from "../../../../src/modules/auth/presentation/controllers/auth.controller";
import { registerExceptionHandlers } from "../../../../src/shared/presentation/exception.handler";
import {
  InMemoryUserRepository,
  InMemoryRefreshTokenRepository,
} from "../application/in-memory.repositories";
import { FakePasswordService, FakeTokenService } from "../application/fakes";

export interface TestApp {
  app: FastifyInstance;
  userRepo: InMemoryUserRepository;
  refreshTokenRepo: InMemoryRefreshTokenRepository;
  tokenService: FakeTokenService;
}

export async function buildTestApp(): Promise<TestApp> {
  const userRepo = new InMemoryUserRepository();
  const refreshTokenRepo = new InMemoryRefreshTokenRepository();
  const passwordService = new FakePasswordService();
  const tokenService = new FakeTokenService();

  const signupUseCase = new SignupUseCase(
    userRepo,
    refreshTokenRepo,
    passwordService,
    tokenService,
  );
  const loginUseCase = new LoginUseCase(userRepo, refreshTokenRepo, passwordService, tokenService);
  const logoutUseCase = new LogoutUseCase(refreshTokenRepo, tokenService);
  const refreshTokensUseCase = new RefreshTokensUseCase(userRepo, refreshTokenRepo, tokenService);

  const app = Fastify({ logger: false });

  registerExceptionHandlers(app);
  registerAuthRoutes(app, {
    signupUseCase,
    loginUseCase,
    logoutUseCase,
    refreshTokensUseCase,
  });

  await app.ready();

  return { app, userRepo, refreshTokenRepo, tokenService };
}
