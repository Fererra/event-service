import { LogoutUseCase } from "../../../../src/modules/auth/application/commands/logout.use-case";
import { SignupUseCase } from "../../../../src/modules/auth/application/commands/signup.use-case";
import { UnauthorizedError } from "../../../../src/shared/domain/errors/domain.error";
import {
  InMemoryUserRepository,
  InMemoryRefreshTokenRepository,
} from "./in-memory.repositories";
import { FakePasswordService, FakeTokenService } from "./fakes";

describe("LogoutUseCase", () => {
  let userRepo: InMemoryUserRepository;
  let refreshTokenRepo: InMemoryRefreshTokenRepository;
  let tokenService: FakeTokenService;
  let logoutUseCase: LogoutUseCase;
  let signupUseCase: SignupUseCase;

  let validRefreshToken: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    refreshTokenRepo = new InMemoryRefreshTokenRepository();
    tokenService = new FakeTokenService();
    const passwordService = new FakePasswordService();

    logoutUseCase = new LogoutUseCase(refreshTokenRepo, tokenService);
    signupUseCase = new SignupUseCase(
      userRepo,
      refreshTokenRepo,
      passwordService,
      tokenService,
    );

    const result = await signupUseCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });
    validRefreshToken = result.tokens.refreshToken;
  });

  it("invalidates refresh token on logout", async () => {
    await logoutUseCase.execute({ refreshToken: validRefreshToken });

    const tokenHash = tokenService.hashToken(validRefreshToken);
    const stored = await refreshTokenRepo.findByTokenHash(tokenHash);
    expect(stored?.isRevoked()).toBe(true);
  });

  it("does not throw for a valid token", async () => {
    await expect(
      logoutUseCase.execute({ refreshToken: validRefreshToken }),
    ).resolves.not.toThrow();
  });

  it("throws UnauthorizedError when token is not found", async () => {
    await expect(
      logoutUseCase.execute({ refreshToken: "refresh.nonexistent.user" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws DomainError on repeated logout with the same token", async () => {
    await logoutUseCase.execute({ refreshToken: validRefreshToken });

    await expect(
      logoutUseCase.execute({ refreshToken: validRefreshToken }),
    ).rejects.toThrow();
  });
});
