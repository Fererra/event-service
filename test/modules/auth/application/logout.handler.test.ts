import { LogoutCommandHandler } from "../../../../src/modules/auth/application/commands/logout.handler";
import { SignupCommandHandler } from "../../../../src/modules/auth/application/commands/signup.handler";
import { UnauthorizedError } from "../../../../src/shared/domain/errors/domain.error";
import { InMemoryUserRepository, InMemoryRefreshTokenRepository } from "./in-memory.repositories";
import { FakePasswordService, FakeTokenService } from "./fakes";

describe("LogoutCommandHandler", () => {
  let userRepo: InMemoryUserRepository;
  let refreshTokenRepo: InMemoryRefreshTokenRepository;
  let tokenService: FakeTokenService;
  let logoutCommandHandler: LogoutCommandHandler;
  let signupCommandHandler: SignupCommandHandler;

  let validRefreshToken: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    refreshTokenRepo = new InMemoryRefreshTokenRepository();
    tokenService = new FakeTokenService();
    const passwordService = new FakePasswordService();

    logoutCommandHandler = new LogoutCommandHandler(refreshTokenRepo, tokenService);
    signupCommandHandler = new SignupCommandHandler(
      userRepo,
      refreshTokenRepo,
      passwordService,
      tokenService,
    );

    const result = await signupCommandHandler.handle({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });
    validRefreshToken = result.tokens.refreshToken;
  });

  it("invalidates refresh token on logout", async () => {
    await logoutCommandHandler.handle({ refreshToken: validRefreshToken });

    const tokenHash = tokenService.hashToken(validRefreshToken);
    const stored = await refreshTokenRepo.findByTokenHash(tokenHash);
    expect(stored?.isRevoked()).toBe(true);
  });

  it("does not throw for a valid token", async () => {
    await expect(
      logoutCommandHandler.handle({ refreshToken: validRefreshToken }),
    ).resolves.not.toThrow();
  });

  it("throws UnauthorizedError when token is not found", async () => {
    await expect(
      logoutCommandHandler.handle({ refreshToken: "refresh.nonexistent.user" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws DomainError on repeated logout with the same token", async () => {
    await logoutCommandHandler.handle({ refreshToken: validRefreshToken });

    await expect(
      logoutCommandHandler.handle({ refreshToken: validRefreshToken }),
    ).rejects.toThrow();
  });
});
