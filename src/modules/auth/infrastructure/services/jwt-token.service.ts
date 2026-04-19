import { createHmac } from "crypto";
import jwt from "jsonwebtoken";
import {
  TokenService,
  TokenPayload,
  TokenPair,
} from "../../application/ports/token.service";
import { UnauthorizedError } from "../../../../shared/domain/errors/domain.error";

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export class JwtTokenService implements TokenService {
  constructor(private readonly config: JwtConfig) {}

  generateTokenPair(userId: string, email: string, role: string): TokenPair {
    const accessToken = jwt.sign(
      { sub: userId, email, role, type: "access" },
      this.config.accessSecret,
      { expiresIn: this.config.accessExpiresIn } as jwt.SignOptions,
    );

    const refreshToken = jwt.sign(
      { sub: userId, email, role, type: "refresh" },
      this.config.refreshSecret,
      { expiresIn: this.config.refreshExpiresIn } as jwt.SignOptions,
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.config.accessSecret) as TokenPayload;
    } catch {
      throw new UnauthorizedError("Access token is invalid or expired");
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.config.refreshSecret) as TokenPayload;
    } catch {
      throw new UnauthorizedError("Refresh token is invalid or expired");
    }
  }

  hashToken(token: string): string {
    return createHmac("sha256", this.config.refreshSecret)
      .update(token)
      .digest("hex");
  }
}
