import { RefreshTokensCommandHandler } from "../../../../src/modules/auth/application/commands/refresh-tokens.handler";
import { SignupCommandHandler } from "../../../../src/modules/auth/application/commands/signup.handler";
import { UnauthorizedError } from "../../../../src/shared/domain/errors/domain.error";
import { InMemoryUserRepository, InMemoryRefreshTokenRepository } from "./in-memory.repositories";
import { FakePasswordService, FakeTokenService } from "./fakes";

describe("RefreshTokensCommandHandler", () => {
  let userRepo: InMemoryUserRepository;
  let refreshTokenRepo: InMemoryRefreshTokenRepository;
  let tokenService: FakeTokenService;
  let refreshCommandHandler: RefreshTokensCommandHandler;
  let signupCommandHandler: SignupCommandHandler;

  let userId: string;
  let validRefreshToken: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    refreshTokenRepo = new InMemoryRefreshTokenRepository();
    tokenService = new FakeTokenService();
    const passwordService = new FakePasswordService();

    refreshCommandHandler = new RefreshTokensCommandHandler(
      userRepo,
      refreshTokenRepo,
      tokenService,
    );
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
    userId = result.userId;
    validRefreshToken = result.tokens.refreshToken;
  });

  it("returns a new token pair", async () => {
    const tokens = await refreshCommandHandler.handle({
      refreshToken: validRefreshToken,
    });

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it("invalidates the old refresh token (rotation strategy)", async () => {
    await refreshCommandHandler.handle({ refreshToken: validRefreshToken });

    const oldHash = tokenService.hashToken(validRefreshToken);
    const oldToken = await refreshTokenRepo.findByTokenHash(oldHash);
    expect(oldToken?.isRevoked()).toBe(true);
  });

  it("stores the new refresh token in the repository", async () => {
    const countBefore = refreshTokenRepo.getAll().length;

    await refreshCommandHandler.handle({ refreshToken: validRefreshToken });

    expect(refreshTokenRepo.getAll().length).toBe(countBefore + 1);
  });

  it("new refresh token is valid", async () => {
    const newTokens = await refreshCommandHandler.handle({
      refreshToken: validRefreshToken,
    });

    const newHash = tokenService.hashToken(newTokens.refreshToken);
    const newToken = await refreshTokenRepo.findByTokenHash(newHash);
    expect(newToken?.isValid()).toBe(true);
  });

  it("throws UnauthorizedError for an invalid token", async () => {
    await expect(refreshCommandHandler.handle({ refreshToken: "invalid-token" })).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("throws UnauthorizedError when token is not found in DB", async () => {
    await expect(
      refreshCommandHandler.handle({ refreshToken: "refresh.unknown-user.user" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when token is already revoked", async () => {
    await refreshCommandHandler.handle({ refreshToken: validRefreshToken });

    await expect(refreshCommandHandler.handle({ refreshToken: validRefreshToken })).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("throws UnauthorizedError when token is expired", async () => {
    const { RefreshToken } =
      await import("../../../../src/modules/auth/domain/entities/refresh-token.entity");
    const expiredToken = RefreshToken.create({
      id: "expired-id",
      userId,
      tokenHash: tokenService.hashToken("refresh.expired.user"),
      expiresAt: new Date(Date.now() - 1_000),
      createdAt: new Date(),
    });
    await refreshTokenRepo.save(expiredToken);

    await expect(
      refreshCommandHandler.handle({ refreshToken: "refresh.expired.user" }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
