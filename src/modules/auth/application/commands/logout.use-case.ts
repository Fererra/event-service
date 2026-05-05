import { UnauthorizedError } from "../../../../shared/domain/errors/domain.error";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { TokenService } from "../ports/token.service";

export interface LogoutCommand {
  refreshToken: string;
}

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const tokenHash = this.tokenService.hashToken(command.refreshToken);
    const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    storedToken.revoke();
    await this.refreshTokenRepo.update(storedToken);
  }
}
