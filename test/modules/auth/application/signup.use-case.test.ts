import { SignupUseCase } from "../../../../src/modules/auth/application/commands/signup.use-case";
import {
  ConflictError,
  DomainError,
} from "../../../../src/shared/domain/errors/domain.error";
import {
  InMemoryUserRepository,
  InMemoryRefreshTokenRepository,
} from "./in-memory.repositories";
import { FakePasswordService, FakeTokenService } from "./fakes";

describe("SignupUseCase", () => {
  let userRepo: InMemoryUserRepository;
  let refreshTokenRepo: InMemoryRefreshTokenRepository;
  let passwordService: FakePasswordService;
  let tokenService: FakeTokenService;
  let useCase: SignupUseCase;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    refreshTokenRepo = new InMemoryRefreshTokenRepository();
    passwordService = new FakePasswordService();
    tokenService = new FakeTokenService();
    useCase = new SignupUseCase(
      userRepo,
      refreshTokenRepo,
      passwordService,
      tokenService,
    );
  });

  it("registers a new user and returns tokens", async () => {
    const result = await useCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });

    expect(result.userId).toBeDefined();
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it("stores the user in the repository", async () => {
    await useCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });

    const users = userRepo.getAll();
    expect(users).toHaveLength(1);
    expect(users[0].email.value).toBe("user@example.com");
    expect(users[0].nickname).toBe("johndoe");
  });

  it("stores the password hash, not the raw password", async () => {
    await useCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });

    const user = userRepo.getAll()[0];
    expect(user.passwordHash).toBe("hashed:password123");
    expect(user.passwordHash).not.toBe("password123");
  });

  it("stores the refresh token in the repository", async () => {
    await useCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });

    const tokens = refreshTokenRepo.getAll();
    expect(tokens).toHaveLength(1);
    expect(tokens[0].isValid()).toBe(true);
  });

  it("assigns the USER role by default", async () => {
    await useCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });

    const user = userRepo.getAll()[0];
    expect(user.isAdmin()).toBe(false);
  });

  it("throws ConflictError when email is already taken", async () => {
    await useCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });

    await expect(
      useCase.execute({
        email: "user@example.com",
        nickname: "other",
        password: "password123",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws ConflictError when nickname is already taken", async () => {
    await useCase.execute({
      email: "user@example.com",
      nickname: "johndoe",
      password: "password123",
    });

    await expect(
      useCase.execute({
        email: "other@example.com",
        nickname: "johndoe",
        password: "password123",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws DomainError when email is invalid", async () => {
    await expect(
      useCase.execute({
        email: "not-an-email",
        nickname: "johndoe",
        password: "password123",
      }),
    ).rejects.toThrow(DomainError);
  });

  it("does not store anything for an invalid email", async () => {
    await expect(
      useCase.execute({
        email: "bad-email",
        nickname: "johndoe",
        password: "password123",
      }),
    ).rejects.toThrow();

    expect(userRepo.getAll()).toHaveLength(0);
    expect(refreshTokenRepo.getAll()).toHaveLength(0);
  });
});
