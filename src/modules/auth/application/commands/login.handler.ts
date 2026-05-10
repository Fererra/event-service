import { randomUUID } from "crypto";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { UnauthorizedError } from "../../../../shared/domain/errors/domain.error";
import { UserRepository } from "../../domain/repositories/user.repository";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { PasswordService } from "../ports/password.service";
import { TokenService, TokenPair } from "../ports/token.service";

export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResult {
  tokens: TokenPair;
  userId: string;
}

export class LoginCommandHandler {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async handle(command: LoginCommand): Promise<LoginResult> {
    const email = Email.create(command.email);

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const passwordValid = await this.passwordService.verify(command.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const tokens = this.tokenService.generateTokenPair(user.id, user.email.value, user.role);

    const tokenHash = this.tokenService.hashToken(tokens.refreshToken);
    const refreshToken = RefreshToken.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.refreshTokenRepo.save(refreshToken);

    return { tokens, userId: user.id };
  }
}
