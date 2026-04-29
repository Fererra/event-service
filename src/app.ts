import "reflect-metadata";
import Fastify from "fastify";
import { createDataSource } from "./shared/infrastructure/database.config";
import { PostgresUserRepository } from "./modules/auth/infrastructure/repositories/postgres-user.repository";
import { PostgresRefreshTokenRepository } from "./modules/auth/infrastructure/repositories/postgres-refresh-token.repository";
import { Argon2PasswordService } from "./modules/auth/infrastructure/services/argon-password.service";
import { JwtTokenService } from "./modules/auth/infrastructure/services/jwt-token.service";
import { SignupUseCase } from "./modules/auth/application/commands/signup.use-case";
import { LoginUseCase } from "./modules/auth/application/commands/login.use-case";
import { LogoutUseCase } from "./modules/auth/application/commands/logout.use-case";
import { RefreshTokensUseCase } from "./modules/auth/application/commands/refresh-tokens.use-case";
import { registerAuthRoutes } from "./modules/auth/presentation/controllers/auth.controller";
import { registerExceptionHandlers } from "./modules/auth/presentation/hooks/exception.handler";
import { UserOrmEntity } from "./modules/auth/infrastructure/orm/entities/user.orm-entity";
import { RefreshTokenOrmEntity } from "./modules/auth/infrastructure/orm/entities/refresh-token.orm-entity";
import { venueRoutes } from "./modules/venue/presentation/controllers/venue.controller";
import { CreateVenueUseCase } from "./modules/venue/application/use-cases/create-venue.use-case";
import { GetAllVenuesUseCase } from "./modules/venue/application/use-cases/get-venues.use-case";
import { GetVenueByIdUseCase } from "./modules/venue/application/use-cases/get-venue-by-id.use-case";
import { PostgresVenueRepository } from "./modules/venue/infrastructure/repositories/postgres-venue.repository";
import { VenueOrmEntity } from "./modules/venue/infrastructure/orm/entities/venue.orm-entity";

async function bootstrap() {
  const config = {
    port: Number(process.env.PORT) || 3000,
    db: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "auth_db",
    },
    jwt: {
      accessSecret:
        process.env.JWT_ACCESS_SECRET || "access-secret-change-in-prod",
      refreshSecret:
        process.env.JWT_REFRESH_SECRET || "refresh-secret-change-in-prod",
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  };

  const dataSource = createDataSource(config.db);
  await dataSource.initialize();

  const userRepository = new PostgresUserRepository(
    dataSource.getRepository(UserOrmEntity),
  );
  const refreshTokenRepository = new PostgresRefreshTokenRepository(
    dataSource.getRepository(RefreshTokenOrmEntity),
  );

  const passwordService = new Argon2PasswordService();
  const tokenService = new JwtTokenService(config.jwt);

  const signupUseCase = new SignupUseCase(
    userRepository,
    refreshTokenRepository,
    passwordService,
    tokenService,
  );
  const loginUseCase = new LoginUseCase(
    userRepository,
    refreshTokenRepository,
    passwordService,
    tokenService,
  );
  const logoutUseCase = new LogoutUseCase(refreshTokenRepository, tokenService);
  const refreshTokensUseCase = new RefreshTokensUseCase(
    userRepository,
    refreshTokenRepository,
    tokenService,
  );

  const venueRepository = new PostgresVenueRepository(
    dataSource.getRepository(VenueOrmEntity),
  );
  const createVenueUseCase = new CreateVenueUseCase(venueRepository);
  const getAllVenuesUseCase = new GetAllVenuesUseCase(venueRepository);
  const getVenueByIdUseCase = new GetVenueByIdUseCase(venueRepository);

  const app = Fastify({ logger: true });

  venueRoutes(
    app,
    createVenueUseCase,
    getAllVenuesUseCase,
    getVenueByIdUseCase,
    tokenService,
  );

  registerExceptionHandlers(app);

  registerAuthRoutes(app, {
    signupUseCase,
    loginUseCase,
    logoutUseCase,
    refreshTokensUseCase,
  });

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server running on port ${config.port}`);
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
