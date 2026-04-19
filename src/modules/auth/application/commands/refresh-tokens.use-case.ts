import { randomUUID } from "crypto";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import {
  UnauthorizedError,
  NotFoundError,
} from "../../../../shared/domain/errors/domain.error";
import { UserRepository } from "../../domain/repositories/user.repository";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { TokenService, TokenPair } from "../ports/token.service";

export interface RefreshCommand {
  refreshToken: string;
}

export class RefreshTokensUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshCommand): Promise<TokenPair> {
    let payload: ReturnType<TokenService["verifyRefreshToken"]>;
    try {
      payload = this.tokenService.verifyRefreshToken(command.refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (payload.type !== "refresh") {
      throw new UnauthorizedError("Invalid token type");
    }

    const tokenHash = this.tokenService.hashToken(command.refreshToken);
    const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    if (!storedToken.isValid()) {
      throw new UnauthorizedError("Refresh token is expired or revoked");
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new NotFoundError(`User ${payload.sub} not found`);
    }

    storedToken.revoke();
    await this.refreshTokenRepo.update(storedToken);

    const tokens = this.tokenService.generateTokenPair(
      user.id,
      user.email.value,
      user.role,
    );

    const newTokenHash = this.tokenService.hashToken(tokens.refreshToken);
    const newRefreshToken = RefreshToken.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.refreshTokenRepo.save(newRefreshToken);

    return tokens;
  }
}
