import { LoginUseCase } from "../../../../src/modules/auth/application/commands/login.use-case";
import { SignupUseCase } from "../../../../src/modules/auth/application/commands/signup.use-case";
import { UnauthorizedError } from "../../../../src/shared/domain/errors/domain.error";
import {
  InMemoryUserRepository,
  InMemoryRefreshTokenRepository,
} from "./in-memory.repositories";
import { FakePasswordService, FakeTokenService } from "./fakes";

describe("LoginUseCase", () => {
  let userRepo: InMemoryUserRepository;
  let refreshTokenRepo: InMemoryRefreshTokenRepository;
  let passwordService: FakePasswordService;
  let tokenService: FakeTokenService;
  let loginUseCase: LoginUseCase;
  let signupUseCase: SignupUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    refreshTokenRepo = new InMemoryRefreshTokenRepository();
    passwordService = new FakePasswordService();
    tokenService = new FakeTokenService();

    loginUseCase = new LoginUseCase(
      userRepo,
      refreshTokenRepo,
      passwordService,
      tokenService,
    );
    signupUseCase = new SignupUseCase(
      userRepo,
      refreshTokenRepo,
      passwordService,
      tokenService,
    );

    await signupUseCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "correct-password",
    });
  });

  it("returns tokens for valid credentials", async () => {
    const result = await loginUseCase.execute({
      email: "user@example.com",
      password: "correct-password",
    });

    expect(result.userId).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it("stores a new refresh token after login", async () => {
    const countBefore = refreshTokenRepo.getAll().length;

    await loginUseCase.execute({
      email: "user@example.com",
      password: "correct-password",
    });

    expect(refreshTokenRepo.getAll().length).toBe(countBefore + 1);
  });

  it("accepts email in any case", async () => {
    const result = await loginUseCase.execute({
      email: "USER@EXAMPLE.COM",
      password: "correct-password",
    });

    expect(result.tokens.accessToken).toBeDefined();
  });

  it("throws UnauthorizedError for wrong password", async () => {
    await expect(
      loginUseCase.execute({
        email: "user@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when email does not exist", async () => {
    await expect(
      loginUseCase.execute({
        email: "unknown@example.com",
        password: "correct-password",
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("returns the same message for unknown email and wrong password", async () => {
    let unknownEmailError: Error | null = null;
    let wrongPasswordError: Error | null = null;

    try {
      await loginUseCase.execute({
        email: "ghost@example.com",
        password: "any",
      });
    } catch (e) {
      unknownEmailError = e as Error;
    }

    try {
      await loginUseCase.execute({
        email: "user@example.com",
        password: "wrong",
      });
    } catch (e) {
      wrongPasswordError = e as Error;
    }

    expect(unknownEmailError?.message).toBe(wrongPasswordError?.message);
  });
});
