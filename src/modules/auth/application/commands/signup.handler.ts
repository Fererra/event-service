import { randomUUID } from "crypto";
import { User } from "../../domain/entities/user.entity";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { UserRole } from "../../../../shared/domain/value-objects/user-role.enum";
import { ConflictError } from "../../../../shared/domain/errors/domain.error";
import { UserRepository } from "../../domain/repositories/user.repository";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { PasswordService } from "../ports/password.service";
import { TokenService, TokenPair } from "../ports/token.service";

export interface SignupCommand {
  email: string;
  nickname: string;
  password: string;
}

export interface SignupResult {
  tokens: TokenPair;
  userId: string;
}

export class SignupCommandHandler {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async handle(command: SignupCommand): Promise<SignupResult> {
    const email = Email.create(command.email);

    const emailTaken = await this.userRepo.existsByEmail(email);
    if (emailTaken) {
      throw new ConflictError(`Email ${email.value} is already registered`);
    }

    const nicknameTaken = await this.userRepo.existsByNickname(command.nickname);
    if (nicknameTaken) {
      throw new ConflictError(`Nickname ${command.nickname} is already taken`);
    }

    const passwordHash = await this.passwordService.hash(command.password);

    const user = User.create({
      id: randomUUID(),
      email,
      nickname: command.nickname,
      passwordHash,
      role: UserRole.USER,
      createdAt: new Date(),
    });

    await this.userRepo.save(user);

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
