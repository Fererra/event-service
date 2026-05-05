import { randomUUID } from "crypto";
import { PasswordService } from "../../../../src/modules/auth/application/ports/password.service";
import {
  TokenService,
  TokenPayload,
  TokenPair,
} from "../../../../src/modules/auth/application/ports/token.service";
import { UnauthorizedError } from "../../../../src/shared/domain/errors/domain.error";

export class FakePasswordService implements PasswordService {
  async hash(password: string): Promise<string> {
    return `hashed:${password}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return hash === `hashed:${password}`;
  }
}

export class FakeTokenService implements TokenService {
  private readonly tokens = new Map<string, TokenPayload>();

  generateTokenPair(userId: string, email: string, role: string): TokenPair {
    const accessToken = `access.${userId}.${role}.${randomUUID()}`;
    const refreshToken = `refresh.${userId}.${role}.${randomUUID()}`;

    this.tokens.set(accessToken, { sub: userId, email, role, type: "access" });
    this.tokens.set(refreshToken, {
      sub: userId,
      email,
      role,
      type: "refresh",
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    const payload = this.tokens.get(token);
    if (!payload || payload.type !== "access") {
      throw new UnauthorizedError("Invalid access token");
    }
    return payload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const payload = this.tokens.get(token);
    if (!payload || payload.type !== "refresh") {
      throw new UnauthorizedError("Invalid refresh token");
    }
    return payload;
  }

  hashToken(token: string): string {
    return `hash:${token}`;
  }
}
